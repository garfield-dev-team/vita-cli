import * as React from "react";
import ReactDOM from "react-dom/client";
import { Button } from "antd";

const App: React.FC = () => {
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
