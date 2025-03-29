var React = require("react");
var Example = require("./Example");
function App() {
  console.log('first');
  return React.createElement("div", {
    className: "h-full"
  }, React.createElement(Example, null), React.createElement("img", {
    src: "photo.png"
  }));
}
module.exports = App;