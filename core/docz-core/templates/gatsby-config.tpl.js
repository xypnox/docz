module.exports = {
  siteMetadata: {
    title: "<%- config.title %>",
    description: "<%- config.description %>"
  },
  __experimentalThemes: [
    { resolve: 'gatsby-theme-docz', options: <%- config %>}
  ],<% if (isDoczRepo) {%>
  plugins: [
    {
      resolve: 'gatsby-plugin-eslint',
      options: {
        test: /\.js$|\.jsx$/,
        exclude: /(node_modules|.cache|public|docz\/core)/,
        stages: ['develop'],
        options: {
          emitWarning: false,
          failOnError: false,
        },
      },
    },
  ],
  <%}%>
}
