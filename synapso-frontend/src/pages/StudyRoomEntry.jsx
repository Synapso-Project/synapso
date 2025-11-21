import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header"; // <-- Add this import

const StudyRoomEntry = () => {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [createMode, setCreateMode] = useState(true);
  const navigate = useNavigate();

  const handleJoin = () => {
    if (!roomId || !username) return;
    navigate(`/studyroom/${roomId}?username=${username}${createMode ? "&owner=1" : ""}`);
  };

  return (
    <>
      <Header /> {/* Add the header at the very top */}
      <div style={{
        minHeight: "100vh",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(135deg,#d9c096,#b59175 30%,#886355 70%,#3d302d 100%)",
        padding: 40
      }}>
        <h2 style={{ color: "#3d302d", fontWeight: 800, fontSize: "2rem", marginBottom: 30 }}>
          {createMode ? "Start a Study Room" : "Join a Study Room"}
        </h2>
        <input value={roomId} onChange={e => setRoomId(e.target.value)}
          placeholder="Room ID (e.g. math-101)" style={inputStyle} />
        <input value={username} onChange={e => setUsername(e.target.value)}
          placeholder="Your Name" style={inputStyle} />
        <button
          style={btnStyle}
          onClick={handleJoin}
        >
          {createMode ? "Create Room" : "Join Room"}
        </button>
        <div style={{ marginTop: 24 }}>
          <button
            style={{ ...btnStyle, fontSize: "1rem", background: "transparent", color: "#3d302d", border: "none" }}
            onClick={() => setCreateMode((c) => !c)}>
            {createMode ? "Want to join instead?" : "Want to create your own room?"}
          </button>
        </div>
      </div>
    </>
  );
};

const inputStyle = {
  borderRadius: 12, fontSize: 18, padding: 16, margin: "10px 0", border: "1px solid #b59175", minWidth: 280,
  outline: "none"
};
const btnStyle = {
  background: "linear-gradient(135deg, #b59175, #886355)", color: "white", border: "none",
  padding: "14px 22px", borderRadius: 12, cursor: "pointer", fontWeight: 700, fontSize: "1.15rem",
  marginTop: 12, minWidth: 145, boxShadow: "0 2px 12px #88635533"
};

export default StudyRoomEntry;
