import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./Login/Login";
import Home from "./Home/Home";
import Signup from "./Signup/Signup";
import "./App.css"
import Auth from "./Auth/Auth";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
 

        <Route path="/auth" element={<Auth />} />
      </Routes>
    </Router>
  );
}

export default App;


// user flow

// user => login page => /login

// homescreen => home => /  (all options for user chat,group,etc)
