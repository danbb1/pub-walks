/* eslint-disable @typescript-eslint/no-var-requires */
const mongoose = require('mongoose');

const Route = require('./models/Route');

exports.handler = async ({ body, httpMethod }) => {
  if (httpMethod !== 'POST') {
    return { statusCode: 405 };
  }

  if (!body) {
    return {
      statusCode: 400,
    };
  }

  const url = `${process.env.MONGO_URI}`;

  const query = JSON.parse(body);

  try {
    await mongoose.connect(url);
    console.log('successfully connected');

    let response;

    if (query.sort === 'MOST_LIKED') {
      response = await Route.find().sort({ likes: -1 });
    } else {
      response = await Route.find(query).sort({ createdAt: -1 });
    }

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
