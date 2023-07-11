import "core-js/stable";
import * as React from "react";
import ReactDOM from "react-dom/client";
import { Button } from "antd";
// import { ReactComponent as SvgSmile } from "@/assets/icon_test.svg";
import "./style.css";

const Home = await import("./components/Home").then((m) => m.default);
const User = await import("./components/UserInfo").then((m) => m.default);

// if (!window.aaa) {
//   window.aaa = (await import("./async_test")).default;
// }

// console.log("===", SvgSmile);

const { useState, useEffect, useCallback } = React;

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

  const fetchUserInfo = useCallback(async () => {}, []);

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  return (
    <>
      <div>测试内容2333</div>
      <button type="button" onClick={handleClick}>
        测试按钮
      </button>
      <Button>测试内容2333</Button>
      <div className="icon-svg-smile"></div>
      {/* <SvgSmile /> */}
      {/* <Button type="primary" onClick={handleClick}>
        测试按钮
      </Button> */}
      <Home />
      <User />
    </>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById("app") as HTMLDivElement,
);
root.render(<App />);
