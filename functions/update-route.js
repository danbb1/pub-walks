/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-var-requires */
const mongoose = require('mongoose');

const Route = require('./models/Route');

exports.handler = async ({ body, httpMethod }) => {
  if (httpMethod !== 'POST') {
    return { statusCode: 405 };
  }

  const url = `${process.env.MONGO_URI}`;

  const newRoute = JSON.parse(body);

  try {
    await mongoose.connect(url);
    console.log('successfully connected');

    const updatedRoute = await Route.findOneAndUpdate(
      {
        _id: newRoute._id,
      },
      newRoute,
      { new: true },
    );

    mongoose.disconnect();

    return {
      statusCode: 200,
      body: JSON.stringify(updatedRoute),
    };
  } catch (err) {
    console.log(err.message);

    return {
      statusCode: 500,
      body: `Something went wrong: ${err.message}`,
    };
  }
};
