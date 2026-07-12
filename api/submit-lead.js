// api/submit-lead.js
const axios = require('axios');

module.exports = async function handler(req, res) {
    // 1. Enable CORS for your frontend
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // 2. Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // 3. Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // 4. Extract data from the request body
    const { name, email, company, message } = req.body;

    // 5. Basic validation
    if (!name || !email) {
        return res.status(400).json({ error: 'Name and Email are required.' });
    }

    console.log(`📝 Received lead from ${name} (${email})`);

    // 6. Get the n8n webhook URL from environment variables
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

    if (!n8nWebhookUrl) {
        console.error('❌ N8N_WEBHOOK_URL environment variable is not set.');
        return res.status(500).json({ error: 'Server configuration error.' });
    }

    try {
        // 7. Forward the data to n8n
        const response = await axios.post(n8nWebhookUrl, {
            name,
            email,
            company,
            message,
        });

        // 8. Send success response back to the frontend
        res.status(200).json({
            message: 'Lead sent to n8n successfully! Check your Google Sheet.',
            n8nStatus: response.status
        });
    } catch (error) {
        console.error('❌ Error forwarding to n8n:', error.message);
        
        // Provide more specific error messages
        let errorMessage = 'Failed to send to n8n.';
        if (error.code === 'ECONNREFUSED') {
            errorMessage = 'Could not connect to n8n. Make sure your n8n instance is running and the URL is correct.';
        } else if (error.response) {
            errorMessage = `n8n responded with status ${error.response.status}: ${error.response.data.message || ''}`;
        }
        
        res.status(500).json({
            error: errorMessage,
            details: error.message
        });
    }
};