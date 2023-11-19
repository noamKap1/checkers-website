import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./auth/Login";
import OpeningScreen from "./screens/openingScreen";
import Register from "./auth/Register";
import SendMessage from "./screens/sendMessage";
import Checkers from "./screens/checkers";
import { Game } from "./screens/checkers/Game";
import CheckersGame from "./screens/playCheckers/ChekcersGame";
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* <Route index element={<App />} /> */}
        <Route path="/" element={<Login />} />
        <Route path="openingScreen" element={<OpeningScreen />} />
        <Route path="register" element={<Register />} />
        <Route path="send" element={<SendMessage />} />
        <Route path="send/checkers" element={<Checkers />} />
        <Route path="send/CheckersGame" element={<CheckersGame />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);


