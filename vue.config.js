module.exports = {
  lintOnSave: false,
  outputDir: 'public',
  configureWebpack: {
    output: {
      globalObject: 'this',
    },
    plugins: [
    ],
  },
};
