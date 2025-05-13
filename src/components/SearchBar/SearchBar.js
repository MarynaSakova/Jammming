import React, { useState } from "react";
import styles from "./SearchBar.module.css";

function SearchBar({ onSearch }) {
  const [searchTrack, setSearchTrack] = useState("");

  function handleSearchTrack(e) {
    setSearchTrack(e.target.value);
  }

  function handleSearchClick() {
    if (searchTrack.trim()) {
      onSearch(searchTrack); // ✅ Triggers App.js search function
    }
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Enter a song title"
        value={searchTrack}
        onChange={handleSearchTrack}
      />
      <button className={styles.button} onClick={handleSearchClick}>
        Search
      </button>
    </div>
  );
}

export default SearchBar;