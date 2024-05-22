const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const shortid = require("shortid");

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname))); 

const userSchema = new mongoose.Schema(
  {
    shortURL: {
      type: String,
      required: true,
      unique: true,
    },
    redirectedURL: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const URL = mongoose.model("URL", userSchema);

mongoose
  .connect("mongodb://127.0.0.1:27017/url-shortener")
  .then(() => {
    console.log("Connected to database");
  })
  .catch((err) => {
    console.log("Error connecting to database", err);
  });

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/url", async (req, res) => {
  const longURL = req.body.url;
  const shortID = shortid.generate(); 
  try {
    await URL.create({
      shortURL: shortID,
      redirectedURL: longURL,
    });
    res.send(`Your Short URL is http://localhost:3000/${shortID}`);
  } catch (error) {
    res.status(500).send("Error creating short URL");
  }
});

app.get("/:shortURL", async (req, res) => {
  const shortURL = req.params.shortURL;
  try {
    const url = await URL.findOne({ shortURL: shortURL });
    if (url) {
      res.redirect(url.redirectedURL);
    } else {
      res.status(404).send("URL not found");
    }
  } catch (error) {
    res.status(500).send("Error retrieving URL");
  }
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
