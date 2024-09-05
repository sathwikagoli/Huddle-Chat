import React, { useEffect, useState } from "react";
import "./Auth.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(false);

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: "",
    confirmPassword: "",
    username: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    const checkTokenValidity = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        setLoading(true);
        try {
          const response = await axios.get(
            "http://localhost:5000/api/auth/verify",
            {
              headers: {
                "x-auth-token": token,
              },
            }
          );
          if (response.data && response.data.user) {
            setUser(true);
            navigate("/"); // Token is valid, navigate to the main page
          }
        } catch (err) {
          setUser(false);
          setError(err.response?.data?.msg || "Token verification failed");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        } finally {
          setLoading(false);
        }
      }
    };

    checkTokenValidity();
  }, [navigate]);
  const handleLogin = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          credential: formData.emailOrUsername, // Use email or username
          password: formData.password,
        }
      );

      const { token, user } = response.data;
      localStorage.setItem("token", token); // Store the JWT token
      localStorage.setItem("user", JSON.stringify(user)); // Store user data
      navigate("/");
    } catch (error) {
      setError(error.response.data.msg || "Login failed");
    }
  };

  const handleSignup = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/signup",
        {
          name: formData.username,
          email: formData.emailOrUsername, // Use email
          password: formData.password,
        }
      );

      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/");
    } catch (error) {
      setError(error.response.data.msg || "Signup failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
      // Handle Login
      console.log("Logging in with", formData);
      await handleLogin();
    } else {
      // Handle Sign-Up
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords don't match");
        return;
      }
      await handleSignup();
    }
  };
  if (loading) {
    return <p>loading...</p>;
  }
  return (
    <>
      {!loading && !user && (
        <div className="auth-container">
          <h2>{isLogin ? "Login" : "Sign Up"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="emailOrUsername">
                {isLogin ? "Email or Username:" : "Email:"}
              </label>
              <input
                type="text"
                name="emailOrUsername"
                value={formData.emailOrUsername}
                onChange={handleChange}
                required
              />
            </div>
            {!isLogin && (
              <>
                <div className="input-group">
                  <label htmlFor="username">Username:</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>
              </>
            )}
            <div className="input-group">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            {!isLogin && (
              <>
                <div className="input-group">
                  <label htmlFor="confirmPassword">Confirm Password:</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </>
            )}
            <button className="butt" type="submit">{isLogin ? "Login" : "Sign Up"}</button>
          </form>
          <div className="toggle-link">
            {isLogin ? (
              <p>
                Don't have an account?{" "}
                <span onClick={() => setIsLogin(false)}>Sign Up</span>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <span onClick={() => setIsLogin(true)}>Login</span>
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Auth;
