const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');
const connectDB = require('./config/db');
const { analyzeLectureText, chatWithLectureAssistant } = require('./services/aiService');

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;
const MAX_INPUT_LENGTH = 25000;
const ALLOWED_LANGUAGES = new Set(['English', 'Hindi', 'Hinglish']);

const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const defaultOrigins = [
  'http://localhost:8501',
  'http://localhost:5173',
  'https://dynamic-lecture-analyzer.vercel.app'
];

const corsOptions = {
  origin: allowedOrigins.length > 0 ? allowedOrigins : true,
  credentials: true
};

const lectureHistorySchema = new mongoose.Schema(
  {
    input_text: { type: String, required: true, trim: true },
    language: { type: String, default: 'English' },
    ai_output: {
      summary: { type: String, required: true },
      topics: { type: [String], default: [] },
      action_items: { type: [String], default: [] },
      keywords: { type: [String], default: [] },
      speaker_feedback: { type: String, required: true },
      notes: {
        headings: {
          type: [
            {
              title: { type: String, default: '' },
              points: { type: [String], default: [] },
              important_lines: { type: [String], default: [] }
            }
          ],
          default: []
        },
        short_notes: { type: [String], default: [] },
        detailed_notes: { type: [String], default: [] },
        timestamps: {
          type: [{ text: String, timestamp: String }],
          default: []
        }
      },
      questions: {
        mcqs: {
          type: [{ question: String, options: [String], answer: String }],
          default: []
        },
        short_questions: { type: [String], default: [] },
        viva_questions: { type: [String], default: [] }
      },
      segmentation: {
        type: [{ section: String, content: String, description: String, timestamp: String }],
        default: []
      },
      keyPoints: { type: [String], default: [] },
      explanation: { type: String, default: '' },
      sentiment: { type: String, default: 'Neutral' },
      readabilityScore: { type: Number, default: 0 },
      analysisProvider: { type: String, default: '' },
      analysisModel: { type: String, default: '' }
    },
    timestamp: { type: Date, default: Date.now }
  },
  {
    versionKey: false,
    collection: 'lecture_history'
  }
);

const LectureHistory = mongoose.models.LectureHistory || mongoose.model('LectureHistory', lectureHistorySchema);

const normalizeLanguage = (language) => {
  const value = String(language || 'English').trim();
  return ALLOWED_LANGUAGES.has(value) ? value : 'English';
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parseLimit = (value, fallback = 20, max = 100) => {
  const parsed = Number.parseInt(String(value || fallback), 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, 1), max);
};

const flattenKeywords = (entry) => {
  return [
    ...(entry.ai_output?.keywords || []),
    ...(entry.ai_output?.topics || []),
    ...(entry.ai_output?.notes?.headings || [])
  ]
    .filter(Boolean)
    .slice(0, 16);
};

connectDB();

app.use(cors(corsOptions));
app.use(express.json({ limit: '2mb' }));

app.get('/', (req, res) => {
  res.json({
    ok: true,
    service: 'dynamic-lecture-analyzer-backend',
    health: '/health',
    analyze: '/api/analyze',
    history: '/api/history',
    chat: '/api/chat',
    stats: '/api/stats',
    search: '/api/search',
    export: '/api/export/:id'
  });
});

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'dynamic-lecture-analyzer-backend' });
});

