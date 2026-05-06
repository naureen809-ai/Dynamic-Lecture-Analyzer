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

const ALLOWED_LANGUAGES = new Set([
  'English',
  'Hindi',
  'Hinglish',
  'Bengali',
  'Tamil',
  'Telugu',
  'Marathi',
  'Gujarati',
  'Punjabi',
  'Urdu',
  'Kannada',
  'Malayalam',
  'Odia',
  'Assamese',
  'Sanskrit',
  'Konkani',
  'Maithili',
  'Dogri',
  'Manipuri',
  'Bodo',
  'Santhali',
  'Kashmiri',
  'Sindhi',
  'Nepali'
]);

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

const shuffleArray = (arr) => {
  if (!Array.isArray(arr)) return arr;
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
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

const normalizeMcqItems = (value, topic, fallbackCount = 5) => {
  const safeTopic = String(topic || 'the topic').trim() || 'the topic';

  if (!Array.isArray(value)) {
    return buildTopicMcqFallback(safeTopic, fallbackCount);
  }

  const normalized = value
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null;

      const question = String(item.question || '').trim();
      const explanation = String(item.explanation || item.reason || '').trim();
      const answer = String(item.answer || item.correct_answer || '').trim();
      const options = sanitizeArray(item.options || item.choices, 4);
      const type = String(item.type || item.qtype || '').trim() || '';
      const difficulty = String(item.difficulty || item.level || '').trim() || '';

      if (!question) return null;

      return {
        question,
        options: options.length === 4 ? options : buildTopicMcqFallback(safeTopic, fallbackCount)[index % fallbackCount].options,
        answer: answer || 'Not provided',
        explanation: explanation || `This question is based on ${safeTopic}.`,
        type: type || undefined,
        difficulty: difficulty || undefined
      };
    })
    .filter(Boolean)
    .slice(0, 10);

  // Shuffle to avoid similar adjacent question types coming from model patterns
  const result = normalized.length ? shuffleArray(normalized) : buildTopicMcqFallback(safeTopic, fallbackCount);
  return result;
};

const buildTopicMcqFallback = (topic, count = 5) => {
  const safeTopic = String(topic || 'the topic').trim() || 'the topic';
  const baseQuestions = [
    {
      question: `What is the main idea of ${safeTopic}?`,
      options: [
        `A basic overview of ${safeTopic}`,
        'An unrelated historical event',
        'A random personal preference',
        'None of the above'
      ],
      answer: `A basic overview of ${safeTopic}`,
      explanation: `This checks the core definition or idea behind ${safeTopic}.`,
      type: 'definition',
      difficulty: 'Easy'
    },
    {
      question: `Which statement best describes an important concept in ${safeTopic}?`,
      options: [
        `A key concept from ${safeTopic}`,
        'A completely unrelated topic',
        'A false statement',
        'A random guess'
      ],
      answer: `A key concept from ${safeTopic}`,
      explanation: `This focuses on a central concept from ${safeTopic}.`,
      type: 'concept',
      difficulty: 'Easy'
    },
    {
      question: `What is one practical application of ${safeTopic}?`,
      options: [
        `A real-world use of ${safeTopic}`,
        'No application at all',
        'A movie reference',
        'A sports example'
      ],
      answer: `A real-world use of ${safeTopic}`,
      explanation: `Applications help connect ${safeTopic} to practical use.`,
      type: 'application',
      difficulty: 'Medium'
    },
    {
      question: `Why is ${safeTopic} important to study?`,
      options: [
        `It supports understanding of related academic ideas`,
        'Because it is unrelated to learning',
        'Because it is only for entertainment',
        'It is not important at all'
      ],
      answer: `It supports understanding of related academic ideas`,
      explanation: `Importance questions help test conceptual understanding.`,
      type: 'reasoning',
      difficulty: 'Medium'
    },
    {
      question: `Which option is most closely related to ${safeTopic}?`,
      options: [
        `A related concept from ${safeTopic}`,
        'A random celebrity',
        'A weather pattern',
        'A sports score'
      ],
      answer: `A related concept from ${safeTopic}`,
      explanation: `This checks whether the learner can identify related concepts.`,
      type: 'relation',
      difficulty: 'Easy'
    }
  ];

  return Array.from({ length: Math.max(1, Math.min(count, 10)) }, (_, index) => baseQuestions[index % baseQuestions.length]);
};

