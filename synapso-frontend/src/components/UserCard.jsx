import React from "react";
import "./UserCard.css";

const UserCard = ({ user }) => {
  return (
    <div className="user-card">
      <h3>{user.username}</h3>
      <p>📧 {user.email}</p>
      <p><strong>Subjects:</strong> {user.subjects.join(", ")}</p>
      <p><strong>Availability:</strong> {user.availability.join(", ")}</p>
    </div>
  );
};

export default UserCard;

