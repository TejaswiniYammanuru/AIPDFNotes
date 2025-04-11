import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/signup', formData);
      // alert('Signup successful');
      console.log(response.data.token);
      localStorage.setItem('token', response.data.token);
      navigate('/upload');
    } catch (error) {
      console.error('Signup failed', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center">Sign Up</h2>
        <input className="w-full p-3 border rounded mb-4" name="name" placeholder="Name" onChange={handleChange} required />
        <input className="w-full p-3 border rounded mb-4" name="email" placeholder="Email" onChange={handleChange} required />
        <input className="w-full p-3 border rounded mb-4" name="password" type="password" placeholder="Password" onChange={handleChange} required />
        <input className="w-full p-3 border rounded mb-4" name="password_confirmation" type="password" placeholder="Confirm Password" onChange={handleChange} required />
        <button className="w-full bg-purple-500 text-white py-3 rounded-lg hover:bg-purple-600" type="submit">Sign Up</button>
        <p className="mt-4 text-center">Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Sign in</Link></p>
      </form>
    </div>
  );
};

export default Signup;
