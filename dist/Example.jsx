import React from "react";
import styles from "./Example.module.scss";
function Example() {
  var Logger = () => {
    return console.log('hello world!');
  };
  return React.createElement("div", null, React.createElement("div", {
    className: "h-full",
    onClick: Logger
  }, `${name} is ${age ?? 22} years old.`));
}
export default Example;