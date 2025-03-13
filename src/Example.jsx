import React from 'react'
import styles from "./Example.module.scss";

function example() {
  return (
    <>
      <div className={styles["disabled"]}>example react component</div>
      <button disabled>Click me</button>
      <div className="h-full">h-full</div>
    </>
  );
}

export default example