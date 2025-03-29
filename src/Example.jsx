import React, { useState, useEffect } from "react";
import styles from "./Example.module.scss";
import name from "./utils/helper";

function Example() {
  const message = `hello ppl in ${new Date().getFullYear()}`;
  console.log('hello world!')
  return (
    <div>
      <div className="h-full" onClick={Logger}>
        {`the message was ${message}`}
      </div>
    </div>
  );
}

export default Example;
