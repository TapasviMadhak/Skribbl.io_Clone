import React from 'react';
import './Signup.css';
import { useForm } from "react-hook-form";
import { Link } from 'react-router-dom';

const Signup = () => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const password = watch("password"); // Get the password value for comparison

  const onSubmit = async (data) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Signup failed');
      }
      
      const result = await response.json();
      alert(result.message);
    } catch (error) {
      console.error('Signup error:', error);
      alert(error.message);
    }
  };
  
  return (
    <div className="auth-wrapper">
      <div className="title">skribbl.io</div>
      <div className="container">
        <div className="blurred-background"></div>
        <h2 className="form-text">Signup</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="form-text">Username:</label>
            <input
              type="text" className='input'
              {...register('username', { required: 'Username is required' })}
            />
            {errors.username && <p>{errors.username.message}</p>}
          </div>
          <div>
            <label className="form-text">Password:</label>
            <input
              type="password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
            />
            {errors.password && <p>{errors.password.message}</p>}
          </div>
          <div>
            <label className="form-text">Confirm Password:</label>
            <input
              type="password"
              {...register('confirmPassword', {
                required: 'Password confirmation is required',
                validate: value =>
                  value === password || "Passwords do not match"
              })}
            />
            {errors.confirmPassword && <p>{errors.confirmPassword.message}</p>}
          </div>

          <button type="submit">Signup</button>
        </form>
        <p className='p'>Already have an account? <Link to="/" className='link'>Login</Link></p>
      </div>
    </div>
  );
};

export default Signup;

