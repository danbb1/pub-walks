/* eslint-disable @typescript-eslint/no-var-requires */
const mongoose = require('mongoose');

const Route = require('./models/Route');

exports.handler = async ({ body, httpMethod }) => {
  if (httpMethod !== 'POST') {
    return { statusCode: 405 };
  }

  if (!body) {
    return {
      statusCode: 404,
    };
  }
  const url = 'mongodb://127.0.0.1:27017/pubs';

  const markers = JSON.parse(body).map(coord => ({
    lat: coord[0],
    long: coord[1],
  }));

  const newRoute = new Route({ markers });

  console.log(newRoute);

  try {
    await mongoose.connect(url);
    console.log('successfully connected');

    // await newRoute.save();

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