const generateTopicMcqs = async ({ topic, language = 'English', count = 5 }) => {
  const cleanTopic = String(topic || '').trim();
  const safeLanguage = normalizeLanguage(language);
  const requestedCount = Number.isFinite(Number(count)) ? Math.min(Math.max(parseInt(count, 10) || 5, 3), 10) : 5;

  if (!cleanTopic) {
    throw new Error('topic is required');
  }

  const moderationCheck = checkContentModeration(cleanTopic, 'mcq-topic');
  if (!moderationCheck.isAllowed && ['profanity', 'explicit'].includes(moderationCheck.category)) {
    return {
      questions: { mcqs: [] },
      moderated: true,
      error: moderationCheck.message,
      language: safeLanguage,
      provider: 'moderation-blocked'
    };
  }

  const groq = getGroqClient();
  const openai = getOpenAIClient();

  if (!groq && !openai) {
    return {
      questions: { mcqs: buildTopicMcqFallback(cleanTopic, requestedCount) },
      language: safeLanguage,
      provider: 'local-fallback',
      topic: cleanTopic
    };
  }

  try {
    const provider = groq ? 'groq' : 'openai';
    const model = groq
      ? process.env.GROQ_MODEL || 'llama-3.1-8b-instant'
      : process.env.OPENAI_MODEL || 'gpt-4o-mini';

    const requestParams = {
      model,
      temperature: 0.5,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `
You are an expert academic MCQ generator. Follow all instructions exactly and return valid JSON only.

STRICT RULES:
- Generate MCQs ONLY from the given topic and its subtopics.
- Do NOT include unrelated or overly-generic questions.
- Create between 3 and ${requestedCount} meaningful questions (use ${requestedCount} when possible).
- Each MCQ must have exactly 4 options.
- Provide the correct answer as the full option text (not A/B/C/D).
- Provide a short explanation for the correct answer (1-2 sentences).
- Tag each question with a `type` field (one of: definition, application, scenario, comparison, relation, reasoning) and a `difficulty` field (Easy, Medium, Hard).
- Ensure variety: mix question types and difficulties. For small counts, avoid repeating the same `type` more than twice.
- Vary phrasing and distractors: avoid repeating option patterns; include plausible distractors that test common misconceptions.
- Use ${safeLanguage} for all text, options, answers, and explanations.

OUTPUT JSON SCHEMA (exact):
{
  "questions": {
    "mcqs": [
      {
        "question": "...",
        "options": ["...", "...", "...", "..."],
        "answer": "...",
        "explanation": "...",
        "type": "definition|application|scenario|comparison|relation|reasoning",
        "difficulty": "Easy|Medium|Hard"
      }
    ]
  }
}

IMPORTANT: Do not include any extraneous keys at the root. Return only the JSON object above (you may wrap in ```json ... ``` but prefer raw JSON).
`
        },
        {
          role: 'user',
          content: [
            `Topic: ${cleanTopic}`,
            `Number of questions requested: ${requestedCount}`,
            'Instruction: Produce a balanced set of MCQs that cover definitions, applications, scenarios, and conceptual distinctions where relevant. Label each item with `type` and `difficulty` and ensure varied distractors.'
          ].join('\n')
        }
      ]
    };

    const response = await (provider === 'groq'
      ? groq.chat.completions.create(requestParams)
      : openai.chat.completions.create(requestParams));

    const rawContent = response?.choices?.[0]?.message?.content || '';
    const parsed = extractJsonPayload(rawContent);
    const mcqs = normalizeMcqItems(parsed?.questions?.mcqs || parsed?.mcqs || parsed?.questions, cleanTopic, requestedCount);

    return {
      questions: { mcqs },
      language: safeLanguage,
      provider,
      model,
      topic: cleanTopic
    };
  } catch (error) {
    console.warn('MCQ generation failed; using fallback:', error.message);
    return {
      questions: { mcqs: buildTopicMcqFallback(cleanTopic, requestedCount) },
      language: safeLanguage,
      provider: 'fallback-on-error',
      topic: cleanTopic,
      error: error.message
    };
  }
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

