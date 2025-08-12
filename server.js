import express from "express";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors({
    origin: "*"
}));
app.use(express.json());

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST endpoint for formatting text
app.post("/format", async (req, res) => {
  try {
    const { transcript } = req.body;
    if (!transcript)
      return res.status(400).json({ error: "No transcript provided" });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an expert editor and fact-checker. You will be given raw text that is the output of an automated audio transcription, which may contain spelling mistakes, grammatical errors, poor formatting, missing punctuation, and occasionally incorrect information or words.
Your task is to:

Correct all transcription errors while keeping the meaning accurate.

Remove filler words and irrelevant content.

Verify facts where possible and replace incorrect terms with the correct ones.

Format the text into clear, well-structured notes using headings, bullet points, and paragraphs where appropriate.

Use consistent capitalization, punctuation, and spelling.

Maintain the tone as informative and academic, suitable for study purposes.
Return only the cleaned and formatted text without extra explanations. 
If it doesn't make enough sense to fact-check, return the original text. I only want formatted text or original text, do not return anything else
This is the text: ${transcript}
    `;

    const result = await model.generateContent(prompt);
    const output = result.response.text();

    res.json({ formatted: output });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/", (req, res) => {
  res.send("Gemini Formatter API is running 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
