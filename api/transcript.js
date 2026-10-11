import { YoutubeTranscript } from 'youtube-transcript';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { videoId } = req.query;
  if (!videoId) {
    return res.status(400).json({ error: 'videoId is required' });
  }

  try {
    let transcript = [];
    try {
      transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' });
    } catch {
      transcript = await YoutubeTranscript.fetchTranscript(videoId);
    }

    const cues = transcript.map((item) => ({
      start: Math.round((item.offset / 1000) * 10) / 10,
      end: Math.round(((item.offset + item.duration) / 1000) * 10) / 10,
      text: item.text
        .replace(/&amp;/g, '&')
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>'),
    }));

    return res.status(200).json({ videoId, cues });
  } catch (err) {
    return res.status(404).json({ error: err.message || 'Transcript not found' });
  }
}
