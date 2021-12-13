/* eslint-disable @typescript-eslint/no-var-requires */
const mongoose = require('mongoose');

const pubSchema = new mongoose.Schema({
  name: String,
  address: String,
  postcode: String,
  lat: Number,
  long: Number,
  authority: String,
});

const Pub = mongoose.model('pub', pubSchema);

module.exports = Pub;
