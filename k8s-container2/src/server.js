const express = require("express");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { error } = require("console");
const PORT = 8000;
const STORAGE_PATH = "/harsh_PV_dir";

const app = express();
app.use(express.json());

app.get("/test", async (req, res) => {
  return res.status(200).json({ msg: "Test passed" });
});

app.post("/result", async (req, res) => {
  const payload = req.body;
  const filePath = path.join(STORAGE_PATH, payload.file);
  // const filePath = payload.filee;
  let isCSV = true;
  let totalAmount = 0;
  let result = [];

  if (
    path.extname(filePath).toLowerCase() !== ".yml" &&
    path.extname(filePath).toLowerCase() !== ".dat"
  ) {
    return res
      .status(200)
      .json({ file: payload.file, error: "Input file not in CSV format." });
  }

  let product_column_exists = false;
  let amount_column_exists = false;
  try {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("error", () => {
        isCSV = false;
        return res
          .status(200)
          .json({ file: payload.file, error: "Input file not in CSV format." });
      })
      .on("data", (item) => {
        const trimmed_data = {};
        Object.keys(item).forEach((key) => {
          trimmed_data[key.trim()] = item[key].trim();
        });

        result.push(trimmed_data);

        if (!product_column_exists && trimmed_data.hasOwnProperty("product")) {
          product_column_exists = true;
        }
        if (!amount_column_exists && trimmed_data.hasOwnProperty("amount")) {
          amount_column_exists = true;
        }
      })
      .on("end", () => {
        console.log("csv found");
        console.log(result);

        if (!product_column_exists && !amount_column_exists) {
          return res.json({
            file: payload.file,
            error: "Input file not in CSV format.",
          });
        }

        let sum = 0;

        if (result.length > 0) {
          for (let i = 0; i < result.length; i++) {
            const { product, amount } = result[i];
            if (payload.product === product) {
              console.log(product, amount);
              sum += Number(amount);
            }
          }
          return res.status(200).json({ file: `${payload.file}`, sum: sum });
        } else {
          return res.status(200).json({
            file: `${payload.file}`,
            error: "Input file not in CSV format.",
          });
        }
      });
  } catch (error) {
    console.log({ error });
    res.status(200).json({
      file: `${payload.file}`,
      error: "Input file not in CSV format.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});
