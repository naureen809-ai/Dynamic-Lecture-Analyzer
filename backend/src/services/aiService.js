const OpenAI = require('openai');
const Groq = require('groq-sdk');

let openaiClient = null;
let groqClient = null;

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

const calculateReadabilityScore = (text) => {
  const cleanText = text.trim();
  const words = cleanText.split(/\s+/).filter(Boolean);
  const sentences = splitSentences(cleanText);

  if (!words.length || !sentences.length) {
    return 0;
  }

  const syllables = words.reduce((total, word) => {
    const cleaned = word.toLowerCase().replace(/[^a-z]/g, '');
    if (!cleaned) return total;

    const vowelGroups = cleaned.match(/[aeiouy]+/g);
    let count = vowelGroups ? vowelGroups.length : 0;
    if (cleaned.endsWith('e')) count -= 1;
    return total + Math.max(1, count);
  }, 0);

  const wordCount = words.length;
  const sentenceCount = sentences.length;
  const flesch = 206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllables / wordCount);

  return Number(Math.max(0, Math.min(100, flesch)).toFixed(2));
};

const buildLocalAnalysis = (text) => {
  const cleanText = text.trim();
  const sentences = splitSentences(cleanText);
  const words = cleanText.split(/\s+/).filter(Boolean);
  const importantSentences = sentences
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .slice(0, 5);

  const summary = sentences.length > 2
    ? `${sentences[0]} ${sentences[1]}`
    : sentences.join(' ') || cleanText;

  const explanation = importantSentences.length
    ? `Simple explanation: ${importantSentences[0]}`
    : `Simple explanation: ${cleanText}`;

  const sentiment = /important|improve|good|great|helpful|better|success/i.test(cleanText)
    ? 'Positive'
    : /problem|issue|bad|difficult|challenge|hard|risk/i.test(cleanText)
      ? 'Negative'
      : 'Neutral';

  return {
    transcript: cleanText,
    summary,
    keyPoints: importantSentences.length ? importantSentences : [cleanText],
    explanation,
    sentiment,
    readabilityScore: calculateReadabilityScore(cleanText),
    analysisProvider: 'local-fallback',
    analysisModel: 'rule-based'
  };
};

const analyzeLectureText = async (text) => {
  const cleanText = (text || '').trim();

  if (!cleanText) {
    throw new Error('text is required');
  }

  const groq = getGroqClient();
  const openai = getOpenAIClient();

  if (!groq && !openai) {
    return buildLocalAnalysis(cleanText);
  }

  try {
    const provider = groq ? 'groq' : 'openai';
    const model = groq
      ? process.env.GROQ_MODEL || 'llama3-8b-8192'
      : process.env.OPENAI_MODEL || 'gpt-4o-mini';

    const requestParams = {
      model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: [
            'You are a lecture analysis engine for students and teachers.',
            'Do not copy the input text back as the summary.',
            'Return only valid JSON with this exact shape:',
            '{"summary":"string","keyPoints":["string"],"explanation":"string","sentiment":"Positive|Neutral|Negative","readabilityScore":number}'
          ].join(' ')
        },
        {
          role: 'user',
          content: [
            'Analyze this lecture text and produce concise educational insights.',
            'Rules:',
            '- summary must be 2-4 sentences maximum',
            '- keyPoints must be 3-6 short bullet ideas',
            '- explanation must simplify the lecture in beginner-friendly language',
            '- sentiment must be one of Positive, Neutral, or Negative',
            '- readabilityScore must be a number from 0 to 100',
            '',
            cleanText
          ].join('\n')
        }
      ]
    };

    const response = await (groq ? groq.chat.completions.create(requestParams) : openai.chat.completions.create(requestParams));
    const rawContent = response.choices?.[0]?.message?.content || '';
    const parsed = JSON.parse(rawContent);

    return {
      transcript: cleanText,
      summary: String(parsed.summary || '').trim() || buildLocalAnalysis(cleanText).summary,
      keyPoints: Array.isArray(parsed.keyPoints)
        ? parsed.keyPoints.map((item) => String(item).trim()).filter(Boolean).slice(0, 6)
        : buildLocalAnalysis(cleanText).keyPoints,
      explanation: String(parsed.explanation || '').trim() || buildLocalAnalysis(cleanText).explanation,
      sentiment: ['Positive', 'Neutral', 'Negative'].includes(parsed.sentiment) ? parsed.sentiment : buildLocalAnalysis(cleanText).sentiment,
      readabilityScore: typeof parsed.readabilityScore === 'number'
        ? Number(Math.max(0, Math.min(100, parsed.readabilityScore)).toFixed(2))
        : calculateReadabilityScore(cleanText),
      analysisProvider: groq ? 'groq' : 'openai',
      analysisModel: groq
        ? process.env.GROQ_MODEL || 'llama3-8b-8192'
        : process.env.OPENAI_MODEL || 'gpt-4o-mini'
    };
  } catch (error) {
    console.warn('OpenAI analysis failed, using local fallback:', error.message);
    return buildLocalAnalysis(cleanText);
  }
};

module.exports = {
  analyzeLectureText
};