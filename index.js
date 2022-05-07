require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({extended:false}));

// Basic Configuration
const port = process.env.PORT || 3000;

const MONGO_URI = process.env.MONGO_URI;

const Schema = new mongoose.Schema({ url: String, urlPos: Number });
const urlModel = mongoose.model("Url", Schema);

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.get("/api/shorturl/", function (req, res) {
  return res.send('Not Found!')
});

app.get("/api/shorturl/:url", function (req, res) {
  let _urlPos = req.params.url
  if(Number(+_urlPos)) {
   urlModel.find({urlPos: _urlPos}).then((url) => {
      if(url[0]?.url) {
        res.redirect(url[0].url)
      } else {
        return res.send('No data for record!')
      }
    });
  } else {
    return res.send('enter valid credentials')
  }

  // res.json({ greeting: "hello API" });
});

app.post("/api/shorturl", function (req, res) {
  console.log(req.body)
  if(req.body.url && req.body.url.split('http')[1]) {
    urlModel.find().then((urls) => {
      let url = new urlModel({ url: req.body.url, urlPos: urls.length+1 });
    url
      .save()
      .then((resp) => {
        return res.json({
          original_url: resp.url,
          short_url: resp.urlPos,
        });
        console.log(resp);
      })
      .catch((err) => {
        return res.json({ error: "Something went wrong" , message: err.message});
      });
    });
  } else 
  return res.json({ error: "invalid url" });

});

mongoose.connect(MONGO_URI).then((res) => {
  app.listen(port, function () {
    console.log(`Listening on port ${port}`);
  });
});
