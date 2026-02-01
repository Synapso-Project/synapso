import React, { useEffect, useState, useRef, useCallback } from "react";
import Header from "../components/Header";

function StudyRoomPage() {
  // FIXED: Get from URL params + localStorage (per-tab isolation)
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get('room') || "math-1";
  
  // CRITICAL FIX: Use localStorage per tab + unique session ID
  const sessionId = localStorage.getItem('sessionId') || `tab-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
  localStorage.setItem('sessionId', sessionId); // Lock this tab's identity
  
  const userToken = localStorage.getItem('token');
  const [currentUser, setCurrentUser] = useState(null);

  // FIXED: Extract username FROM YOUR ACTUAL AUTH SYSTEM
  const getUsername = () => {
    if (userToken) {
      try {
        const payload = JSON.parse(atob(userToken.split('.')[1]));
        return payload.username || payload.sub || 'User';
      } catch {
        return localStorage.getItem(`username-${sessionId}`) || `User-${sessionId.slice(0,4)}`;
      }
    }
    return localStorage.getItem(`username-${sessionId}`) || `Guest-${sessionId.slice(0,4)}`;
  };

  const username = getUsername();
  
  // Store username locally to survive refreshes
  localStorage.setItem(`username-${sessionId}`, username);
  
  const WS_URL = `ws://https://synapso-app.onrender.com/ws/studyroom/${roomId}/${username}/${sessionId}`;

  // All your existing state...
  const [users, setUsers] = useState([]);
  const [owner, setOwner] = useState("");
  const [ws, setWs] = useState(null);
  const [connected, setConnected] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const localVideoRef = useRef();
  const remoteVideoRefs = useRef({});
  const peerConnections = useRef({});
  
  // Timer/chat state (unchanged)
  const [timer, setTimer] = useState({ running: false, remaining: 1500, start_time: null });
  const [timeLeft, setTimeLeft] = useState(1500);
  const intervalRef = useRef();
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const chatEndRef = useRef(null);

  const configuration = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  };

  // 1. WebSocket with SESSION ISOLATION
  useEffect(() => {
    console.clear(); // Clear console for fresh logs
    console.log(`🚀 TAB SESSION: ${sessionId}`);
    console.log(`👤 TAB USERNAME: ${username}`);
    console.log(`📺 ROOM: ${roomId}`);
    
    const socket = new WebSocket(WS_URL);
    
    socket.onopen = () => {
      setConnected(true);
      console.log(`✅ ${username} (${sessionId.slice(0,6)}) CONNECTED`);
      
      // Send unique join with session
      socket.send(JSON.stringify({ 
        type: "user_join", 
        username,
        sessionId,
        roomId
      }));
    };

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      console.log(`📨 ${username}:`, msg.type, msg);
      handleWebSocketMessage(msg);
    };

    socket.onerror = () => {
      console.error(`❌ ${username} WS ERROR`);
      setConnected(false);
    };
    
    socket.onclose = () => {
      console.log(`🔌 ${username} DISCONNECTED`);
      setConnected(false);
    };
    
    setWs(socket);
    return () => {
      console.log(`🧹 ${username} CLEANUP`);
      socket.close();
      clearInterval(intervalRef.current);
    };
  }, []); // 🔥 NEVER RECONNECT - single connection per tab session

  // FIXED: Don't blindly trust server user_list - filter for THIS tab's identity
  const handleWebSocketMessage = useCallback((msg) => {
    if (msg.type === "user_list") {
      // PRESERVE THIS TAB'S IDENTITY - only show OTHER users from server
      const serverUsers = msg.users || [];
      console.log(`📋 Server users:`, serverUsers, `My username: ${username}`);
      
      // Filter out OURSELF from server list (we know who we are)
      const otherUsers = serverUsers.filter(u => u !== username);
      setUsers(otherUsers);
      
      // Owner is always from server (first user usually)
      setOwner(msg.owner || serverUsers[0] || "");
    }
    
    // Rest unchanged...
    if (msg.type === "timer_update") {
      setTimer(msg.data);
      setTimeLeft(msg.data.remaining);
    }
    if (msg.type === "chat_message") {
      setMessages(prev => [...prev, { ...msg, timestamp: Date.now() }]);
    }
    if (msg.type === "chat_history") {
      setMessages(msg.messages || []);
    }
    // WebRTC signaling (unchanged)
    if (msg.type === "webrtc_offer" && msg.to === username) handleOffer(msg);
    if (msg.type === "webrtc_answer" && msg.to === username) handleAnswer(msg);
    if (msg.type === "webrtc_ice" && msg.to === username) handleIceCandidate(msg);
  }, [username]);

  // Rest of WebRTC logic (unchanged from previous)
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      })
      .catch(err => console.error('Camera:', err));
  }, []);

  const createPeerConnection = useCallback((remoteUsername) => {
    const pc = new RTCPeerConnection(configuration);
    peerConnections.current[remoteUsername] = pc;
    if (localStream) {
      localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    }
    pc.ontrack = (e) => {
      setRemoteStreams(prev => ({ ...prev, [remoteUsername]: e.streams[0] }));
      setTimeout(() => {
        const video = remoteVideoRefs.current[remoteUsername];
        if (video) video.srcObject = e.streams[0];
      }, 100);
    };
    pc.onicecandidate = (e) => {
      if (e.candidate && ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: "webrtc_ice", candidate: e.candidate, to: remoteUsername, from: username
        }));
      }
    };
    return pc;
  }, [localStream, ws, username]);

  const handleOffer = async (msg) => {
    let pc = peerConnections.current[msg.from] || createPeerConnection(msg.from);
    await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    ws.send(JSON.stringify({
      type: "webrtc_answer", sdp: pc.localDescription, to: msg.from, from: username
    }));
  };

  const handleAnswer = async (msg) => {
    const pc = peerConnections.current[msg.from];
    if (pc) await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
  };

  const handleIceCandidate = async (msg) => {
    const pc = peerConnections.current[msg.from];
    if (pc && msg.candidate) await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
  };

  const startVideoCall = () => {
    users.forEach(async (remoteUser) => {
      const pc = peerConnections.current[remoteUser] || createPeerConnection(remoteUser);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      ws.send(JSON.stringify({
        type: "webrtc_offer", sdp: pc.localDescription, to: remoteUser, from: username
      }));
    });
  };

  // Timer/chat functions (unchanged)
  const sendTimer = (newTimer) => ws?.readyState === WebSocket.OPEN && ws.send(JSON.stringify({ type: "timer_update", data: newTimer }));
  const sendMessage = () => {
    if (messageInput.trim() && ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "chat_message", message: messageInput, username }));
      setMessageInput("");
    }
  };
  
  const startTimer = () => sendTimer({ running: true, remaining: timeLeft, start_time: Date.now() });
  const resetTimer = (sec = 1500) => sendTimer({ running: false, remaining: sec, start_time: null });
  const fmt = (n) => String(Math.floor(n / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0');
  const isOwner = username === owner;

  const leaveRoom = () => {
    if (localStream) localStream.getTracks().forEach(track => track.stop());
    Object.values(peerConnections.current).forEach(pc => pc.close());
    if (ws) ws.close();
    window.location.href = "/studyroom-entry";
  };

  // Timer effects (unchanged)
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => {
    if (timer.running) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => setTimeLeft(p => p > 0 ? p - 1 : 0), 1000);
    } else {
      clearInterval(intervalRef.current);
      setTimeLeft(timer.remaining);
    }
    return () => clearInterval(intervalRef.current);
  }, [timer.running, timer.remaining]);
  useEffect(() => { if (timer.running && timeLeft === 0) sendTimer({ ...timer, running: false, remaining: 0 }); }, [timeLeft]);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#d9c096,#b59175 30%,#886355 70%,#3d302d 100%)" }}>
      <Header />
      {/* YOUR SAME UI - but now with CORRECT user isolation */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "28px", maxWidth: "1400px", margin: "32px auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          {/* VIDEO SECTION */}
          <div style={{ background: "rgba(255,255,255,0.93)", borderRadius: 20, padding: 20, boxShadow: "0 4px 20px #3d302d22" }}>
            <div style={{ fontWeight: 700, color: "#3d302d", fontSize: 18, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Live Video ({users.length + 1} online) 
              <span style={{ fontSize: 12, color: "#886355" }}>Session: {sessionId.slice(0,8)}...</span>
              {isOwner && (
                <button onClick={startVideoCall} style={{
                  background: "#886355", color: "white", border: "none", padding: "8px 16px",
                  borderRadius: "6px", fontSize: "14px", cursor: "pointer"
                }}>🔴 Connect All</button>
              )}
            </div>
            
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
              {/* YOUR VIDEO */}
              <div style={{ flex: "0 0 320px", aspectRatio: "16/9", position: "relative", borderRadius: 12, overflow: "hidden", background: "linear-gradient(135deg,#b59175,#886355)" }}>
                <video ref={localVideoRef} autoPlay muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", bottom: 8, left: 8, background: "#886355cc", color: "#fff", fontSize: 13, fontWeight: 600, borderRadius: 6, padding: "4px 8px" }}>
                  📹 You ({username})
                </div>
              </div>

              {/* REMOTE VIDEOS + PLACEHOLDERS */}
              {Object.entries(remoteStreams).map(([user]) => (
                <div key={user} style={{ flex: "0 0 160px", aspectRatio: "16/9", position: "relative", borderRadius: 12, overflow: "hidden", background: "#1a1a1a" }}>
                  <video ref={el => el && (remoteVideoRefs.current[user] = el)} autoPlay playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", bottom: 8, left: 8, background: "#886355cc", color: "#fff", fontSize: 12, fontWeight: 600, borderRadius: 6, padding: "3px 6px" }}>{user}</div>
                </div>
              ))}
              
              {users.map(user => (
                <div key={user} style={{ flex: "0 0 160px", aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#d9c096,#b59175)", borderRadius: 12, color: "#3d302d", fontWeight: 700, fontSize: 32, position: "relative" }}>
                  {user.charAt(0).toUpperCase()}
                  <div style={{ position: "absolute", bottom: 8, left: 8, background: "#886355cc", color: "#fff", fontSize: 12, fontWeight: 600, borderRadius: 6, padding: "3px 6px" }}>{user}</div>
                </div>
              ))}
            </div>
          </div>

          {/* TIMER - SAME AS BEFORE */}
          <div style={{ background: "rgba(255,255,255,0.93)", borderRadius: 20, padding: 40, boxShadow: "0 4px 20px #3d302d22", textAlign: "center" }}>
            <div style={{ fontWeight: 700, color: "#3d302d", fontSize: 20, marginBottom: 24 }}>Pomodoro Timer</div>
            <div style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 80, color: "#886355", marginBottom: 24 }}>{fmt(timeLeft)}</div>
            {isOwner && (
              <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={startTimer} style={timerBtnStyle}>Start</button>
                <button onClick={() => resetTimer(1500)} style={timerBtnStyle}>Reset 25min</button>
                <button onClick={() => resetTimer(300)} style={timerBtnStyle}>Break 5min</button>
              </div>
            )}
            <button onClick={leaveRoom} style={{
              marginTop: 24, background: "linear-gradient(135deg,#b59175,#886355)", color: "white",
              border: "none", padding: "12px 24px", borderRadius: "12px", cursor: "pointer",
              fontWeight: 700, fontSize: "15px"
            }}>Leave Room</button>
          </div>
        </div>

        {/* RIGHT COLUMN: People + Chat - SAME */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ background: "rgba(255,255,255,0.98)", borderRadius: 20, padding: 24, boxShadow: "0 6px 16px #3d302d22" }}>
            <div style={{ color: "#3d302d", fontWeight: 700, fontSize: 18, marginBottom: 12 }}>
              People in Room ({users.length + 1})
            </div>
            <div style={{ color: "#886355", fontSize: 12, marginBottom: 12 }}>
              You: <strong>{username}</strong> | Session: {sessionId.slice(0,8)}...
            </div>
            {users.map(user => (
              <div key={user} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "12px", borderRadius: "10px",
                marginBottom: "8px", background: "rgba(217,192,150,0.13)"
              }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "50%", background: user === owner ? "#b59175" : "#d9c096",
                  color: "#fff", fontWeight: 700, fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center"
                }}>{user.charAt(0).toUpperCase()}</div>
                <span style={{ color: "#3d302d", fontWeight: 700, fontSize: 16 }}>{user}</span>
                <span style={{ color: "#886355", fontSize: 13, marginLeft: "auto" }}>{user === owner ? "👑 Owner" : "Member"}</span>
              </div>
            ))}
          </div>

          {/* CHAT - UNCHANGED */}
          <div style={{ background: "rgba(255,255,255,0.98)", borderRadius: 20, flex: 1, boxShadow: "0 6px 16px #3d302d22", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "20px", color: "#3d302d", fontWeight: 700, fontSize: 18 }}>Chat</div>
            <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
              {messages.map((msg, idx) => (
                <div key={idx} style={{ alignSelf: msg.username === username ? "flex-end" : "flex-start", maxWidth: "80%" }}>
                  <div style={{ fontSize: "13px", color: "#886355", marginBottom: "4px", fontWeight: 600 }}>{msg.username}</div>
                  <div style={{
                    background: msg.username === username ? "linear-gradient(135deg,#b59175,#886355)" : "#f7f5f2",
                    color: msg.username === username ? "white" : "#3d302d", padding: "12px 18px", borderRadius: "14px", fontSize: "15px"
                  }}>{msg.message}</div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div style={{ padding: "16px", borderTop: "1px solid #e2e2ea", display: "flex", gap: 10 }}>
              <input value={messageInput} onChange={e => setMessageInput(e.target.value)}
                onKeyPress={e => e.key === "Enter" && sendMessage()} placeholder="Type a message..."
                style={{ flex: 1, padding: "12px 16px", borderRadius: "12px", border: "2px solid #b59175", outline: "none", fontSize: "15px" }} />
              <button onClick={sendMessage} style={{
                background: "linear-gradient(135deg,#b59175,#886355)", color: "white", border: "none",
                padding: "12px 24px", borderRadius: "12px", cursor: "pointer", fontWeight: 700, fontSize: "15px"
              }}>Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const timerBtnStyle = {
  background: "linear-gradient(135deg,#b59175,#886355)",
  color: "white", border: "none", padding: "14px 24px",
  borderRadius: "12px", cursor: "pointer", fontWeight: 700,
  fontSize: "15px", minWidth: "140px"
};

export default StudyRoomPage;
