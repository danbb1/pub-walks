/* eslint-disable @typescript-eslint/no-var-requires */
const mongoose = require('mongoose');

const Pub = require('./models/Pub');

exports.handler = async ({ body, httpMethod }) => {
  if (httpMethod !== 'POST') {
    return { statusCode: 405 };
  }

  if (!body) {
    return {
      statusCode: 404,
    };
  }
  const url = `${process.env.MONGO_URI}`;

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
