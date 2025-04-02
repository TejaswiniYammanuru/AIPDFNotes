import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/login', formData);
      alert('Login successful');
      console.log(response.data.token);
      localStorage.setItem('token', response.data.token);
      navigate('/');
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center">Login</h2>
        <input className="w-full p-3 border rounded mb-4" name="email" placeholder="Email" onChange={handleChange} required />
        <input className="w-full p-3 border rounded mb-4" name="password" type="password" placeholder="Password" onChange={handleChange} required />
        <button className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600" type="submit">Login</button>
        <p className="mt-4 text-center">Don't have an account? <Link to="/signup" className="text-blue-500 hover:underline">Sign up</Link></p>
      </form>
    </div>
  );
};

export default Login;