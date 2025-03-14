import React from 'react'
import styles from "./Example.module.scss";

function Example() {
  const name = 'hashem'
  return (
    <div>
      <div className={styles["disabled"]}>example react component</div>
      <button disabled style={{color : "red"}}>Click me</button>
      <div className="h-full">{name}</div>
    </div>
  );
}

export default Example