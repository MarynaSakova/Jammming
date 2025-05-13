import React from "react";
import Track from "../Track/Track";

function SearchResults({tracks, onAdd}) {
    return (
        <div>
          <h2>Results</h2>
          <ul>
            {tracks.map((track) => (
                <Track key={track.id} track={track} onAdd={onAdd} />
            ))}
          </ul>
        </div>
      );
}

export default SearchResults;