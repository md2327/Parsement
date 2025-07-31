// backend's job is to accept file from frontend,
// use API key from APILayer to parse, and send
// back parsed data

// modules
import express from "express"; // handles server
import cors from "cors"; // handles cross-origin requests
import axios from "axios";
import multer from "multer"; // parses file uploads in express
import dotenv from "dotenv";

dotenv.config();
const app = express(); // initialize express
const upload = multer({ storage: multer.memoryStorage() }); // stores file in memory

app.use(cors({ origin: "*" })); // allow requests from frontend
const apiKey = process.env.API_KEY; // securely stores api key in .env

app.post("/parse", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" }); // returns 400 if no file is uploaded
    }
    // make POST request to APILayer
    const response = await axios.post(
      "https://api.apilayer.com/resume_parser/upload",
      req.file.buffer, // APILayer only accepts raw file
      {
        headers: {
          apikey: apiKey,
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

app.get("/", (req, res) => {
  res.json({ status: "Backend is live" });
});

const PORT = process.env.PORT || 8080; // Render's port
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); // server starts listening
