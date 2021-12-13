/* eslint-disable @typescript-eslint/no-var-requires */
const mongoose = require('mongoose');

// const markerSchema = new mongoose.Schema({
//   lat: Number,
//   long: Number,
// });

const routeSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    likes: Number,
    comments: [String],
    markers: [
      {
        lat: Number,
        long: Number,
      },
    ],
  },
  { timestamps: true },
);

const Route = mongoose.model('route', routeSchema);

module.exports = Route;
