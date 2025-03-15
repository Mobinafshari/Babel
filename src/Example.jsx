import React from "react";
import styles from "./Example.module.scss";

function Example() {
  const name = "hashem";
  function Declare() {
    const number = 922;
  }
  if (name === "hashem") {
    let age = 20;
  }
  {
    let family = "hashemi";
  }
  return (
    <div>
      <div className="h-full">{`${name} is ${age ?? 22} years old.`}</div>
    </div>
  );
}

export default Example;
