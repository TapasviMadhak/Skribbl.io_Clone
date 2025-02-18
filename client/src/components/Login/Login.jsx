import React, { createContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import './Login.css';
import { useForm } from "react-hook-form";


const LoginContext = createContext();

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize useNavigate

  const handleLogin = async (data) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        setError(result.message || "Login failed. Try again.");
        return;
      }

      const result = await response.json();
      localStorage.setItem("token", result.token); // Store the token
      localStorage.setItem("userId", data.username);
      navigate("/home"); // Redirect to /home after successful login
    } catch (error) {
      console.error("Error during login:", error);
      setError("Something went wrong. Try again.");
    }
  };

  return (
    <LoginContext.Provider value={{ error }}>
      <div className="auth-wrapper">
        <div className="title">skribbl.io</div>
        <div className="container">
          <div className="blurred-background"></div>
          <h2 className="form-text">Login</h2>
          <form onSubmit={handleSubmit(handleLogin)}>
            <div className="form-group">
              <label className="form-text">Username:</label>
              <input
                type="text"
                {...register("username", { required: "Username is required" })}
              />
              {errors.username && <p className="error">{errors.username.message}</p>}
            </div>
            <div className="form-group">
              <label className="form-text">Password:</label>
              <input
                type="password"
                {...register("password", { required: "Password is required" })}
              />
              {errors.password && <p className="error">{errors.password.message}</p>}
            </div>
            <button type="submit">Login</button>
            {error && <p className="error">{error}</p>}
          </form>
          <p className="p">Don't have an account? <Link to="/signup">Sign up</Link></p>
        </div>
      </div>
    </LoginContext.Provider>
  );
};

export default Login;