app.post('/api/analyze', async (req, res) => {
  try {
    const rawText = req.body?.text;
    const language = normalizeLanguage(req.body?.language);

    if (typeof rawText !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'text must be a string'
      });
    }

    const text = rawText.trim();

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'text is required'
      });
    }

    if (text.length > MAX_INPUT_LENGTH) {
      return res.status(413).json({
        success: false,
        message: `text exceeds maximum length of ${MAX_INPUT_LENGTH} characters`
      });
    }

    const aiOutput = await analyzeLectureText(text, { language });

    if (aiOutput?.moderated) {
      return res.status(400).json({
        success: false,
        message: aiOutput.error || aiOutput.summary || 'Content is restricted and cannot be analyzed.'
      });
    }

    const saved = await LectureHistory.create({
      input_text: text,
      language,
      ai_output: {
        summary: aiOutput.summary,
        topics: Array.isArray(aiOutput.topics) ? aiOutput.topics : [],
        action_items: Array.isArray(aiOutput.action_items) ? aiOutput.action_items : [],
        keywords: Array.isArray(aiOutput.keywords) ? aiOutput.keywords : [],
        speaker_feedback: aiOutput.speaker_feedback || '',
        notes: {
            headings: Array.isArray(aiOutput.notes?.headings)
              ? aiOutput.notes.headings.map((item) => ({
                title: String(item?.title || ''),
                points: Array.isArray(item?.points) ? item.points : [],
                important_lines: Array.isArray(item?.important_lines) ? item.important_lines : []
              }))
              : [],
          short_notes: Array.isArray(aiOutput.notes?.short_notes) ? aiOutput.notes.short_notes : [],
          detailed_notes: Array.isArray(aiOutput.notes?.detailed_notes) ? aiOutput.notes.detailed_notes : [],
          timestamps: Array.isArray(aiOutput.notes?.timestamps) ? aiOutput.notes.timestamps : []
        },
        questions: {
          mcqs: Array.isArray(aiOutput.questions?.mcqs) ? aiOutput.questions.mcqs : [],
          short_questions: Array.isArray(aiOutput.questions?.short_questions) ? aiOutput.questions.short_questions : [],
          viva_questions: Array.isArray(aiOutput.questions?.viva_questions) ? aiOutput.questions.viva_questions : []
        },
          segmentation: Array.isArray(aiOutput.segmentation)
            ? aiOutput.segmentation.map((item) => ({
              section: String(item?.section || ''),
              content: String(item?.content || item?.description || ''),
              description: String(item?.description || item?.content || ''),
              ...(item?.timestamp ? { timestamp: String(item.timestamp) } : {})
            }))
            : [],
        keyPoints: Array.isArray(aiOutput.keyPoints) ? aiOutput.keyPoints : [],
        explanation: String(aiOutput.explanation || ''),
        sentiment: String(aiOutput.sentiment || 'Neutral'),
        readabilityScore: Number(aiOutput.readabilityScore || 0),
        analysisProvider: String(aiOutput.analysisProvider || ''),
        analysisModel: String(aiOutput.analysisModel || '')
      },
      timestamp: new Date()
    });

    return res.status(200).json({
      success: true,
      data: {
        id: saved._id,
        input_text: saved.input_text,
        language: saved.language,
        ai_output: saved.ai_output,
        timestamp: saved.timestamp
      }
    });
  } catch (error) {
    console.error('Analyze route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to analyze lecture text'
    });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const message = String(req.body?.message || '').trim();
    const contextText = String(req.body?.context_text || '').trim();
    const language = normalizeLanguage(req.body?.language);
    const history = Array.isArray(req.body?.history) ? req.body.history : [];

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'message is required'
      });
    }

    const chat = await chatWithLectureAssistant({
      message,
      contextText,
      language,
      history
    });

    return res.status(200).json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Chat route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process chat request'
    });
  }
});

app.get('/api/history', async (req, res) => {
  try {
    const limit = parseLimit(req.query.limit, 20, 100);

    const history = await LectureHistory.find({})
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    console.error('History route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch history'
    });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const aggregate = await LectureHistory.aggregate([
      {
        $group: {
          _id: null,
          totalLecturesProcessed: { $sum: 1 },
          totalQuestionsGenerated: {
            $sum: {
              $add: [
                { $size: { $ifNull: ['$ai_output.questions.mcqs', []] } },
                { $size: { $ifNull: ['$ai_output.questions.short_questions', []] } },
                { $size: { $ifNull: ['$ai_output.questions.viva_questions', []] } }
              ]
            }
          }
        }
      }
    ]);

    const stats = aggregate[0] || {
      totalLecturesProcessed: 0,
      totalQuestionsGenerated: 0
    };

    return res.status(200).json({
      success: true,
      data: {
        total_lectures_processed: stats.totalLecturesProcessed,
        total_questions_generated: stats.totalQuestionsGenerated
      }
    });
  } catch (error) {
    console.error('Stats route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch stats'
    });
  }
});

