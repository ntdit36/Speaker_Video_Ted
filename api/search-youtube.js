import { YoutubeTranscript } from 'youtube-transcript';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const query = req.query.q || (req.body && req.body.q);
  const channel = (req.query.channel || (req.body && req.body.channel) || 'all').toLowerCase();

  if (!query || !query.trim()) {
    return res.status(400).json({ error: 'Query parameter q is required' });
  }

  const cleanQuery = query.trim().toLowerCase().replace(/[?.,!']/g, '').replace(/\s+/g, ' ');
  const queryTokens = cleanQuery.split(' ').filter(Boolean);

  try {
    const channelQueryMap = {
      bbc: `"${query}" "BBC Learning English"`,
      easy: `"${query}" "Easy English"`,
      rachel: `"${query}" "Rachel's English"`,
      tvseries: `"${query}" "Learn English With TV Series"`,
      ted: `"${query}" TED`,
      tedx: `"${query}" "TEDx"`,
      voa: `"${query}" "VOA Learning English"`,
      all: `"${query}" English`,
    };

    const searchQueries = [];
    if (channel !== 'all' && channelQueryMap[channel]) {
      searchQueries.push(channelQueryMap[channel]);
    } else {
      searchQueries.push(`"${query}" English`);
      searchQueries.push(`"${query}" "BBC Learning English"`);
      searchQueries.push(`"${query}" "Easy English"`);
      searchQueries.push(`"${query}" "Learn English With TV Series"`);
      searchQueries.push(`"${query}" "Rachel's English"`);
      searchQueries.push(`"${query}" TED`);
    }

    const seenVideoIds = new Set();
    const candidateIds = [];

    for (const sq of searchQueries.slice(0, 4)) {
      try {
        const url = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(sq);
        const fetchRes = await fetch(url);
        const html = await fetchRes.text();
        const matches = [...html.matchAll(/\/watch\?v=([a-zA-Z0-9_-]{11})/g)].map((m) => m[1]);
        for (const vid of matches) {
          if (!seenVideoIds.has(vid)) {
            seenVideoIds.add(vid);
            candidateIds.push(vid);
          }
        }
        if (candidateIds.length >= 10) break;
      } catch (e) {}
    }

    const matchedClips = [];

    for (const videoId of candidateIds.slice(0, 8)) {
      try {
        const cues = await YoutubeTranscript.fetchTranscript(videoId);
        if (!cues || cues.length === 0) continue;

        // Sliding window across 1 to 4 adjacent cues
        for (let i = 0; i < cues.length; i++) {
          let combined = cues[i].text.replace(/\n/g, ' ');
          let startSec = Math.round((cues[i].offset / 1000) * 10) / 10;
          let endSec = Math.round(((cues[i].offset + cues[i].duration) / 1000) * 10) / 10;

          let cleanText = combined.toLowerCase().replace(/[?.,!']/g, '').replace(/\s+/g, ' ');
          const pluralQuery = `${cleanQuery}s`;
          let isMatch = cleanText.includes(cleanQuery) || cleanText.includes(pluralQuery);

          if (!isMatch && queryTokens.length >= 2) {
            for (let j = i + 1; j < Math.min(cues.length, i + 3); j++) {
              combined += ' ' + cues[j].text.replace(/\n/g, ' ');
              endSec = Math.round(((cues[j].offset + cues[j].duration) / 1000) * 10) / 10;
              cleanText = combined.toLowerCase().replace(/[?.,!']/g, '').replace(/\s+/g, ' ');
              if (cleanText.includes(cleanQuery) || cleanText.includes(pluralQuery)) {
                isMatch = true;
                break;
              }
            }
          }

          if (isMatch) {
            const durationSec = cues[cues.length - 1]
              ? Math.round(((cues[cues.length - 1].offset + cues[cues.length - 1].duration) / 1000) * 10) / 10
              : 300;
            const mins = Math.floor(durationSec / 60);
            const secs = Math.floor(durationSec % 60);

            matchedClips.push({
              id: `yt-${videoId}-${startSec}`,
              youtubeId: videoId,
              title: `YouTube Video (${videoId})`,
              channel: 'YouTube Learning',
              startSecond: startSec,
              endSecond: endSec,
              accent: 'all',
              sentence: combined.trim(),
              targetWord: query,
              durationSeconds: durationSec,
              durationFormatted: `${mins}:${secs.toString().padStart(2, '0')}`,
              isShort: durationSec < 600,
            });
            break;
          }
        }

        if (matchedClips.length >= 10) break;
      } catch (err) {}
    }

    return res.status(200).json({ query, clips: matchedClips });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'YouTube search failed' });
  }
}
