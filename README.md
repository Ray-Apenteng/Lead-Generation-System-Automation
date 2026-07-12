Yes, absolutely! You can name your frontend folder **`src`**—that is a great name (it stands for "source"). In fact, it makes perfect sense because your frontend source code lives there.

Since you already have a backend, we can use **Express to serve your `src` folder as static files**. This way, you don't need to double-click the HTML file or use Live Server. You simply visit `http://localhost:5000` in your browser, and your backend will serve the HTML page automatically—much cleaner!

---

### 📁 Your New Folder Structure

```
lead-generation-system/
│
├── backend/                 # Your Express server
│   ├── server.js            # (Updated to serve static files)
│   └── node_modules/        # (Installed later)
│
├── src/                     # Your frontend (renamed from 'frontend')
│   ├── index.html           # Your HTML structure
│   ├── style.css            # Your styles
│   └── script.js            # Your JavaScript logic
│
├── .env                     # Optional backend secrets
├── package.json             # NEW (at the root level)
├── package-lock.json        # (Auto-generated later)
└── README.md                # NEW (updated documentation)
```

---

### 1️⃣ Updated Backend Code (`backend/server.js`)

This version **serves your HTML** and handles the form submission. I added comments so you can see the new parts.

```javascript
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path'); // <-- NEW: Needed to serve files

const app = express();

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// ---------- NEW: Serve your frontend files ----------
// This tells Express: "Look inside the 'src' folder for CSS, JS, and HTML files"
app.use(express.static(path.join(__dirname, '..', 'src')));

// ---------- Your existing backend endpoint ----------
app.post('/submit-lead', async (req, res) => {
    // CHANGED: 'username' to 'name' to match your HTML form!
    const { name, email, company, message } = req.body;

    // Basic validation
    if (!name || !email) {
        return res.status(400).json({ error: 'Name and Email are required.' });
    }

    console.log(`📝 Received lead from ${name} (${email})`);

    // Send to n8n webhook
    try {
        const response = await axios.post(
            'http://localhost:5678/webhook/submit-lead',
            {
                name,
                email,
                company,
                message,
            }
        );

        res.status(200).json({
            message: 'Lead sent to n8n successfully! Check your Google Sheet.',
            n8nStatus: response.status
        });
    } catch (error) {
        console.error('❌ Error forwarding to n8n:', error.message);
        res.status(500).json({
            error: 'Failed to send to n8n. Is your n8n running and active?',
            details: error.message
        });
    }
});

// ---------- NEW: Catch-all route to serve index.html ----------
// If someone visits http://localhost:5000, send them the HTML page
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'src', 'index.html'));
});

// ---------- Start the server ----------
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));
```

---

### 2️⃣ New `package.json` (Root Level)

Create this file in the **root** of your project (next to the `backend/` and `src/` folders).

```json
{
  "name": "lead-generation-system",
  "version": "1.0.0",
  "description": "A simple lead generation system with n8n, Google Sheets, and email notifications.",
  "main": "backend/server.js",
  "scripts": {
    "start": "node backend/server.js",
    "dev": "nodemon backend/server.js"
  },
  "keywords": [
    "n8n",
    "automation",
    "leads",
    "google-sheets",
    "webhook"
  ],
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {
    "axios": "^1.6.0",
    "cors": "^2.8.5",
    "express": "^4.18.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

---

### 3️⃣ New `README.md` (Root Level)

Create this file in the **root** of your project.

```markdown
# 📬 Lead Generation System

A simple lead generation system where users submit their details via a form → data is stored in Google Sheets → an automated email notification is sent for each submission.

## 🧰 Tech Stack

- **n8n** – Workflow automation (webhooks, Google Sheets, Gmail SMTP)
- **Express.js** – Backend proxy to forward form data to n8n
- **HTML/CSS/JS** – Simple, clean frontend form
- **Google Sheets** – Stores all leads
- **Gmail SMTP** – Sends email alerts

## 📁 Project Structure

```
lead-generation-system/
├── backend/
│   └── server.js          # Express server (proxy to n8n)
├── src/                   # Frontend source code
│   ├── index.html         # Form structure
│   ├── style.css          # Form styles
│   └── script.js          # Form logic
├── package.json           # Node.js dependencies
└── README.md              # This file
```

## 🚀 Setup Instructions

### 1. Clone & Install Dependencies

```bash
git clone <your-repo-url>
cd lead-generation-system
npm install
```

### 2. Set Up n8n

- Install n8n globally: `npm install n8n -g`
- Run n8n: `n8n`
- Import the workflow JSON (provided in the `n8n/` folder) or build the workflow manually:
  - **Webhook** (POST, path: `/submit-lead`)
  - **Google Sheets** (Append Row)
  - **Send Email** (Gmail SMTP)
- Activate the workflow (click "Active" in the top-right corner).

### 3. Configure Environment Variables (Optional)

If you have secrets (like Google Service Account keys), add them to a `.env` file in the root.

### 4. Run the Backend

```bash
npm start
```

The server will start on `http://localhost:5000`.

### 5. Open the Form

Open your browser and go to `http://localhost:5000`. Fill out the form and submit!

## ✅ How It Works

1. User fills out the form in `src/index.html`.
2. `src/script.js` sends a `POST` request to `http://localhost:5000/submit-lead`.
3. The Express backend forwards the data to n8n (`http://localhost:5678/webhook/submit-lead`).
4. n8n appends the row to Google Sheets and sends an email alert.

## 🔧 Troubleshooting

| Issue | Solution |
| :--- | :--- |
| `ECONNREFUSED` / Connection error | n8n is not running. Start it with `n8n` in a separate terminal. |
| `404` error | The webhook path in n8n is not `/submit-lead`. Check your Webhook node settings. |
| Google Sheet not updating | Make sure your Google Sheet headers (`name`, `email`, `company`, `message`) match the incoming data. |
| Email not sending | Ensure you used an **App Password** for Gmail and turned on 2-Step Verification. |

## 📜 License

MIT