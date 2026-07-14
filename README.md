# 📬 Lead Generation System

A fully functional lead generation system where users submit their details via a web form → data is automatically sent to Google Sheets → an email notification is triggered for each submission. Deployed with **Vercel** for the frontend/backend and **n8n** (self-hosted) for workflow automation.

---

## 🧰 Tech Stack

| Component | Technology | Hosting |
| :--- | :--- | :--- |
| **Frontend** | HTML, CSS, JavaScript | Vercel (Static) |
| **Backend API** | Node.js (Express) + Serverless Functions | Vercel |
| **Workflow Automation** | n8n (Open-source) | Self-hosted (Local PC + Cloudflare Tunnel) |
| **Database** | PostgreSQL (n8n data) | Supabase (Free Tier) |
| **Data Storage** | Google Sheets | Google Workspace |
| **Email Notifications** | Gmail SMTP | Google Workspace |
| **Tunneling** | Cloudflare Tunnel | Free (no credit card required) |

---

## 📁 Project Structure

```
lead-generation-system/
│
├── api/
│   └── submit-lead.js          # Vercel serverless function (backup endpoint)
│
├── src/                        # Frontend source code
│   ├── index.html              # Lead capture form
│   ├── style.css               # Form styling
│   ├── script.js               # Form logic (sends to Vercel backend)
│   └── logo.png                # Your personal brand logo
│
├── render.yaml                 # Render Blueprint (optional n8n deployment)
├── vercel.json                 # Vercel deployment configuration
├── package.json                # Node.js dependencies
├── .env                        # Environment variables (secrets - NOT committed)
├── .gitignore                  # Git ignore rules
└── README.md                   # This file
```

---

## 🚀 Architecture Diagram

```mermaid
flowchart LR
    User[User Browser] -->|Visits| Vercel[Vercel Hosting]
    Vercel -->|Serves| FE[Frontend<br>HTML/CSS/JS (src/)]
    FE -->|Form POST| API[API Endpoint<br>/api/submit-lead]
    API -->|Forwards Data| CF[Cloudflare Tunnel]
    CF -->|HTTP| n8n[n8n (Local PC)<br>Workflow Engine]
    n8n -->|Appends Row| GS[Google Sheets]
    n8n -->|Sends Email| Email[Gmail SMTP]
```

---

## ✅ How It Works

1. **User Submission**: A visitor fills out the lead form on your Vercel-hosted frontend.
2. **Frontend Logic**: `src/script.js` sends a `POST` request to `/api/submit-lead` (Vercel serverless function).
3. **Backend Processing**: The Vercel function receives the data, validates it, and forwards it to your n8n webhook URL (via Cloudflare Tunnel).
4. **Workflow Execution**: n8n receives the data and triggers the workflow:
   - **Google Sheets Node**: Appends a new row with the lead's details.
   - **Email Node**: Sends a notification to your inbox via Gmail SMTP.
5. **Response**: The Vercel function returns a success (or error) response to the frontend.

---

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd lead-generation-system
```

### 2. Set Up n8n (Local)

**Install n8n globally:**
```bash
npm install n8n -g
```

**Start n8n locally:**
```bash
n8n start
```

n8n will be available at `http://localhost:5678`.

**Build the workflow:**
1. Open n8n at `http://localhost:5678`.
2. Create a new workflow.
3. Add a **Webhook** node:
   - Method: `POST`
   - Path: `/submit-lead`
4. Add a **Google Sheets** node:
   - Operation: `Append Row`
   - Connect to your Google account
   - Map the columns: `name`, `email`, `company`, `message`
5. Add a **Send Email** node:
   - SMTP Host: `smtp.gmail.com`
   - Port: `587`
   - Username: Your Gmail address
   - Password: Your **App Password** (not your regular password)
   - To: Your email address (receive notifications)
   - Subject: `"New Lead Alert!"`
   - Message: Include `{{ $json.body.name }}`, `{{ $json.body.email }}`, etc.
6. Connect the nodes: **Webhook → Google Sheets → Email**.
7. **Activate** the workflow (toggle to green).

---

### 3. Expose n8n to the Internet (Cloudflare Tunnel)

**Install Cloudflare Tunnel:**
- Download from: https://github.com/cloudflare/cloudflared/releases
- Or use: `winget install Cloudflare.cloudflared`

**Run the tunnel:**
```bash
cloudflared tunnel --url http://localhost:5678
```

You'll get a URL like:
```
https://random-word-1234.trycloudflare.com
```

**Update n8n with the public URL:**
```bash
# Stop n8n (Ctrl+C)
$env:N8N_PROTOCOL="https"
$env:N8N_HOST="random-word-1234.trycloudflare.com"
n8n start --webhook-url=https://random-word-1234.trycloudflare.com/
```

**Get your production webhook URL:**
- In n8n, click on the Webhook node.
- Copy the **Production URL** (e.g., `https://random-word-1234.trycloudflare.com/webhook/submit-lead`).

