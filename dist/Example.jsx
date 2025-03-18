var React = require("react");
var useState = require("react").useState;
var useEffect = require("react").useEffect;
var styles = require("./Example.module.scss");
var name = require("./utils/helper");
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