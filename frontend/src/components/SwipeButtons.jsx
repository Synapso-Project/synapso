import React from "react";
import { X, Heart } from "lucide-react";
import "./SwipeButtons.css";

const SwipeButtons = ({ onLeft, onRight }) => {
  return (
    <div className="swipe-buttons">
      <button className="btn left" onClick={onLeft}><X size={28} /></button>
      <button className="btn right" onClick={onRight}><Heart size={28} /></button>
    </div>
  );
};

export default SwipeButtons;

  
