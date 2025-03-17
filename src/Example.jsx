import React from "react";
import styles from "./Example.module.scss";

function Example() {
  const Logger = async () => console.log("hello world!");

  return (
    <div>
      <div className="h-full" onClick={Logger}>
        h
      </div>
    </div>
  );
}

export default Example;
