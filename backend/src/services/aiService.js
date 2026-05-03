const OpenAI = require('openai');
const Groq = require('groq-sdk');

let openaiClient = null;
let groqClient = null;

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'if', 'then', 'else', 'for', 'from', 'to', 'of', 'in', 'on', 'at',
  'is', 'are', 'was', 'were', 'be', 'being', 'been', 'this', 'that', 'these', 'those', 'it', 'its', 'as',
  'by', 'with', 'about', 'into', 'through', 'over', 'under', 'between', 'we', 'you', 'they', 'he', 'she',
  'i', 'our', 'your', 'their', 'can', 'could', 'should', 'would', 'may', 'might', 'must', 'will', 'shall'
]);

const ALLOWED_LANGUAGES = new Set(['English', 'Hindi', 'Hinglish']);

// Content Moderation Lists
const PROFANITY_WORDS = new Set([
  'damn', 'hell', 'crap', 'bastard', 'bitch', 'asshole', 'idiot', 'stupid',
  'fuck', 'shit', 'ass', 'dick', 'cock', 'pussy', 'whore', 'slut', 'motherfucker',
  'chutiya', 'madarchod', 'bhen', 'gaandu', 'behenchod', 'saala', 'harami',
  'kamina', 'nalayak', 'besharam', 'jhootha', 'badmash', 'ganda', 'gandagi'
]);

const EXPLICIT_KEYWORDS = new Set([
  'porn', 'sex', 'xxx', 'nude', 'naked', 'adult', 'erotic', 'sexual', 'dick',
  'cock', 'pussy', 'breast', 'boob', 'ass', 'horny', 'masturbat', 'orgasm',
  'viagra', 'cialis', 'dating', 'hookup'
]);

const LECTURE_KEYWORDS = new Set([
  'lecture', 'course', 'class', 'topic', 'concept', 'theory', 'chapter', 'subject',
  'lesson', 'exam', 'test', 'question', 'problem', 'solution', 'study', 'learn',
  'understand', 'explain', 'definition', 'formula', 'equation', 'algorithm',
  'programming', 'code', 'math', 'science', 'history', 'geography', 'language',
  'assignment', 'homework', 'project', 'research', 'analysis', 'data', 'note'
]);

const checkContentModeration = (text, type = 'message') => {
  const cleanText = String(text || '').trim().toLowerCase();
  
  if (!cleanText) {
    return { isAllowed: false, message: 'Message cannot be empty.' };
  }

  // Check for profanity
  const words = cleanText.split(/[\s\W]+/);
  const profanityFound = words.filter((word) => PROFANITY_WORDS.has(word));
  
  if (profanityFound.length > 0) {
    return {
      isAllowed: false,
      message: '🚫 Please use respectful language. Avoid using abusive or offensive words. Let\'s keep the conversation professional and focused on learning.',
      category: 'profanity'
    };
  }

  // Check for explicit/18+ content
  const explicitFound = words.filter((word) => EXPLICIT_KEYWORDS.has(word));
  
  if (explicitFound.length > 0) {
    return {
      isAllowed: false,
      message: '⚠️ I cannot discuss explicit or adult content. This is an educational platform focused on lecture analysis and learning. Please ask lecture-related questions only.',
      category: 'explicit'
    };
  }

  // Check if the message is lecture-related (for chat only)
  if (type === 'chat') {
    const hasLectureTerm = Array.from(LECTURE_KEYWORDS).some((keyword) => cleanText.includes(keyword));
    const isQuestion = cleanText.includes('?') || cleanText.includes('what') || 
                       cleanText.includes('how') || cleanText.includes('why') || 
                       cleanText.includes('explain') || cleanText.includes('define') ||
                       cleanText.includes('tell') || cleanText.includes('help');
    
    if (!hasLectureTerm && !isQuestion) {
      return {
        isAllowed: false,
        message: '📚 I\'m designed to help with lecture-related questions and study topics. Please ask questions about your lecture content, topics, concepts, or assignments.',
        category: 'non-lecture'
      };
    }
  }

  return { isAllowed: true };
};

