let express = require("express");
let bodyParser = require("body-parser");
let jsonParser = bodyParser.json();
let dns = require("dns");
let mongoose = require("mongoose");
let shortid = require("shortid");

let app = express();

let port = process.env.PORT || 5000;

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

let urlencodedParser = bodyParser.urlencoded({ extended: false });

let links = [];
let shortUrlNum = 0;

app.post("/new", urlencodedParser, (req, res) => {
  let { url } = req.body;

  let newUrl = url.replace(/^https?:\/\//, "");

  let exist = links.find((link) => (link.originalUrl === url ? true : false));

  if (exist) {
    res.send("Url already exists");
  } else {
    dns.lookup(newUrl, (err, address, family) => {
      if (err) {
        console.error(err);
      } else {
        shortUrlNum++;

        const shortUrlObj = {
          id: shortid.generate(),
          shortUrlNum,
          originalUrl: url,
        };

        links.push(shortUrlObj);

        res.json(shortUrlObj);
      }
    });
  }
});

app.get("/:shorturl", (req, res) => {
  const { shorturl } = req.params;

  const link = links.find((li) => li.shortUrlNum === parseInt(shorturl));

  if (link) {
    res.redirect(link.originalUrl);
  } else {
    res.json({
      error: "No such short-url is defined",
    });
  }
});

app.listen(port, () => {
  console.log("App is running on port " + port);
});
