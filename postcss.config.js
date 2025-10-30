module.exports = (ctx) => ({
  map: ctx.options.map || false,
  plugins: [
    require('postcss-import')(),
    require('autoprefixer')(),
    ...(ctx.env === 'production' ? [require('cssnano')({ preset: 'default' })] : [])
  ]
});
