import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

/**
 * A simple Vite server plugin to save new habits directly into the source file.
 */
function habitsApi() {
  return {
    name: 'habits-api',
    configureServer(server) {
      // Create an API route at POST/PUT /api/habits
      server.middlewares.use('/api/habits', (req, res) => {
        if (req.method !== 'POST' && req.method !== 'PUT') {
          res.statusCode = 405;
          res.end('Only POST and PUT requests are allowed');
          return;
        }

        // 1. Read the incoming data
        let body = '';
        req.on('data', chunk => {
          body += chunk;
        });

        req.on('end', () => {
          try {
            const data = JSON.parse(body);
            const filePath = path.resolve(__dirname, 'src/data/sampleHabits.jsx');

            if (Array.isArray(data)) {
              // 2. Overwrite the entire file with the updated array
              const fileContent = `export const sampleHabits = ${JSON.stringify(data, null, 2)};\nexport default sampleHabits;\n`;
              fs.writeFileSync(filePath, fileContent, 'utf-8');
            } else {
              // 3. Append single habit (original behavior)
              let fileContent = fs.readFileSync(filePath, 'utf-8');
              const closingBracketIndex = fileContent.lastIndexOf('];');

              if (closingBracketIndex !== -1) {
                const newHabitText = `,\n  ` + JSON.stringify(data, null, 2).replace(/\n/g, '\n  ');
                fileContent = 
                  fileContent.slice(0, closingBracketIndex) + 
                  newHabitText + '\n' + 
                  fileContent.slice(closingBracketIndex);
                fs.writeFileSync(filePath, fileContent, 'utf-8');
              }
            }

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
          } catch (err) {
            console.error('Error saving habit:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Failed to save habit' }));
          }
        });
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

