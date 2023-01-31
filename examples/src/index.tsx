import * as React from "react";
import ReactDOM from "react-dom/client";
import { Button } from "antd";

const App: React.FC = () => {
  console.log("===", process.env.REACT_APP_ENV);
  console.log("===", process.env.REACT_APP_KE);
  console.log("===", process.env.REACT_APP_STUDY);

  return (
    <>
      <div>测试内容2333</div>
      <Button type="primary">测试按钮</Button>
    </>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById("app") as HTMLDivElement,
);
root.render(<App />);
