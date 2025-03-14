import React from "react";
import Example from "./Example";
function App() {
  return (
    <div onClick={() => alert("hello")} className="h-full">
      <Example />
      <img src="photo.png"/>
    </div>
  );
}

export default App;
