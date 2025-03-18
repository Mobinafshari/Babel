var React = require("react");
var useState = require("react").useState;
var useEffect = require("react").useEffect;
var styles = require("./Example.module.scss");
var name = require("./utils/helper");
function Example() {
  var message = "hello ppl in " + new Date().getFullYear();
  return React.createElement("div", null, React.createElement("div", {
    className: "h-full",
    onClick: Logger
  }, "the message was " + message));
}
module.exports = Example;