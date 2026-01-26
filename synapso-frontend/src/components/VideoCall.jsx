import React, { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";

const VideoCall = ({ roomId, username, users }) => {
  const [localStream, setLocalStream] = useState(null);
  const [peers, setPeers] = useState({});
  const userVideo = useRef();
  const peersRef = useRef({});

  // Get user's camera
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        setLocalStream(stream);
        if (userVideo.current) {
          userVideo.current.srcObject = stream;
        }
      })
      .catch(err => console.error("Camera error:", err));

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "12px", padding: "20px"
    }}>
      {/* Your video */}
      <div style={{ position: "relative" }}>
        <video
          ref={userVideo}
          autoPlay
          muted
          playsInline
          style={{
            width: "100%", borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
          }}
        />
        <div style={{
          position: "absolute", bottom: "8px", left: "8px",
          background: "rgba(0,0,0,0.6)", color: "white",
          padding: "4px 8px", borderRadius: "4px", fontSize: "12px"
        }}>
          {username} (You)
        </div>
      </div>

      {/* Other users' videos will go here */}
      {Object.keys(peers).map(peerId => (
        <Video key={peerId} peer={peers[peerId]} />
      ))}
    </div>
  );
};

const Video = ({ peer }) => {
  const ref = useRef();

  useEffect(() => {
    peer.on("stream", stream => {
      ref.current.srcObject = stream;
    });
  }, [peer]);

  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      style={{
        width: "100%", borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
      }}
    />
  );
};

export default VideoCall;
