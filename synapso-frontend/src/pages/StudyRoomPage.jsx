import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const StudyRoomPage = () => {
  const { roomId } = useParams();
  const query = useQuery();
  const navigate = useNavigate();
  const username = query.get("username");

  const WS_URL = `ws://localhost:8000/ws/studyroom/${roomId}/${username}`;

  const [users, setUsers] = useState([]);
  const [owner, setOwner] = useState("");
  const [ws, setWs] = useState(null);
  const [connected, setConnected] = useState(false);

  const [timer, setTimer] = useState({ running: false, remaining: 1500, start_time: null });
  const [timeLeft, setTimeLeft] = useState(1500);
  const intervalRef = useRef();

  useEffect(() => {
    if (!username) return;
    const socket = new window.WebSocket(WS_URL);

    socket.onopen = () => setConnected(true);

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "user_list") {
        setUsers(msg.users || []);
        setOwner(msg.owner || "");
      }
      if (msg.type === "timer_update") {
        setTimer(msg.data);
        setTimeLeft(msg.data.remaining);
      }
    };
    socket.onerror = () => setConnected(false);
    socket.onclose = () => setConnected(false);
    setWs(socket);

    return () => {
      socket.close();
      clearInterval(intervalRef.current);
    };
  }, [roomId, username, WS_URL]);

  useEffect(() => {
    if (timer.running) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
      setTimeLeft(timer.remaining);
    }
    return () => clearInterval(intervalRef.current);
  }, [timer.running, timer.remaining]);

  useEffect(() => {
    if (timer.running && timeLeft === 0) {
      sendTimer({ ...timer, running: false, remaining: 0 });
    }
  }, [timeLeft]); // eslint-disable-line

  const sendTimer = (newTimer) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "timer_update", data: newTimer }));
    }
  };

  const startTimer = () => sendTimer({ running: true, remaining: timeLeft, start_time: Date.now() });
  const pauseTimer = () => sendTimer({ running: false, remaining: timeLeft, start_time: null });
  const resetTimer = (sec = 1500) => sendTimer({ running: false, remaining: sec, start_time: null });

  const fmt = (n) => String(Math.floor(n / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0');

  const isOwner = username === owner;

  return (
    <>
      <Header />
      <div style={{
        minHeight: "calc(100vh - 80px)", display: "flex",
        flexDirection: "row", alignItems: "stretch", justifyContent: "center",
        background: "linear-gradient(135deg,#d9c096,#b59175 30%,#886355 70%,#3d302d 100%)"
      }}>
        {/* Side panel: users */}
        <div style={{
          width: 260, marginTop: 60, marginRight: 32, padding: 24,
          background: "rgba(255,255,255,0.18)", borderRadius: 24, minHeight: 260,
          boxShadow: "0 3px 16px #d9c09622", fontSize: 18
        }}>
          <h3 style={{ color: "#3d302d", fontWeight: "bold", fontSize: "1.15rem", marginBottom: 18 }}>
            Room: {roomId}
          </h3>
          <div style={{ color: "#3d302d", fontWeight: 700, marginBottom: 6 }}>
            Owner:
            <span style={{ color: "#38a169" }}> {owner}{isOwner && " (You)"}</span>
          </div>
          <div style={{ margin: "4px 0 8px 0", color: "#3d302d", fontWeight: 600 }}>People in Room:</div>
          <ul style={{ margin: 0, padding: 0, marginLeft: 12 }}>
            {users.map(u => (
              <li key={u} style={{
                color: u === owner ? "#38a169" : "#3d302d",
                fontWeight: u === owner ? 700 : 500,
                fontSize: u === owner ? "1.09rem" : "1rem"
              }}>
                {u}{u === owner ? " 👑" : ""}
                {u === username ? " (You)" : ""}
              </li>
            ))}
          </ul>
        </div>
        {/* Timer/main area */}
        <div style={{
          flexGrow: 1,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            marginTop: 46, background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(20px)", borderRadius: 30, padding: 40,
            minWidth: 350, boxShadow: "0 6px 24px #b5917533",
            border: "1px solid rgba(255, 255, 255, 0.18)"
          }}>
            <div style={{
              fontSize: 58, fontWeight: 800, letterSpacing: 2, color: '#3d302d', marginBottom: 30,
              fontFamily: "monospace", textAlign: "center"
            }}>
              {fmt(timeLeft)}
            </div>
            {/* Timer controls for owner only */}
            {isOwner && (
              <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
                {!timer.running ? (
                  <button onClick={startTimer} style={btnStyle}>Start</button>
                ) : (
                  <button onClick={pauseTimer} style={btnStyle}>Pause</button>
                )}
                <button onClick={() => resetTimer(1500)} style={btnStyle}>Reset</button>
                <button onClick={() => resetTimer(300)} style={btnStyle}>Break 5min</button>
              </div>
            )}
            {!isOwner && (
              <div style={{
                marginTop: "12px", color: "#886355", background: "rgba(181, 145, 117, 0.12)",
                padding: 8, borderRadius: 8, fontSize: 16, textAlign: "center"
              }}>
                Only the owner (<b>{owner}</b>) can control the timer.
              </div>
            )}
            <div style={{ marginTop: 16, color: "#886355", textAlign: 'center', fontSize: '0.95rem' }}>
              <small style={{ fontSize: '0.87rem', opacity: 0.75 }}>
                Open this room in another tab or device to test multi-user!
              </small>
            </div>
          </div>
          <button style={{
            marginTop: 24, background: "none", color: "#3d302d", border: "none", cursor: "pointer",
            fontWeight: 600, textDecoration: "underline", fontSize: 18
          }} onClick={() => navigate("/studyroom-entry")}>
            Leave Room
          </button>
        </div>
      </div>
    </>
  );
};

const btnStyle = {
  background: 'linear-gradient(135deg, #b59175, #886355)', color: 'white', border: 'none',
  padding: '11px 20px', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: 16, minWidth: 85,
  transition: 'all 0.3s', boxShadow: '0 4px 15px rgba(136, 99, 85, 0.3)'
};

export default StudyRoomPage;
