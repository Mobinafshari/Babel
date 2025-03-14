import React from "react";
import Example from "./Example";
function App() {
  const obj = {
    name: "hashem",
  };
  const family = "afshar";
  return React.createElement(
    "div",
    {
      onClick: () => alert("hello"),
      className: "h-full",
    },
    React.createElement(
      Example,
      {
        ...obj,
        family: family,
      },
      React.createElement(
        "div",
        {
          className: "h-[100px]",
        },
        "Hello There!"
      )
    ),
    family &&
      React.createElement("img", {
        src: "photo.png",
      })
  );
}
export default App;
