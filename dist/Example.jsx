import React from "react";
import styles from "./Example.module.scss";
function Example() {
  (function () {
    return console.log("hello world!");
  });
  return React.createElement("div", null, React.createElement("div", {
    className: "h-full",
    onClick: Logger
  }, "h"));
}
export default Example;