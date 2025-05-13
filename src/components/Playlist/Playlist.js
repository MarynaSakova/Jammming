import React from "react";
import styles from './Playlist.module.css';
import Tracklist from "../Tracklist/Tracklist";

function Playlist({ playlistName, onNameChange, tracks, onRemove, onSave }) {
    const handleNameInputChange = (e) => {
      onNameChange(e.target.value);
    };
  
    return (
      <div>
        <input value={playlistName} onChange={handleNameInputChange} />
        <Tracklist tracks={tracks} onRemove={onRemove} isRemoval={true} />
        <button onClick={onSave}>Save to Spotify</button>
      </div>
    );
  }

export default Playlist;