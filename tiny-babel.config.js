module.exports = {
  plugins: [
    function customLoggerPlugin() {
      return {
        visitor: {
          Identifier(path) {
            console.log(`🔍 Visiting Identifier: ${path.node.name}`);
          },
        },
      };
    },
  ],
};
