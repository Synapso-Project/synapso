import React from "react";
import "./MatchModal.css";

const MatchModal = ({ user, onClose }) => {
  return (
    <div className="match-modal">
      <div className="modal-content">
        <h3>🎉 It’s a Match!</h3>
        <p>You matched with {user.username}!</p>
        <p>Subjects: {user.subjects.join(", ")}</p>
        <p>Availability: {user.availability.join(", ")}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default MatchModal;
