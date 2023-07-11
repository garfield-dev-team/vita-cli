import * as React from "react";
import ReactDOM from "react-dom/client";
import { ReactComponent as IconRefresh } from "@/assets/icon_refresh.svg";

const App: React.FC = () => {
  return (
    <div>
      <IconRefresh />
    </div>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById("app") as HTMLDivElement,
);
root.render(<App />);
