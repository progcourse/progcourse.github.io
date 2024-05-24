import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Register from './Register';
import Login from './Login';
import UserList from './UserList';

const App = () => {
  const [token, setToken] = useState('');

  return (
    <Router>
      <div>
        <Link to="/register">Register</Link>
        <Link to="/login">Login</Link>
        <Link to="/users">Users</Link>
        <Routes>
          <Route path="/register" element={<Register setToken={setToken} />} />
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="/users" element={<UserList token={token} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
