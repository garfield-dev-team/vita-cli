import * as React from "react";
import ReactDOM from "react-dom/client";
import { Button } from "antd";

const { useState, useCallback } = React;

const App: React.FC = () => {
  const [state, setState] = useState(0);

  console.log("===", process.env.REACT_APP_ENV);
  console.log("===", process.env.REACT_APP_KE);
  console.log("===", process.env.REACT_APP_STUDY);

  const handleClick = useCallback(() => {
    console.log(state);
  }, []);

  return (
    <>
      <div>测试内容2333</div>
      <Button type="primary" onClick={handleClick}>
        测试按钮
      </Button>
    </>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById("app") as HTMLDivElement,
);
root.render(<App />);
