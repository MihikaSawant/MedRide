const { GoogleGenerativeAI } = require("@google/generative-ai");

const generateChatResponse = async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is missing in .env file.");
      return res.status(500).json({ error: "API Key is missing. Please add GEMINI_API_KEY to your .env file." });
    }

    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are an AI health and medical assistant for 'MedRide', an ambulance and medical service platform. 
    Provide helpful, empathetic, and concise responses to user's health-related questions. 
    Always include a disclaimer that you are an AI and they should consult a real doctor or book an ambulance in case of a severe emergency.
    
    User Query: ${message}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ reply: text });
  } catch (error) {
    console.error("AI Chat Error - Full Details:", error);
    res.status(500).json({ 
      error: "Failed to generate AI response.",
      details: error.message || error.toString() 
    });
  }
};

module.exports = { generateChatResponse };