app.get('/api/search', async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    const limit = parseLimit(req.query.limit, 10, 50);

    if (q.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'q must be at least 2 characters'
      });
    }

    const regex = new RegExp(escapeRegex(q), 'i');

    const results = await LectureHistory.find({
      $or: [
        { input_text: regex },
        { 'ai_output.summary': regex },
        { 'ai_output.topics': regex },
        { 'ai_output.keywords': regex },
        { 'ai_output.speaker_feedback': regex },
        { 'ai_output.notes.short_notes': regex },
        { 'ai_output.notes.detailed_notes': regex }
      ]
    })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      count: results.length,
      data: results.map((entry) => ({
        id: entry._id,
        timestamp: entry.timestamp,
        language: entry.language || 'English',
        summary: entry.ai_output?.summary || '',
        input_text: entry.input_text || '',
        keywords: flattenKeywords(entry)
      }))
    });
  } catch (error) {
    console.error('Search route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to search records'
    });
  }
});

app.get('/api/export/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid id' });
    }

    const record = await LectureHistory.findById(id).lean();

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=lecture-analysis-${id}.pdf`);

    const doc = new PDFDocument({ margin: 42 });
    doc.pipe(res);

    doc.fontSize(18).text('Dynamic Lecture Analyzer Report', { underline: true });
    doc.moveDown(0.4);
    doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`);
    doc.fontSize(10).text(`Language: ${record.language || 'English'}`);

    const writeSection = (title, content) => {
      doc.moveDown(0.6);
      doc.fontSize(13).text(title, { underline: true });
      doc.moveDown(0.2);
      doc.fontSize(11).text(content || 'Not available');
    };

    const listToText = (list) => Array.isArray(list) && list.length
      ? list.map((item, idx) => `${idx + 1}. ${item}`).join('\n')
      : 'Not available';

    const headingsToText = (headings) => Array.isArray(headings) && headings.length
      ? headings.map((item, idx) => {
        const title = item?.title || `Main Concept ${idx + 1}`;
        const points = Array.isArray(item?.points) && item.points.length ? item.points.join('; ') : 'Not available';
        const importantLines = Array.isArray(item?.important_lines) && item.important_lines.length ? item.important_lines.join('; ') : 'Not available';
        return `${idx + 1}. ${title}\n   Points: ${points}\n   Important lines: ${importantLines}`;
      }).join('\n\n')
      : 'Not available';

    writeSection('Summary', record.ai_output?.summary);
    writeSection('Topics', listToText(record.ai_output?.topics));
    writeSection('Action Items', listToText(record.ai_output?.action_items));
    writeSection('Keywords', listToText(record.ai_output?.keywords));
    writeSection('Speaker Feedback', record.ai_output?.speaker_feedback);
    writeSection('Headings', headingsToText(record.ai_output?.notes?.headings));
    writeSection('Short Notes', listToText(record.ai_output?.notes?.short_notes));
    writeSection('Detailed Notes', listToText(record.ai_output?.notes?.detailed_notes));
    writeSection('Short Questions', listToText(record.ai_output?.questions?.short_questions));
    writeSection('Viva Questions', listToText(record.ai_output?.questions?.viva_questions));

    const timestampNotes = record.ai_output?.notes?.timestamps || [];
    if (timestampNotes.length) {
      writeSection(
        'Timestamp Notes',
        timestampNotes.map((item, idx) => `${idx + 1}. [${item.timestamp || '--:--'}] ${item.text || ''}`).join('\n')
      );
    }

    const segmentation = record.ai_output?.segmentation || [];
    if (segmentation.length) {
      writeSection(
        'Segmentation',
        segmentation.map((item, idx) => {
          const timestamp = item.timestamp ? ` [${item.timestamp}]` : '';
          return `${idx + 1}. ${item.section || `Section ${idx + 1}`}${timestamp}\n   ${item.content || item.description || ''}`;
        }).join('\n\n')
      );
    }

    doc.end();
  } catch (error) {
    console.error('Export route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to export PDF'
    });
  }
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
