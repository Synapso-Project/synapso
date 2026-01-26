require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const HF_TOKEN = process.env.HF_TOKEN; // Your HuggingFace token in .env file
const HF_MODEL = "mistralai/Mistral-7B-Instruct-v0.2"; // Or any compatible chat/text model

app.post("/api/hf-chat", async (req, res) => {
  const question = req.body.question;
  try {
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${HF_MODEL}`,
      { inputs: question },
      {
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

const PORT = 5001;
app.listen(PORT, () => console.log(`HuggingFace backend running on port ${PORT}`));
