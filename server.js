const express = require('express');
const { exec } = require('youtube-dl-exec');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Unified endpoint
app.get('/stream-audio', (req, res) => {
    const url = req.query.url;

    if (!url || !url.startsWith('http')) {
        return res.status(400).json({ error: 'Invalid or missing YouTube URL' });
    }

    try {
        // Set headers for streaming
        res.setHeader('Content-Type', 'audio/m4a');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Content-Disposition', 'inline'); // Play in browser instead of download

        // Execute youtube-dl-exec for streaming
        const audioProcess = exec(
            url,
            {
                format: 'bestaudio',
                output: '-', // Stream directly to stdout
            },
            { stdio: ['ignore', 'pipe', 'ignore'] }
        );

        audioProcess.stdout.pipe(res);

        audioProcess.on('error', (err) => {
            console.error('Error streaming audio:', err);
            res.status(500).json({ error: 'Failed to stream the audio' });
        });
    } catch (err) {
        console.error('Error processing request:', err);
        res.status(500).json({ error: 'Failed to process the YouTube URL' });
    }
});

// Start the server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});