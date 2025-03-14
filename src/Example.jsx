import React from 'react'
import styles from "./Example.module.scss";

function Example() {
  return (
    <div>
      <div className={styles["disabled"]}>example react component</div>
      <button disabled>Click me</button>
      <div className="h-full">h-full</div>
    </div>
  );
}

export default Example