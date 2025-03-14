import React from 'react';
import styles from "./Example.module.scss";
function Example() {
  return React.createElement("div", null, React.createElement("div", {
    className: styles["disabled"]
  }, "example react component"), React.createElement("button", {
    disabled: true
  }, "Click me"), React.createElement("div", {
    className: "h-full"
  }, "h-full"));
}
export default Example;