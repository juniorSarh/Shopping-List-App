import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import React from "react";  

import App from "./App";
import { store } from "./store";
import "./App.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
  <BrowserRouter>
  <Provider store={store}>
      <App />
  </Provider>
    </BrowserRouter>
  </React.StrictMode>
);
