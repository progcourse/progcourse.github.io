import React, { useEffect, useState } from 'react';

const UserList = ({ token }) => {
  const apiUrl = 'https://progcourse.000webhostapp.com';
  const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
  const fullUrl = proxyUrl + apiUrl;
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(fullUrl + '/api/users', {
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
