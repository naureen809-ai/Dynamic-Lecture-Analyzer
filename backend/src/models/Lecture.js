const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    inputText: { type: String, required: true },
    ai_output: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    summary: { type: String, required: true },
    keyPoints: { type: [String], default: [] },
    explanation: { type: String, required: true },
    sentiment: { type: String, default: 'Neutral' },
    readabilityScore: { type: Number, default: 0 },
    analysisProvider: { type: String, default: 'openai' },
    analysisModel: { type: String, default: '' },
    createdFrom: { type: String, enum: ['text'], default: 'text' },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lecture', lectureSchema);