---

### 4. Deploy to Vercel

**Push your code to GitHub:**
```bash
git add .
git commit -m "Initial commit"
git push
```

**Import to Vercel:**
1. Go to [Vercel Dashboard](https://vercel.com).
2. Click **"Add New..."** → **"Project"**.
3. Import your GitHub repository.
4. **Add Environment Variables:**
   - **Name:** `N8N_WEBHOOK_URL`
   - **Value:** (Paste your n8n Production URL from Step 3)
5. Click **"Deploy"**.

**Frontend URL:** Your Vercel deployment URL (e.g., `https://your-project.vercel.app`).

---

### 5. Configure Supabase (n8n Database)

If you want to persist n8n data (workflows, credentials, executions) in the cloud:

1. Sign up at [Supabase.com](https://supabase.com) (Free tier).
2. Create a new project.
3. Get your **Session Pooler** connection string from **Project Settings → Database**.
4. Update your **Cloudflare Tunnel** or **Render** deployment with these environment variables:
   - `DB_TYPE=postgresdb`
   - `DB_POSTGRESDB_HOST=aws-0-[region].pooler.supabase.com`
   - `DB_POSTGRESDB_PORT=5432`
   - `DB_POSTGRESDB_DATABASE=postgres`
   - `DB_POSTGRESDB_USER=postgres.[project-ref]`
   - `DB_POSTGRESDB_PASSWORD=your-supabase-password`
   - `DB_POSTGRESDB_SSL_ENABLED=true`
   - `DB_POSTGRESDB_SSL_REJECT_UNAUTHORIZED=false`

---

## 🌐 Deployment URLs

| Service | URL |
| :--- | :--- |
| **Frontend** | `https://your-project.vercel.app` |
| **Backend API** | `https://your-project.vercel.app/api/submit-lead` |
| **n8n (Local)** | `http://localhost:5678` |
| **n8n (Public)** | `https://random-word-1234.trycloudflare.com` |
| **n8n Webhook** | `https://random-word-1234.trycloudflare.com/webhook/submit-lead` |

---

## 🔧 Troubleshooting

| Issue | Solution |
| :--- | :--- |
| **Webhook not receiving data** | 1. Check Cloudflare tunnel is running. 2. Ensure workflow is **Active** (green toggle). 3. Verify `N8N_WEBHOOK_URL` environment variable is set correctly in Vercel. |
| **`422` JSON parsing error** | Use PowerShell's `Invoke-RestMethod` or a here-string with `curl.exe` to send JSON correctly. |
| **Google Sheets not updating** | 1. Verify column headers match: `name`, `email`, `company`, `message`. 2. Re-authenticate Google Sheets credential in n8n. |
| **Email not sending** | 1. Ensure you're using a **Gmail App Password** (not your regular password). 2. Check Gmail SMTP settings: `smtp.gmail.com:587`. |
| **`JavaScript heap out of memory`** | Add `NODE_OPTIONS=--max-old-space-size=512` environment variable to your n8n service. |
| **Cold start issues on free tier** | Use a keep-alive service like [cron-job.org](https://cron-job.org) to ping your webhook URL every 10 minutes. |

---

## 📝 Environment Variables Reference

| Variable | Description | Where to Set |
| :--- | :--- | :--- |
| `N8N_WEBHOOK_URL` | n8n production webhook URL | Vercel (Environment Variables) |
| `N8N_HOST` | Public hostname for n8n | n8n (Environment) |
| `N8N_PROTOCOL` | `https` or `http` | n8n (Environment) |
| `N8N_PORT` | Port n8n listens on (default: `5678`) | n8n (Environment) |
| `N8N_ENCRYPTION_KEY` | Encrypts n8n credentials | n8n (Environment) |
| `DB_*` | Supabase PostgreSQL credentials | n8n (Environment) |

---

## 🧪 Testing the Webhook Directly

**PowerShell:**
```powershell
Invoke-RestMethod -Uri "https://your-cloudflare-url/webhook/submit-lead" -Method POST -Body '{"name":"Test","email":"test@test.com"}' -ContentType "application/json"
```

**curl.exe (Windows):**
```powershell
curl.exe -X POST "https://your-cloudflare-url/webhook/submit-lead" -H "Content-Type: application/json" -d @"
{"name":"CurlTest","email":"curl@test.com"}
"@
```

---

## 📜 License

MIT

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

## 🙏 Acknowledgments

- [n8n.io](https://n8n.io) for the amazing workflow automation tool.
- [Vercel](https://vercel.com) for free hosting and serverless functions.
- [Cloudflare](https://cloudflare.com) for free tunneling.
- [Supabase](https://supabase.com) for free PostgreSQL hosting.
- [Google Workspace](https://workspace.google.com) for Sheets and Gmail.

---

## 📧 Contact

**Author:** Raymond Owusu Apenteng

---

**Built with ❤️ and a lot of automation!** 🚀