import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

/**
 * Vite plugin that adds a POST /api/habits endpoint.
 * When called, it appends a new habit to src/data/sampleHabits.jsx.
 */
function habitsApi() {
  return {
    name: 'habits-api',
    configureServer(server) {
      server.middlewares.use('/api/habits', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('Method not allowed');
          return;
        }

        // Read the request body
        let body = '';
        for await (const chunk of req) {
          body += chunk;
        }

        try {
          const newHabit = JSON.parse(body);

          // Load current habits via Vite's SSR module system
          const filePath = path.resolve(__dirname, 'src/data/sampleHabits.jsx');
          const mod = await server.ssrLoadModule('/src/data/sampleHabits.jsx');
          const currentHabits = [...mod.sampleHabits];

          // Append the new habit
          currentHabits.push(newHabit);

          // Generate the updated file content
          const fileContent = `export const sampleHabits = ${JSON.stringify(currentHabits, null, 2)};\nexport default sampleHabits;\n`;

          // Write back to the source file
          fs.writeFileSync(filePath, fileContent, 'utf-8');

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true }));
        } catch (err) {
          console.error('Failed to update sampleHabits.jsx:', err);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    habitsApi()
  ],
})

