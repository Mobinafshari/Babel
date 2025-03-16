import React from "react";
import styles from "./Example.module.scss";

function Example() {
  const Logger = () => {
    return console.log('hello world!')
  }
  return (
    <div>
      <div className="h-full" onClick={Logger}>{`${name} is ${age ?? 22} years old.`}</div>
    </div>
  );
}

export default Example;
