const express = require("express");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const PORT = 6000;
const COMPUTE_URL = "http://container2-service/result";
const STORAGE_PATH = "/harsh_PV_dir";

const app = express();
app.use(express.json());

app.get("/test", async (req, res) => {
  try {
    const { file } = req.query;

    const filePath = path.join(`/${file}`);
    console.log(__dirname, filePath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: `File ${file} does not exist` });
    }

    return res.status(200).json({ msg: "Test passed well" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "something went worng" });
  }
});

app.post("/calculate", async (req, res) => {
  const data = req.body;

  if (!data || !data.file || !data.product) {
    return res.status(400).json({ error: "Invalid JSON input.", file: null });
  }

  const filePath = path.join(STORAGE_PATH, data.file);

  // const filePath = data.filee;

  if (!fs.existsSync(filePath)) {
    return res
      .status(404)
      .json({ file: `${data.file}`, error: "File not found." });
  }

  try {
    const response = await axios.post(COMPUTE_URL, data);
    return res.status(response.status).json(response.data);
  } catch (error) {
    res.status(400).json({ file: data.file, error: error.message });
  }
});

app.post("/store-file", async (req, res) => {
  const { file, data } = req.body;
  if (!file) {
    return res.status(400).json({ file: null, error: "Invalid JSON input." });
  }

  const storagePath = path.join(STORAGE_PATH, file);
  // const storagePath = file;
  try {
    fs.writeFileSync(storagePath, data);
    return res.status(200).json({ file: file, message: "Success." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      file: file,
      error: "Error while storing the file to the storage.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});
