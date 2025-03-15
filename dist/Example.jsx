import React from "react";
import styles from "./Example.module.scss";
function Example() {
  var name = "hashem";
  function Declare() {
    var number = 922;
  }
  if (name === "hashem") {
    (function () {
      var age = 20;
    })();
  }
  {
    (function () {
      var family = "hashemi";
    })();
  }
  return React.createElement("div", null, React.createElement("div", {
    className: "h-full"
  }, `${name} is ${age ?? 22} years old.`));
}
export default Example;