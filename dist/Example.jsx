var React = require("react");
var styles = require("./Example.module.scss");
function Example() {
  var Logger = async function () {
    return console.log("hello world!");
  };
  return React.createElement("div", null, React.createElement("div", {
    className: "h-full",
    onClick: Logger
  }, "h"));
}
export default Example;