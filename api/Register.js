import React, { useState } from 'react';

const Register = ({ setToken }) => {
  const apiUrl = 'https://progcourse.000webhostapp.com';
  const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
  const fullUrl = proxyUrl + apiUrl;

  const backendUrl = 'https://opulent-trout-69v5w5wp4qw5c5r6v-3000.app.github.dev';

  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: ''});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      fetch(backendUrl + '/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(form),
            })
                .then((res) => {
                    return res.json();
                })
                .then((data) => {
                    console.log(data);
                    setToken(data.access_token);
                });
    } catch (error) {
      if (error.response) {
        console.error('Error response:', error.response);
      } else if (error.request) {
        console.error('Error request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" value={form.name} onChange={handleChange} placeholder="Name" />
      <input name="email" value={form.email} onChange={handleChange} placeholder="Email" />
      <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" />
      <input name="password_confirmation" type="password" value={form.password_confirmation} onChange={handleChange} placeholder="Password" />
      <button type="submit">Register</button>
    </form>
  );
};

export default Register;
