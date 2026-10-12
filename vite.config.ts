import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { YoutubeTranscript } from 'youtube-transcript';

function youtubeTranscriptPlugin(): Plugin {
  return {
    name: 'youtube-transcript-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/transcript')) {
          const url = new URL(req.url, 'http://localhost');
          const videoId = url.searchParams.get('videoId');
          if (!videoId) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'videoId is required' }));
            return;
          }
          try {
            let transcript: any[] = [];
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
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({ videoId, cues }));
          } catch (err: any) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({ error: err.message || 'Transcript not found' }));
          }
          return;
        }

        if (req.url && req.url.startsWith('/api/translate')) {
          const url = new URL(req.url, 'http://localhost');
          const text = url.searchParams.get('text');
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');

          if (!text) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'text is required' }));
            return;
          }

          try {
            const googleUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(text)}`;
            const response = await fetch(googleUrl);
            const data: any = await response.json();
            let translated = '';
            if (Array.isArray(data) && Array.isArray(data[0])) {
              translated = data[0].map((item: any) => (item && item[0] ? item[0] : '')).join('');
            }
            res.statusCode = 200;
            res.end(JSON.stringify({ original: text, translated }));
          } catch (err: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message || 'Translation failed' }));
          }
          return;
        }

        if (req.url && req.url.startsWith('/api/search-youtube')) {
          const url = new URL(req.url, 'http://localhost');
          const query = url.searchParams.get('q');
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');

          if (!query || !query.trim()) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'q is required' }));
            return;
          }

          try {
            const cleanQuery = query.trim().toLowerCase().replace(/[?.,!']/g, '').replace(/\s+/g, ' ');
            const queryTokens = cleanQuery.split(' ').filter(Boolean);

            const searchQueries = [
              `"${query}" English`,
              `"${query}" "BBC Learning English"`,
              `"${query}" "Easy English"`,
              `"${query}" "Learn English With TV Series"`,
              `"${query}" "Rachel's English"`,
              `"${query}" TED`
            ];

            const seenVideoIds = new Set<string>();
            const candidateIds: string[] = [];

            for (const sq of searchQueries.slice(0, 4)) {
              try {
                const ytUrl = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(sq);
                const fetchRes = await fetch(ytUrl);
                const html = await fetchRes.text();
                const matches = [...html.matchAll(/\/watch\?v=([a-zA-Z0-9_-]{11})/g)].map((m) => m[1]);
                for (const vid of matches) {
                  if (!seenVideoIds.has(vid)) {
                    seenVideoIds.add(vid);
                    candidateIds.push(vid);
                  }
                }
                if (candidateIds.length >= 10) break;
              } catch {}
            }

            const matchedClips: any[] = [];

            for (const videoId of candidateIds.slice(0, 8)) {
              try {
                let cues: any[] = [];
                try {
                  cues = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' });
                } catch {
                  cues = await YoutubeTranscript.fetchTranscript(videoId);
                }
                if (!cues || cues.length === 0) continue;

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
              } catch {}
            }

            res.statusCode = 200;
            res.end(JSON.stringify({ query, clips: matchedClips }));
          } catch (err: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message || 'YouTube search failed' }));
          }
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), youtubeTranscriptPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
