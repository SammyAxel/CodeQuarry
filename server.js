import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

/**
 * POST /api/compile-c
 * Compiles and runs C code using Piston API (free, unlimited)
 */
app.post('/api/compile-c', async (req, res) => {
  let code = req.body.code;

  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }

  // Handle escaped characters from JSON serialization
  if (typeof code === 'string') {
    code = code
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\');
  }

  console.log('Received code:', code);

  try {
    // Use Piston API - free, no auth needed, reliable
    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: 'c',
        version: '10.2.0',
        files: [
          {
            name: 'main.c',
            content: code
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Piston API error: ${response.status}`);
    }

    const result = await response.json();

    console.log('Piston response:', JSON.stringify(result, null, 2));

    // Piston returns output in different format
    let output = '';
    if (result.run && result.run.output) {
      output = result.run.output;
    } else if (result.compile && result.compile.output) {
      throw new Error(`Compilation error: ${result.compile.output}`);
    } else if (result.run && result.run.stderr) {
      throw new Error(`Runtime error: ${result.run.stderr}`);
    }

    res.json({ output: output || '' });
  } catch (err) {
    console.error('Compilation error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ C Compiler server running on http://localhost:${PORT}`);
});

