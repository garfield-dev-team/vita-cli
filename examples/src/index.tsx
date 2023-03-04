import "core-js/stable";
import * as React from "react";
import ReactDOM from "react-dom/client";
// @ts-ignore
import SvgSmile from "./assets/icon_test.svg";

console.log("===", SvgSmile);

const { useState, useCallback } = React;

const App: React.FC = () => {
  const [state, setState] = useState(0);

  console.log("===", process.env.REACT_APP_ENV);
  console.log("===", process.env.REACT_APP_KE);
  console.log("===", process.env.REACT_APP_STUDY);

  const fetchData = async () => {
    await Promise.resolve();
    console.log("===");
  };

  const handleClick = useCallback(() => {
    console.log(state);
    const aaa = [2, 3, 3].at(0);
    console.log(aaa);
    const sym = Symbol();
    console.log(sym);

    const promise = Promise.resolve();
    console.log(promise);

    const arr = ["arr", "yeah!"];
    const check = arr.includes("yeah!");
    console.log(check);

    class Person {}

    console.log(new Person());

    console.log(arr[Symbol.iterator]());

    Array.isArray([1, 2]);
    fetchData();

    console.log(aaa ?? arr);
  }, []);

  return (
    <>
      <div>测试内容2333</div>
      <button onClick={handleClick}>测试按钮</button>
      <SvgSmile />
      {/* <Button type="primary" onClick={handleClick}>
        测试按钮
      </Button> */}
    </>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById("app") as HTMLDivElement,
);
root.render(<App />);
