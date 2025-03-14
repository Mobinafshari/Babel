import React from "react";
import Example from "./Example";
function App() {
  const obj = {
    name: "hashem"
  };
  const family = 'afshar';
  return React.createElement("div", {
    onClick: () => alert("hello"),
    className: "h-full"
  }, family ? React.createElement(Example, null) : React.createElement("p", null, "Not Founded!"), React.createElement("img", {
    src: "photo.png"
  }));
}
export default App;