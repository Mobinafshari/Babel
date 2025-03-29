module.exports = {
  plugins: [
    function customConsoleLogPlugin() {
      return {
        visitor: {
          CallExpression(path) {
            if (
              path.node.callee.type === "MemberExpression" &&
              path.node.callee.object.name === "console"
            ) {
              console.log(`🔍 Found console.log: ${path.toString()}`);
            }
          },
        },
      };
    },
  ],
};
