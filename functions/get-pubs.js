const mongoose = require('mongoose');

const pubSchema = new mongoose.Schema({
  name: String,
  address: String,
  postcode: String,
  lat: Number,
  long: Number,
  authority: String,
});

const Pub = mongoose.models.Pub || mongoose.model('Pub', pubSchema);

exports.handler = async ({ body, httpMethod }) => {
  if (httpMethod !== 'POST') {
    return { statusCode: 405 };
  }
  const url = 'mongodb://127.0.0.1:27017/pubs';

  const bounds = JSON.parse(body);

  try {
    await mongoose.connect(url);
    console.log('successfully connected');

    const response = await Pub.find({
      lat: { $gte: bounds.s, $lte: bounds.n },
      long: { $gte: bounds.e, $lte: bounds.w },
    });

    mongoose.disconnect();

    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (err) {
    console.log(err.message);

    return {
      statusCode: 500,
      body: `Something went wrong: ${err.message}`,
    };
  }
};
