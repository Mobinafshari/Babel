import React  , { useState , useEffect }from "react";
import styles from "./Example.module.scss";
import name from "./utils/helper";

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
