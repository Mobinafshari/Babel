import React from 'react'
import styles from "./Example.module.scss";

function Example() {
  const name = 'hashem';
  let age = 20;
  return (
    <div>
      <div className="h-full">{`${name} is ${age} years old.`}</div>
    </div>
  );
}

export default Example