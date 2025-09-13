// backend/server.js
const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

app.use(express.json());

// Initialize Gemini AI
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Endpoint for processing images with Gemini
app.post('/api/analyze-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { prompt = 'Analyze this image and describe what you see' } = req.body;

    // Convert buffer to base64
    const imageBase64 = req.file.buffer.toString('base64');

    // Prepare the content for Gemini
    const contents = [{
      role: 'user',
      parts: [
        { inlineData: { mimeType: req.file.mimetype, data: imageBase64 } },
        { text: prompt }
      ]
    }];

      // Call Gemini API
      const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent({
        contents,
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
        ],
      });

    const response = await result.response;
    const text = response.text();

    res.json({
      success: true,
      analysis: text,
      filename: req.file.originalname,
      size: req.file.size
    });

  } catch (error) {
    console.error('Error analyzing image:', error);
    res.status(500).json({ 
      error: 'Failed to analyze image', 
      details: error.message 
    });
  }
});

// Endpoint for processing multiple images
app.post('/api/analyze-images', upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No image files provided' });
    }

    const { prompt = 'Analyze these images and describe what you see' } = req.body;
    const results = [];

    for (const file of req.files) {
      const imageBase64 = file.buffer.toString('base64');
      
      const contents = [{
        role: 'user',
        parts: [
          { inlineData: { mimeType: file.mimetype, data: imageBase64 } },
          { text: prompt }
        ]
      }];

        const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent({
          contents,
          safetySettings: [
            {
              category: HarmCategory.HARM_CATEGORY_HARASSMENT,
              threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            },
          ],
        });

      const response = await result.response;
      const text = response.text();

      results.push({
        filename: file.originalname,
        analysis: text,
        size: file.size
      });
    }

    res.json({
      success: true,
      results: results,
      totalImages: req.files.length
    });

  } catch (error) {
    console.error('Error analyzing images:', error);
    res.status(500).json({ 
      error: 'Failed to analyze images', 
      details: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;