// backend's job is to accept file from frontend,
// use API key from APILayer to parse, and send
// back parsed data

// modules
import express from "express"; // handles server
import cors from "cors"; // handles cross-origin requests
import path from "path"; // handles file paths
import { fileURLToPath } from "url";

const axios = require("axios");
const multer = require("multer"); // parses file uploads in express

// ===== handles frontend build ======
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express(); // initialize express

app.use(cors()); // allow requests from CORS
app.use(express.static(path.join(__dirname, "client"))); // for static frontend deployment to Render
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "index.html"));
});

const PORT = process.env.PORT || 8080; // Render's port
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); // server starts listening

const corsOption = { origin: ["http://localhost:5173"] };
app.use(cors(corsOption));

// ======= handles API fetching logic ========
const upload = multer({ storage: multer.memoryStorage() }); // stores file in memory
require("dotenv").config();
const apiKey = process.env.API_KEY; // securely stores api key in .env

app.post("/parse", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json(); // returns 400 if no file is uploaded
    }
    
    // make POST request to APILayer
    const response = await axios.post(
      "https://api.apilayer.com/resume_parser/upload",
      req.file.buffer, // APILayer only accepts raw file 
      {
        headers: {
          "apikey": apiKey,
          "Content-Type": "application/octet-stream",
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error parsing resume:", error.message);
    res.status(500).json({ error: error.message });
  }
});
