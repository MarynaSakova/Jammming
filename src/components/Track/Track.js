import React from "react";

function Track({ track, onAdd, onRemove, isRemoval }) {
    if(!track) return null;
    const handleClick = () => {
      isRemoval ? onRemove(track) : onAdd(track);
    };
  
    return (
      <div>
        <p>{track.name} by {track.artist}</p>
        <button onClick={handleClick}>{isRemoval ? "Remove" : "Add"}</button>
      </div>
    );
  }
  

export default Track;