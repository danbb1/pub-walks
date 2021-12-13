/* eslint-disable @typescript-eslint/no-var-requires */
const mongoose = require('mongoose');

const Route = require('./models/Route');

exports.handler = async ({ httpMethod }) => {
  if (httpMethod !== 'POST') {
    return { statusCode: 405 };
  }

  const url = 'mongodb://127.0.0.1:27017/pubs';

  try {
    await mongoose.connect(url);
    console.log('successfully connected');

    const response = await Route.find({
      createdAt: { $gte: new Date() - 2592000000 },
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
