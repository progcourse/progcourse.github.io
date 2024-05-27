import React, { useEffect, useState } from 'react';

const UserList = ({ token }) => {
  const apiUrl = 'https://progcourse.000webhostapp.com';
  const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
  const fullUrl = proxyUrl + apiUrl;
  
  const backendUrl = 'https://opulent-trout-69v5w5wp4qw5c5r6v-3000.app.github.dev';
  
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(backendUrl + '/api/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('There was an error fetching the users!', error);
      }
    };

    if (token) {
      fetchUsers();
    }
  }, [token]);

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name} - {user.email}</li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
