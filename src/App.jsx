import React from "react";
import Example from "./Example";
function App() {
  const obj = { name: "hashem" };
  const family = 'afshar'
  return (
    <div onClick={() => alert("hello")} className="h-full">
      <Example {...obj} family={family}>
        <div className="h-[100px]">Hello There!</div>
      </Example>
      {family && <img src="photo.png"/>}
    </div>
  );
}

export default App;
