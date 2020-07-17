let mongoose = require("mongoose");

const Schema = mongoose.Schema;

const urlShortSchema = new Schema({
  urlId: {
    type: String,
    unique: true,
  },
  shortUrlNum: {
    type: Number,
    unique: true,
  },
  originalUrl: {
    type: String,
  },
});

const urlShort = mongoose.model("urlShort", urlShortSchema);

module.exports = urlShort;
