let express = require("express");
let bodyParser = require("body-parser");
let jsonParser = bodyParser.json();
let dns = require("dns");
let mongoose = require("mongoose");
let shortid = require("shortid");
let validUrl = require("valid-url");
let fs = require("fs");
let path = require("path");

let newUrlShort = require("./models/urlSchema");

require("dotenv").config();

let app = express();

let port = process.env.PORT || 5000;

app.use(express.static("public"));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

let db = mongoose.connection;
db.on("error", console.error.bind("MongoDB connection error"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

let urlencodedParser = bodyParser.urlencoded({ extended: false });

let shortUrlNum;

fs.readFile(path.join(__dirname, "data.txt"), "utf8", (err, data) => {
  if (err) {
    console.error(err);
  } else {
    shortUrlNum = parseInt(data);
  }
});

app.get("/favicon.ico", (req, res) => res.status(200));

app.post("/new", urlencodedParser, async (req, res) => {
  let { url } = req.body;

  let newUrl = url.replace(/^https?:\/\//, "");

  if (validUrl.isUri(url)) {
    let exist = await newUrlShort.findOne({ originalUrl: url });

    if (exist) {
      res.json(exist);
    } else {
      dns.lookup(newUrl, async (err, address, family) => {
        if (err) {
          console.error(err);
          res.send("No such url");
        } else {
          shortUrlNum++;

          fs.writeFile(path.join(__dirname, "data.txt"), shortUrlNum, (err) => {
            if (err) {
              console.error(err);
            } else {
              console.log("File updated!!!");
            }
          });

          const shortUrlObj = new newUrlShort({
            urlId: shortid.generate(),
            shortUrlNum,
            originalUrl: url,
          });

          await shortUrlObj.save((err) => {
            if (err) {
              return console.error(err);
            }
          });

          res.json(shortUrlObj);
        }
      });
    }
  } else {
    res.status(401).json("Entered url is invalid");
  }
});

app.get("/:shorturl", async (req, res) => {
  let { shorturl } = req.params;

  try {
    let link = await newUrlShort.findOne({ shortUrlNum: shorturl });

    if (link) {
      res.redirect(link.originalUrl);
    } else {
      res.status(404).json({
        error: "No such short-url is defined",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Server error");
  }
});

app.listen(port, () => {
  console.log("App is running on port " + port);
});
