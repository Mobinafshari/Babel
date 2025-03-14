import React from "react";
import Example from "./Example";
function App() {
  const obj = { name: "hashem" };
  const family = 'afshar'
  return (
    <div onClick={() => alert("hello")} className="h-full">
      {family ? <Example /> : <p>Not Founded!</p>}
      <img src="photo.png"/>
    </div>
  );
}

export default App;