const SYSTEM_PROMPT = `
You are a HIGH-LEVEL AI Lecture Analyzer.

CRITICAL INSTRUCTIONS:
- DO NOT repeat or paraphrase input text
- You MUST interpret and expand concepts
- Generate meaningful academic output
- Convert simple input into structured learning content

Return STRICT JSON:

{
  "summary": "Explain the lecture in a more detailed and improved way (not same text, add understanding)",

  "topics": ["real concepts like 'Artificial Intelligence basics', 'Applications of AI', not random words"],

  "action_items": ["real student tasks based on topic"],

  "keywords": ["important meaningful terms only"],

  "speaker_feedback": "constructive feedback",

  "notes": {
    "headings": [
      {
        "title": "Main Concept",
        "points": ["clear explanation points"],
        "important_lines": ["key statements"]
      }
    ],
    "short_notes": ["quick revision notes"],
    "detailed_notes": ["detailed explanation in simple language"]
  },

  "questions": {
    "mcqs": [
      {
        "question": "What is AI?",
        "options": ["A", "B", "C", "D"],
        "answer": "correct option"
      }
    ],
    "short_questions": ["2-3 questions"],
    "viva_questions": ["oral exam questions"]
  },

  "segmentation": [
    {
      "section": "Introduction",
      "content": "brief explanation"
    }
  ]
}

IMPORTANT:
- Never return empty fields
- Always generate meaningful content even if input is small
- Expand knowledge intelligently
`;

const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey });
  }

  return openaiClient;
};

const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return null;
  }

  if (!groqClient) {
    groqClient = new Groq({ apiKey });
  }

  return groqClient;
};

const splitSentences = (text) => {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const sanitizeArray = (value, maxItems) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .slice(0, maxItems);
};

const normalizeNonEmptyString = (value, fallback) => {
  const result = String(value || '').trim();
  return result || String(fallback || '').trim();
};

const normalizeHeadingItems = (value, fallbackHeadings = []) => {
  if (!Array.isArray(value)) {
    return fallbackHeadings;
  }

  const normalized = value
    .map((item, index) => {
      if (!item) return null;

      if (typeof item === 'string') {
        const title = item.trim();
        if (!title) return null;

        return {
          title,
          points: [title],
          important_lines: [title]
        };
      }

      if (typeof item !== 'object') {
        return null;
      }

      const title = normalizeNonEmptyString(item.title || item.heading || item.section, fallbackHeadings[index]?.title || `Main Concept ${index + 1}`);
      const points = sanitizeArray(item.points, 8);
      const importantLines = sanitizeArray(item.important_lines || item.importantLines, 8);

      return {
        title,
        points: points.length ? points : [title],
        important_lines: importantLines.length ? importantLines : [title]
      };
    })
    .filter(Boolean)
    .slice(0, 8);

  return normalized.length ? normalized : fallbackHeadings;
};

const normalizeSegmentationItems = (value, fallbackSegmentation = []) => {
  if (!Array.isArray(value)) {
    return fallbackSegmentation;
  }

  const normalized = value
    .map((item, index) => {
      if (!item) return null;

      if (typeof item === 'string') {
        const content = item.trim();
        if (!content) return null;

        return {
          section: `Section ${index + 1}`,
          content,
          description: content,
          timestamp: ''
        };
      }

      if (typeof item !== 'object') {
        return null;
      }

      const section = normalizeNonEmptyString(item.section, `Section ${index + 1}`);
      const content = normalizeNonEmptyString(item.content || item.description || item.text, '');
      if (!content) return null;

      const timestamp = normalizeNonEmptyString(item.timestamp, '');

      return {
        section,
        content,
        description: content,
        ...(timestamp ? { timestamp } : {})
      };
    })
    .filter(Boolean)
    .slice(0, 20);

  return normalized.length ? normalized : fallbackSegmentation;
};

const sanitizeObjectArray = (value, maxItems) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;

      const text = String(item.text || '').trim();
      const timestamp = String(item.timestamp || '').trim();
      if (!text) return null;

      return timestamp ? { text, timestamp } : { text };
    })
    .filter(Boolean)
    .slice(0, maxItems);
};

const normalizeLanguage = (language) => {
  const value = String(language || 'English').trim();
  return ALLOWED_LANGUAGES.has(value) ? value : 'English';
};

