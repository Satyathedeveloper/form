import React, { useState } from "react";
import axios from "axios";
import "./login.css";
import imagePath from "./login2.jpg";

import { useNavigate } from 'react-router-dom';
const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Please fill in all the fields!");
      return;
    }
    
    try {
      const response = await axios.post("http://localhost:5000/api/user/login", {
        email,
        password,
      });
      alert(`Login successful! Welcome, ${response.data.uniquekey}`);
      navigate(`/form/${response.data.uniquekey}`);
    } catch (error) {
      alert(error.response?.data?.uniquekey || "Login failed!");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword || !name) {
      alert("Please fill in all the fields!");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    try {
      const response = await axios.post("http://localhost:5000/api/user/signup", {
        name,
        email,
        password,
      });
      alert("Signup successful! Please log in.");

      setIsLogin(true);
    } catch (error) {
      alert(error.response?.data?.message || "Signup failed! Email must be unique.");
    }
  };

  return (
    <div className="auth-container">
      <div className="form-container">
        <div className={`flip-card ${!isLogin ? "flipped" : ""}`}>
          {/* Login Form */}
          <div className="auth-form">
            <div className="image-container">
              <div>
                <h1 className="heading">Welcome Back!</h1>
                <p className="subheading">Log in to your account and continue.</p>
                <form onSubmit={handleLogin}>
                  <fieldset className="fieldset">
                    <legend className="legend">Email</legend>
                    <input
                      className="input-field"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </fieldset>
                  <fieldset className="fieldset">
                    <legend className="legend">Password</legend>
                    <input
                      className="input-field"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </fieldset>
                  <label className="checkbox-label">
                    <input className="checkbox" type="checkbox" />
                    Remember Me
                  </label>
                  <button className="submit-button" type="submit">
                    Log in
                  </button>
                </form>
                <p className="login-message">
                  Don't have an account?{" "}
                  <button
                    className="toggle-button"
                    onClick={() => setIsLogin(false)}
                  >
                    Sign up here
                  </button>
                </p>
              </div>
              <div className="image"></div>
            </div>
          </div>

          {/* Signup Form */}
          <div className="signup-form">
            <div className="image-container">
              <div>
                <h1 className="heading">Ready to start your journey?</h1>
                <p className="subheading">Sign up for our website!</p>
                <form onSubmit={handleSignup}>
                  <fieldset className="fieldset">
                    <legend className="legend">Name</legend>
                    <input
                      className="input-field"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </fieldset>
                  <fieldset className="fieldset">
                    <legend className="legend">Email</legend>
                    <input
                      className="input-field"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </fieldset>
                  <fieldset className="fieldset">
                    <legend className="legend">Password</legend>
                    <input
                      className="input-field"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </fieldset>
                  <fieldset className="fieldset">
                    <legend className="legend">Re-enter Password</legend>
                    <input
                      className="input-field"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </fieldset>
                  <label className="checkbox-label">
                    <input className="checkbox" type="checkbox" />
                    I agree to the{" "}
                    <a href="" className="terms-link">
                      Terms & Conditions
                    </a>
                  </label>
                  <button className="submit-button" type="submit">
                    Sign up
                  </button>
                </form>
                <p className="login-message">
                  Already have an account?{" "}
                  <button
                    className="toggle-button"
                    onClick={() => setIsLogin(true)}
                  >
                    Log in here
                  </button>
                </p>
              </div>
              <div
                className="image"
                style={{
                  backgroundImage: `url(${imagePath})`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
