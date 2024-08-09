import express from "express";
import fs from "fs";
import readline from "readline";

const app = express();
const PORT = 3000;

let dictionaryData = [];

// function to load the JSON data into memory
const loadDictionaryData = async () => {
  const fileStream = fs.createReadStream(
    "./dictionary/english-dictionary.json"
  );

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    try {
      const entry = JSON.parse(line);
      dictionaryData.push(entry);
    } catch (error) {
      console.error("Error parsing JSON:", error);
    }
  }
  console.log("Dictionary data loaded into memory");
};

// call the function to load data
loadDictionaryData().catch((err) =>
  console.error("Error loading dictionary data:", err)
);

app.get("/search", (req, res) => {
  const { word } = req.query;
  if (!word) {
    return res.status(400).json({ error: "Word query parameter is required" });
  }

  const matchingEntries = dictionaryData.filter(
    (entry) => entry.word && entry.word.trim() === word.trim()
  );

  if (matchingEntries.length > 0) {
    res.json(matchingEntries);
  } else {
    res.status(404).json({ error: "Word not found" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
