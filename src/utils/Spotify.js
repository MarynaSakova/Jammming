// utils/Spotify.js

const clientId = 'd4517d3c198b4360934d44571c9f9b42';
const redirectUri = 'http://127.0.0.1:3000/callback';

const Spotify = {
  getAccessToken() {
    const token = localStorage.getItem('access_token');
    if (token) return token;

    const code = new URLSearchParams(window.location.search).get('code');
    if (!code) {
      this.redirectToAuthCodeFlow();
    } else {
      return this.fetchAccessToken(code);
    }
  },

  async redirectToAuthCodeFlow() {
    const codeVerifier = this.generateRandomString(64);
    localStorage.setItem('code_verifier', codeVerifier);

    const codeChallenge = await this.generateCodeChallenge(codeVerifier);

    const state = this.generateRandomString(16);
    const scope = 'playlist-modify-public';

    const args = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      scope: scope,
      redirect_uri: redirectUri,
      state: state,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
    });

    window.location = `https://accounts.spotify.com/authorize?${args.toString()}`;
  },

  async fetchAccessToken(code) {
    const codeVerifier = localStorage.getItem('code_verifier');

    if (!codeVerifier) {
      console.error("Missing code_verifier — starting auth flow again.");
      localStorage.removeItem('access_token');
      await this.redirectToAuthCodeFlow(); // Restart flow
      return;
    }

    const body = new URLSearchParams({
      client_id: clientId,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    });

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    const data = await response.json();

    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token);
      // Clean the URL
      window.history.replaceState({}, document.title, '/');
      return data.access_token;
    } else {
      console.error('Failed to get access token', data);
      localStorage.removeItem('code_verifier');
      await this.redirectToAuthCodeFlow(); // Try again
    }
  },

  generateRandomString(length) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from(crypto.getRandomValues(new Uint8Array(length)))
      .map(x => possible[x % possible.length])
      .join('');
  },

  async generateCodeChallenge(codeVerifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  },

async searchTracks (term) {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error("No access token found");
      return [];
    }
  
    const endpoint = `https://api.spotify.com/v1/search?q=${encodeURIComponent(term)}&type=track`;
  
    try {
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });

      if (response.status === 401) {
        console.warn("Access token expired. Clearing token and reloading...");
        localStorage.removeItem('access_token');
        window.location.reload(); // Forces re-auth and token refresh
        return [];
      };
  
      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status}`);
      };
  
      const jsonResponse = await response.json();
      return jsonResponse.tracks.items || [];
  
    } catch (error) {
      console.error("Error fetching tracks:", error.message);
      return [];
    }
  },

async savePlaylist(name, trackUris) {
    if (!name || !trackUris.length) return;

    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error("No access token found");
      return;
    }

 try {
    // Step 1: Get user ID
    const userResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${token}` }
    })

    const userData = await userResponse.json();
    const userId = userData.id;

    // Step 2: Create a new playlist
    const createPlaylistResponse = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: name,
        description: 'Created with Jammming',
        public: true
      })
    });

    const playlistData = await createPlaylistResponse.json();
    const playlistId = playlistData.id;

    // Step 3: Add tracks to playlist
    const addTracksResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        uris: trackUris
      })
    });

    if (addTracksResponse.ok) {
      console.log("Playlist saved successfully!");
    } else {
      console.error("Failed to add tracks:", await addTracksResponse.json());
    }

  } catch (error) {
    console.error("Error saving playlist:", error.message);
  }
}

};



export default Spotify;