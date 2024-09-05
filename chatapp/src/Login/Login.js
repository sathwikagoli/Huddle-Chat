import React, { useState } from "react";
import styles from "./styles.module.css";
import { useNavigate, useNavigation } from "react-router-dom";

function Login() {
  // State variables to store the input values
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
 const navigation=useNavigate();


  const handleLogin = () => {
    navigation("/")
  };

  return (
    <div className={styles.loginWrapper}>
      <div className={styles.loginBox}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          className={styles.InputBox}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          className={styles.InputBox}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin} className={styles.buttonClass}>Login</button>
      </div>
    </div>
  );
}

export default Login;
