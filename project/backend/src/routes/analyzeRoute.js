const express = require('express');
const Lecture = require('../models/Lecture');
const { analyzeLectureText } = require('../services/aiService');

const router = express.Router();

router.post('/analyze', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'text is required'
      });
    }

    const analysis = await analyzeLectureText(text);

    await Lecture.create({
      text: analysis.transcript,
      summary: analysis.summary,
      keyPoints: analysis.keyPoints,
      explanation: analysis.explanation,
      sentiment: analysis.sentiment,
      readabilityScore: analysis.readabilityScore,
      analysisProvider: analysis.analysisProvider,
      analysisModel: analysis.analysisModel,
      createdFrom: 'text'
    });

    return res.status(201).json({
      success: true,
      message: 'Lecture analyzed successfully',
      data: analysis
    });
  } catch (error) {
    console.error('Analyze error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

module.exports = router;