const getTopKeywords = (text, limit = 8) => {
  const frequencies = new Map();
  const tokens = text.toLowerCase().match(/[a-z][a-z0-9-]*/g) || [];

  for (const token of tokens) {
    if (token.length < 4 || STOP_WORDS.has(token)) {
      continue;
    }

    frequencies.set(token, (frequencies.get(token) || 0) + 1);
  }

  return [...frequencies.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
};

const buildLocalFallback = (text, language = 'English') => {
  const cleanText = text.trim();
  const sentences = splitSentences(cleanText);
  const summary = sentences.length >= 2
    ? `${sentences[0]} ${sentences[1]}`
    : sentences[0] || cleanText;

  const topics = getTopKeywords(cleanText, 5).map((item) => item.replace(/-/g, ' '));
  const keywords = getTopKeywords(cleanText, 8);
  const actionItems = [
    'Review the summary and identify the most important concept.',
    'Create short revision notes for each topic.',
    'Prepare one practical example for the next study session.'
  ];

  const shortNotes = (sentences.length ? sentences : [cleanText]).slice(0, 4);
  const detailedNotes = (sentences.length ? sentences : [cleanText]).slice(0, 8);

  const headings = topics.length
    ? topics.slice(0, 4).map((topic, index) => ({
      title: topic,
      points: [
        shortNotes[index] || summary,
        detailedNotes[index] || shortNotes[index] || summary
      ].filter(Boolean),
      important_lines: [
        detailedNotes[index] || shortNotes[index] || summary
      ].filter(Boolean)
    }))
    : [{
      title: 'Main Concept',
      points: [summary || cleanText],
      important_lines: [summary || cleanText]
    }];

  const mcqs = [
    {
      question: 'What is the primary focus of this lecture?',
      options: ['Historical timeline', 'Core concepts and applications', 'Only exam dates', 'None of the above'],
      answer: 'Core concepts and applications'
    }
  ];

  const shortQuestions = [
    'Explain the main idea covered in the lecture in your own words.',
    'List two practical uses of the discussed concept.'
  ];

  const vivaQuestions = [
    'Why is this concept important in real-world applications?',
    'How would you teach this topic to a beginner?'
  ];

  const segmentation = detailedNotes.slice(0, 4).map((item, idx) => ({
    section: `Section ${idx + 1}`,
    content: item,
    description: item,
    timestamp: ''
  }));

  const speakerFeedback = 'Speaker delivery appears clear overall. Add brief pauses between major points and end each section with a quick recap.';

  return {
    summary: summary || 'No summary could be generated.',
    topics: topics.length ? topics : ['General lecture overview'],
    action_items: actionItems,
    keywords: keywords.length ? keywords : ['lecture', 'analysis'],
    speaker_feedback: speakerFeedback,
    notes: {
      headings,
      short_notes: shortNotes,
      detailed_notes: detailedNotes,
      timestamps: []
    },
    questions: {
      mcqs,
      short_questions: shortQuestions,
      viva_questions: vivaQuestions
    },
    segmentation,
    transcript: cleanText,
    keyPoints: shortNotes,
    explanation: shortNotes[0] || summary || cleanText,
    sentiment: /important|improve|good|great|helpful|better|success/i.test(cleanText)
      ? 'Positive'
      : /problem|issue|bad|difficult|challenge|hard|risk/i.test(cleanText)
        ? 'Negative'
        : 'Neutral',
    readabilityScore: 72,
    analysisProvider: 'local-fallback',
    analysisModel: 'rule-based',
    language
  };
};

const extractJsonPayload = (rawContent) => {
  const content = String(rawContent || '').trim();
  if (!content) {
    return null;
  }

  const fenceMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fenceMatch?.[1]?.trim() || content;

  try {
    return JSON.parse(candidate);
  } catch (_) {
    const firstBrace = candidate.indexOf('{');
    const lastBrace = candidate.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      return null;
    }

    try {
      return JSON.parse(candidate.slice(firstBrace, lastBrace + 1));
    } catch (_) {
      return null;
    }
  }
};

