import React from 'react';
import styles from "./Example.module.scss";
function Example() {
  const name = 'hashem';
  return React.createElement("div", null, React.createElement("div", {
    className: styles["disabled"]
  }, "example react component"), React.createElement("button", {
    disabled: true,
    style: {
      color: "red"
    }
  }, "Click me"), React.createElement("div", {
    className: "h-full"
  }, name));
}
export default Example;