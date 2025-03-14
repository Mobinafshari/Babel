import React from 'react';
import styles from "./Example.module.scss";
function Example() {
  (() => {
    const name = 'hashem';
  })();
  (() => {
    let age = 20;
  })();
  return React.createElement("div", null, React.createElement("div", {
    className: "h-full"
  }, `${name} is ${age} years old.`));
}
export default Example;