const normalizeAnalysis = (payload, fallback, provider, model, language) => {
  const summary = String(payload?.summary || '').trim() || fallback.summary;
  const topics = sanitizeArray(payload?.topics, 8);
  const actionItems = sanitizeArray(payload?.action_items, 8);
  const keywords = sanitizeArray(payload?.keywords, 12);
  const speakerFeedback = String(payload?.speaker_feedback || '').trim();

  const notesHeadings = sanitizeArray(payload?.notes?.headings, 8);
  const notesShort = sanitizeArray(payload?.notes?.short_notes, 12);
  const notesDetailed = sanitizeArray(payload?.notes?.detailed_notes, 20);
  const notesTimestamps = sanitizeObjectArray(payload?.notes?.timestamps, 20);

  const mcqs = Array.isArray(payload?.questions?.mcqs)
    ? payload.questions.mcqs
      .map((item) => {
        if (!item || typeof item !== 'object') return null;

        const question = String(item.question || '').trim();
        const options = sanitizeArray(item.options, 6);
        const answer = String(item.answer || '').trim();
        if (!question) return null;

        return {
          question,
          options: options.length ? options : ['Option A', 'Option B', 'Option C', 'Option D'],
          answer: answer || 'Not provided'
        };
      })
      .filter(Boolean)
      .slice(0, 12)
    : [];

  const shortQuestions = sanitizeArray(payload?.questions?.short_questions, 16);
  const vivaQuestions = sanitizeArray(payload?.questions?.viva_questions, 16);

  const segmentation = Array.isArray(payload?.segmentation)
    ? payload.segmentation
      .map((item, idx) => {
        if (!item || typeof item !== 'object') return null;

        const section = String(item.section || `Section ${idx + 1}`).trim();
        const content = String(item.content || item.description || item.text || '').trim();
        const timestamp = String(item.timestamp || '').trim();

        if (!content) return null;
        return {
          section,
          content,
          description: content,
          ...(timestamp ? { timestamp } : {})
        };
      })
      .filter(Boolean)
      .slice(0, 20)
    : [];

  const fallbackHeadings = fallback.notes?.headings || [];
  const fallbackSegmentation = fallback.segmentation || [];

  return {
    summary,
    topics: topics.length ? topics : fallback.topics,
    action_items: actionItems.length ? actionItems : fallback.action_items,
    keywords: keywords.length ? keywords : fallback.keywords,
    speaker_feedback: speakerFeedback || fallback.speaker_feedback,
    notes: {
      headings: normalizeHeadingItems(payload?.notes?.headings, fallbackHeadings),
      short_notes: notesShort.length ? notesShort : fallback.notes.short_notes,
      detailed_notes: notesDetailed.length ? notesDetailed : fallback.notes.detailed_notes,
      timestamps: notesTimestamps.length ? notesTimestamps : fallback.notes.timestamps
    },
    questions: {
      mcqs: mcqs.length ? mcqs : fallback.questions.mcqs,
      short_questions: shortQuestions.length ? shortQuestions : fallback.questions.short_questions,
      viva_questions: vivaQuestions.length ? vivaQuestions : fallback.questions.viva_questions
    },
    segmentation: normalizeSegmentationItems(payload?.segmentation, fallbackSegmentation),
    transcript: fallback.transcript,
    keyPoints: notesShort.length ? notesShort.slice(0, 6) : fallback.keyPoints,
    explanation: notesDetailed[0] || summary || fallback.explanation,
    sentiment: ['Positive', 'Neutral', 'Negative'].includes(payload?.sentiment)
      ? payload.sentiment
      : fallback.sentiment,
    readabilityScore: typeof payload?.readabilityScore === 'number' ? payload.readabilityScore : fallback.readabilityScore,
    analysisProvider: provider,
    analysisModel: model,
    language
  };
};

