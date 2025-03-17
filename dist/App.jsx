import React from "react";
import Example from "./Example";
function App() {
  return React.createElement("div", {
    className: "h-full"
  }, React.createElement(Example, null), React.createElement("img", {
    src: "photo.png"
  }));
}
export default App;