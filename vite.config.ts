import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

/**
 * Local development middleware for /api/ai routes in Vite.
 * Enables full server-side AI execution on localhost identical to Vercel production,
 * without exposing API keys to the browser.
 */
function aiDevMiddleware(): Plugin {
  return {
    name: 'ai-dev-middleware',
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), '');
      Object.assign(process.env, env);

      server.middlewares.use(async (req, res, next) => {
        if (
          req.method === 'POST' &&
          (req.url === '/api/ai/chat' || req.url?.startsWith('/api/ai/chat?'))
        ) {
          let rawBody = '';
          req.on('data', (chunk) => {
            rawBody += chunk;
          });
          req.on('end', async () => {
            try {
              const body = rawBody ? JSON.parse(rawBody) : {};
              const { callGemini } = await import('./api/ai/gemini-service.ts');
              const text = await callGemini(
                body.message,
                body.systemPrompt,
                body.history,
                body.stateContext
              );
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ text }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  error: err?.message || 'AI request failed.',
                })
              );
            }
          });
          return;
        }

        if (
          req.method === 'POST' &&
          (req.url === '/api/ai/summary' || req.url?.startsWith('/api/ai/summary?'))
        ) {
          let rawBody = '';
          req.on('data', (chunk) => {
            rawBody += chunk;
          });
          req.on('end', async () => {
            try {
              const body = rawBody ? JSON.parse(rawBody) : {};
              const { callGemini } = await import('./api/ai/gemini-service.ts');
              const prompt = `Write the Executive Daily Readiness Summary for the Commissioner.
Overall city readiness: ${body?.overallReadiness ?? 'unknown'}%.
Zones: ${JSON.stringify(body?.zoneData ?? [])}
Open alerts: ${JSON.stringify(body?.alertData ?? [])}

Produce 4-6 sentences: current posture, the two weakest zones with the specific bottleneck, and the single highest-priority dispatch action for today. No headings, no markdown lists.`;

              const summary = await callGemini(
                prompt,
                "You are the Chief Disaster Operations Advisor for RECQ360 Command Center. Write executive briefing summaries directly, authoritatively, and concisely."
              );
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ summary }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  error: err?.message || 'AI summary generation failed.',
                })
              );
            }
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    tsconfigPaths(),
    aiDevMiddleware(),
  ],
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