const analyzeLectureText = async (text, options = {}) => {
  const cleanText = String(text || '').trim();
  const language = normalizeLanguage(options.language);

  if (!cleanText) {
    throw new Error('text is required');
  }

  // Check content moderation (for profanity/explicit content)
  const moderationCheck = checkContentModeration(cleanText, 'lecture');
  if (!moderationCheck.isAllowed && ['profanity', 'explicit'].includes(moderationCheck.category)) {
    return {
      error: moderationCheck.message,
      summary: moderationCheck.message,
      topics: [],
      action_items: [],
      keywords: [],
      speaker_feedback: '',
      notes: { headings: [], short_notes: [], detailed_notes: [], timestamps: [] },
      questions: { mcqs: [], short_questions: [], viva_questions: [] },
      segmentation: [],
      moderated: true,
      analysisProvider: 'moderation-blocked',
      analysisModel: 'content-filter',
      language
    };
  }

  const fallback = buildLocalFallback(cleanText, language);
  const groq = getGroqClient();
  const openai = getOpenAIClient();

  if (!groq && !openai) {
    return fallback;
  }

  try {
    const provider = groq ? 'groq' : 'openai';
    const model = groq
      ? process.env.GROQ_MODEL || 'llama-3.1-8b-instant'
      : process.env.OPENAI_MODEL || 'gpt-4o-mini';

    const requestParams = {
      model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: [
            'Analyze the lecture text and produce concise educational insights.',
            'Rules:',
            '- summary: 2 to 4 sentences',
            '- topics: 3 to 6 short items',
            '- action_items: 3 to 6 actionable study tasks',
            '- keywords: 5 to 10 important terms',
            '- speaker_feedback: practical feedback in 2 to 4 sentences',
            '- notes.headings: 3 to 6 objects with title, points, and important_lines',
            '- notes.short_notes: concise bullet-style notes',
            '- notes.detailed_notes: detailed study notes',
            '- notes.timestamps: include ONLY if timestamp references are available in input, else []',
            '- questions.mcqs: 3 to 8 MCQs with 4 options and answer',
            '- questions.short_questions: 3 to 8 items',
            '- questions.viva_questions: 3 to 8 items',
            '- segmentation: lecture chunks with section/content/timestamp',
            `- language for all text content: ${language}`,
            '- Output must be valid JSON only',
            '',
            cleanText
          ].join('\n')
        }
      ]
    };

    const response = await (provider === 'groq'
      ? groq.chat.completions.create(requestParams)
      : openai.chat.completions.create(requestParams));

    const rawContent = response?.choices?.[0]?.message?.content || '';
    const parsed = extractJsonPayload(rawContent);

    if (!parsed || typeof parsed !== 'object') {
      return fallback;
    }

    return normalizeAnalysis(parsed, fallback, provider, model, language);
  } catch (error) {
    console.warn('AI analysis failed; using fallback:', error.message);
    return fallback;
  }
};

const chatWithLectureAssistant = async ({
  message,
  contextText = '',
  language = 'English',
  history = []
}) => {
  const cleanMessage = String(message || '').trim();
  const cleanContext = String(contextText || '').trim();
  const safeLanguage = normalizeLanguage(language);

  if (!cleanMessage) {
    throw new Error('message is required');
  }

  // Check content moderation
  const moderationResult = checkContentModeration(cleanMessage, 'chat');
  
  if (!moderationResult.isAllowed) {
    return {
      response: moderationResult.message,
      language: safeLanguage,
      provider: 'moderation-blocked',
      moderated: true
    };
  }

  const groq = getGroqClient();
  const openai = getOpenAIClient();

  if (!groq && !openai) {
    return {
      response: `(${safeLanguage}) I can help you revise this lecture. Key focus: ${cleanMessage}`,
      language: safeLanguage,
      provider: 'local-fallback'
    };
  }

  try {
    const provider = groq ? 'groq' : 'openai';
    const model = groq
      ? process.env.GROQ_MODEL || 'llama-3.1-8b-instant'
      : process.env.OPENAI_MODEL || 'gpt-4o-mini';

    const historyMessages = Array.isArray(history)
      ? history
        .slice(-8)
        .flatMap((item) => {
          if (!item || typeof item !== 'object') return [];

          const role = item.role === 'assistant' ? 'assistant' : 'user';
          const content = String(item.content || '').trim();
          if (!content) return [];

          return [{ role, content }];
        })
      : [];

    const requestParams = {
      model,
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content: [
            'You are an AI tutor for lecture support.',
            'Answer clearly and concisely.',
            `Respond in ${safeLanguage}.`,
            'If asked for study help, provide practical guidance and examples.',
            'Only answer education and lecture-related questions.'
          ].join(' ')
        },
        ...(cleanContext
          ? [{ role: 'user', content: `Lecture context:\n${cleanContext}` }]
          : []),
        ...historyMessages,
        { role: 'user', content: cleanMessage }
      ]
    };

    const response = await (provider === 'groq'
      ? groq.chat.completions.create(requestParams)
      : openai.chat.completions.create(requestParams));

    const text = String(response?.choices?.[0]?.message?.content || '').trim();

    return {
      response: text || `(${safeLanguage}) I could not generate a response right now. Please try again.`,
      language: safeLanguage,
      provider,
      model
    };
  } catch (error) {
    return {
      response: `(${safeLanguage}) I am facing a temporary issue. Please try again in a moment.`,
      language: safeLanguage,
      provider: 'local-fallback',
      error: error.message
    };
  }
};

module.exports = {
  analyzeLectureText,
  chatWithLectureAssistant
};
