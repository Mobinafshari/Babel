import React from 'react';
import styles from "./Example.module.scss";
function example() {
  return <>
      React.createElement("div", {
      className: styles["disabled"]
    }, "example react component")
    </>;
}
export default example;