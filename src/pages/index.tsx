/* eslint-disable no-underscore-dangle */
import React from 'react';

import Layout from '../components/layout';
import Seo from '../components/seo';
import MapComponent from '../components/map';

const IndexPage = () => {
  return (
    <Layout>
      <Seo title="Home" />
      <MapComponent />
    </Layout>
  );
};

export default IndexPage;