const isEducationalQuestion = (text) => {
  const cleanText = String(text || '').trim().toLowerCase();
  
  // Non-educational patterns - STRICTLY block these
  const nonEducationalPatterns = [
    /\b(hi|hello|hey|what's up|how are you|bye|goodbye|joke|meme|funny|sports|movie|music|dating|relationship|celebrity|gossip|entertainment|weather|news|politics|social media|instagram|tiktok|youtube|facebook|twitter)\b/i,
    /\b(where do you live|who are you|can we be friends|what's your name|tell me about yourself|chat with me|talk to me|best friend|favorite)\b/i,
    /\b(help me hack|give me code|hack|cheat|plagiarize|copy|fake|fraud|unethical)\b/i,
    /^(hi|hello|hey|how are you)$/i
  ];
  
  // Educational patterns - explicitly allow these
  const educationalPatterns = [
    /\b(explain|define|what|how|why|describe|list|tell|discuss|elaborate|clarify|simplify|break down|analyze|interpret|evaluate|compare|contrast)\b/i,
    /\b(concept|theory|formula|equation|solution|answer|question|problem|topic|subject|chapter|lesson|course|class|lecture|study|learn|understand|definition|example|case|principle|law|theorem|rule|process|method|technique|approach|strategy)\b/i,
    /[0-9+\-*/=(){}[\]αβγδ]/,
    /\b(test|exam|quiz|practice|revision|prepare|study|assignment|homework|project|research|paper|report|essay)\b/i,
    /\b(photosynthesis|evolution|gravity|physics|chemistry|biology|mathematics|calculus|algebra|geometry|history|geography|language|literature|economics|psychology|sociology|philosophy)\b/i
  ];
  
  // Check if it's explicitly non-educational - STRICT blocking only
  const isNonEducational = nonEducationalPatterns.some(pattern => pattern.test(cleanText));
  
  if (isNonEducational) {
    return false;
  }
  
  // Allow educational questions - if it matches any educational pattern
  const isEducational = educationalPatterns.some(pattern => pattern.test(cleanText));
  
  // Default to allowing questions if they're not explicitly non-educational
  // This allows flexible question types like "What are the stages?" etc.
  return isEducational || cleanText.length > 3; // Allow most reasonable questions
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

  // Check if question is educational
  const isEducational = isEducationalQuestion(cleanMessage);
  if (!isEducational) {
    return {
      response: '📚 I can only help with educational and study-related questions. Please ask me about lecture concepts, definitions, formulas, exam preparation, or any academic topics you need help understanding.',
      language: safeLanguage,
      provider: 'educational-filter',
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
      max_tokens: 150,
      messages: [
        {
          role: 'system',
          content: `
You are an EDUCATIONAL STUDY TUTOR AI - Answer ONLY from lecture content provided.

CORE MISSION:
You are an assistant that helps students understand ONLY the lecture content provided to you.
Answer questions based EXCLUSIVELY on the lecture content given.
Do NOT use general knowledge or external information.

STRICT RULES:
1. LECTURE CONTENT ONLY - Answer ONLY using the provided lecture content
2. If the question is not covered in the lecture, respond EXACTLY: "📚 یہ موضوع فراہم کردہ لیکچر میں نہیں ہے" (in user's language: "This is not covered in the provided lecture")
3. Support languages: English, Hindi, Hinglish, Marathi, Bengali, Tamil, and all Indian languages
4. Reply in the SAME language as the user's question
5. Keep answers simple, clear, educational, and beginner-friendly
6. REJECT non-educational questions with: "📚 میں صرف لیکچر سے متعلقہ سوالات کا جواب دے سکتا ہوں" (in user's language)

ANSWER APPROACH:
- Look at the lecture content provided
- If the answer is in the lecture → Answer clearly with lecture information
- If the answer is NOT in the lecture → Say "This is not covered in the provided lecture"
- DO NOT make up information or use general knowledge
- DO NOT answer non-educational questions
- Explain in very easy words, like teaching a beginner
- Use short sentences and simple examples when helpful
- If correcting an answer, say what is correct first and then explain why

RESPONSE FORMAT:
If lecture covers it: "Based on the lecture: [answer from lecture]"
If lecture doesn't cover it: "This topic is not covered in the provided lecture content."
If question is not educational: "I can only help with questions about the lecture content."

Remember: You are ONLY a lecture assistant. Only answer what is in the lecture.
`
        },
        ...(cleanContext
          ? [{ role: 'user', content: `Here is the lecture content you should answer from:\n\n${cleanContext}\n\n---\nNow answer the student's question based ONLY on this lecture content. If something is not in the lecture, say "This is not covered in the lecture."` }]
          : [{ role: 'user', content: 'No lecture content available. Please ask your question and I will let you know that there is no lecture content to reference.' }]),
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
  chatWithLectureAssistant,
  generateTopicMcqs
};
