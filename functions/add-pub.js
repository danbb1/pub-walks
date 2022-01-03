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

  const newPub = new Pub(JSON.parse(body));

  try {
    await mongoose.connect(url);
    console.log('successfully connected');

    await newPub.save();

    mongoose.disconnect();

    return {
      statusCode: 200,
      body: 'Success',
    };
  } catch (err) {
    console.log(err.message);

    return {
      statusCode: 500,
      body: `Something went wrong: ${err.message}`,
    };
  }
};
