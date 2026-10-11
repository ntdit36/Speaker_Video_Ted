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
