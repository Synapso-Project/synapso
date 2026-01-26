require("dotenv").config();
const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/users");  // 👈 ADD THIS
const matchRoutes = require("./routes/matches"); // 👈 ADD THIS (if exists)

const app = express();

// ✅ CORS for frontend
app.use(cors({
  origin: ["https://synapso-app.onrender.com", "http://localhost:3000"],
  credentials: true
}));

app.use(express.json());

// ✅ HEALTH CHECK - Replace "Cannot GET /"
app.get("/", (req, res) => {
  res.json({ 
    message: "Synapso API LIVE!", 
    endpoints: ["/users/login", "/users/signup", "/users/me"] 
  });
});

// ✅ MOUNT USER ROUTES - THIS FIXES 404!
app.use("/users", userRoutes);  
app.use("/matches", matchRoutes); // if you have matches

// ✅ HuggingFace chat (keep your existing)
const HF_TOKEN = process.env.HF_TOKEN;
const HF_MODEL = "mistralai/Mistral-7B-Instruct-v0.2";

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

const port = process.env.PORT || 5001;
app.listen(port, '0.0.0.0', () => {
  console.log(`Synapso API running on port ${port}`);
});
