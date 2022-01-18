module.exports = {
  siteMetadata: {
    title: `Pub Walks`,
    description: `Mapping application for plotting routes and seeing pubs on route. Using Open Maps and Leaflet JS.`,
    author: `@danbb1`,
    siteUrl: `https://nifty-nightingale-710f41.netlify.app/`,
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-image`,
    `gatsby-plugin-react-leaflet`,
    `gatsby-plugin-postcss`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
  ],
};
