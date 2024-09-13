// src/popup.tsx
import ReactDOM from "react-dom";

export const Popup = () => {
  return (
    <div>
      <h1>Popup Page</h1>
      <p>This is the popup for your browser extension.</p>
    </div>
  );
};

ReactDOM.render(<Popup />, document.getElementById("popup"));
