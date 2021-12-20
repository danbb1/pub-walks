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

  const { name, description, markers, distance } = JSON.parse(body);

  const newRoute = new Route({
    name,
    description,
    likes: 0,
    distance,
    markers: markers.map(coord => ({
      lat: coord[0],
      long: coord[1],
    })),
  });

  try {
    await mongoose.connect(url);
    console.log('successfully connected');

    console.log(newRoute);

    await newRoute.save();

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
