// Spotify Web API integration for mood-based playlists

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: Array<{ url: string }>;
  external_urls: { spotify: string };
}

// Mood to Spotify playlist mapping
const MOOD_PLAYLIST_QUERIES: Record<string, string> = {
  hyped: 'workout hype energy',
  excited: 'upbeat party dance',
  joyful: 'happy vibes feel good',
  content: 'chill peaceful ambient',
  calm: 'relaxing meditation calm',
  focused: 'deep focus concentration',
  thoughtful: 'introspective indie',
  melancholic: 'sad emotional piano',
  anxious: 'calming anxiety relief',
  sad: 'heartbreak emotional',
};

let spotifyAccessToken: string | null = null;
let tokenExpiresAt: number = 0;

async function getAccessToken(): Promise<string | null> {
  // Check if we have a valid token
  if (spotifyAccessToken && Date.now() < tokenExpiresAt) {
    return spotifyAccessToken;
  }

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    console.warn('Spotify credentials not configured');
    return null;
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)}`,
      },
      body: 'grant_type=client_credentials',
    });

    const data = await response.json();
    spotifyAccessToken = data.access_token;
    tokenExpiresAt = Date.now() + data.expires_in * 1000;

    return spotifyAccessToken;
  } catch (error) {
    console.error('Error getting Spotify access token:', error);
    return null;
  }
}

export async function searchPlaylistsForMood(mood: string): Promise<SpotifyPlaylist[]> {
  const token = await getAccessToken();
  if (!token) return [];

  const query = MOOD_PLAYLIST_QUERIES[mood] || 'music';

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=playlist&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    return data.playlists?.items || [];
  } catch (error) {
    console.error('Error searching Spotify playlists:', error);
    return [];
  }
}

export async function getFeaturedPlaylists(): Promise<SpotifyPlaylist[]> {
  const token = await getAccessToken();
  if (!token) return [];

  try {
    const response = await fetch(
      'https://api.spotify.com/v1/browse/featured-playlists?limit=20',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    return data.playlists?.items || [];
  } catch (error) {
    console.error('Error getting featured playlists:', error);
    return [];
  }
}

export function openSpotifyPlaylist(playlistId: string) {
  const url = `spotify:playlist:${playlistId}`;
  // In production, use Linking.openURL(url) with fallback to web URL
  console.log('Opening Spotify playlist:', url);
}

