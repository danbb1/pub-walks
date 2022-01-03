/* eslint-disable @typescript-eslint/no-var-requires */
const mongoose = require('mongoose');
const axios = require('axios');

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
  const url = `${process.env.MONGO_URI}`;

  const { name, description, markers, distance } = JSON.parse(body);

  try {
    const region = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${markers[0][0]}&lon=${markers[0][1]}&zoom=8`,
    );

    const newRoute = new Route({
      name,
      description,
      likes: 0,
      region: region.data.address.state_district,
      distance,
      markers: markers.map(coord => ({
        lat: coord[0],
        long: coord[1],
      })),
    });
    await mongoose.connect(url);
    console.log('successfully connected');

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
