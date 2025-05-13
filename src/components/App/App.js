import React, {useEffect, useState} from "react";
import './App.module.css';
import Playlist from "../Playlist/Playlist";
import SearchBar from "../SearchBar/SearchBar";
import SearchResults from "../SearchResults/SearchResults";
import Track from "../Track/Track";
import Tracklist from "../Tracklist/Tracklist";
import Spotify from '../../utils/Spotify';




function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [playlistName, setPlaylistName] = useState("My Playlist");
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [token, setToken] = useState(null);


  useEffect(() => {
    const getToken = async () => {
      const accessToken = await Spotify.getAccessToken();
      setToken(accessToken);
    };

    getToken();
  }, []);
  

  const search = async (term) => {
    const results = await Spotify.searchTracks(term);
    setSearchResults(results);
  };


  const [successMessage, setSuccessMessage] = useState("");

  const handleSaveToSpotify = async () => {
    const trackUris = playlistTracks.map(track => track.uri.replace(/\s/g, ''));

    if (trackUris.length > 0 && playlistName) {
      await Spotify.savePlaylist(playlistName, trackUris);

      setSuccessMessage(`Playlist "${playlistName}" was saved to your Spotify!`);

      setPlaylistName("New Playlist");
      setPlaylistTracks([]);
      
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    }

  };

  const addTrackToPlaylist = (track) => {
    if (!playlistTracks.find(t => t.id === track.id)) {
      setPlaylistTracks([...playlistTracks, track]);
    }
  };

  const removeTrackFromPlaylist = (track) => {
    setPlaylistTracks(playlistTracks.filter(t => t.id !== track.id));
  };

  const handleNameChange = (name) => {
    setPlaylistName(name);
  };

  
  return (
    
    <div className="App">
      {token ? <p>Token loaded ✅</p> : <p>Loading Spotify token...</p>}
      {successMessage && <div style={{ color: 'green', margin: '10px 0' }}>{successMessage}</div>}
      <Playlist 
        playlistName={playlistName}
        onNameChange={handleNameChange}
        tracks={playlistTracks} 
        onSave={handleSaveToSpotify}
        onRemove={removeTrackFromPlaylist}
        />
      <SearchBar onSearch={search} token={token}/>
      <SearchResults tracks={searchResults} onAdd={addTrackToPlaylist} />
      <Track />
      <Tracklist />
      
    </div>
  );
}

export default App;



