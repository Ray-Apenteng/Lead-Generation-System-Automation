(function() {
    'use strict';

    // ---------- CONFIG ----------
    // Automatically detect if we're in production or local development
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    
    // Use relative path for production (Vercel), absolute for local development
    const BACKEND_URL = isProduction 
        ? '/api/submit-lead'           // Production: Vercel handles this
        : 'http://localhost:5000/submit-lead'; // Local development

    // ---------- DOM REFS ----------
    const form = document.getElementById('leadForm');
    const submitBtn = document.getElementById('submitBtn');
    const msgDiv = document.getElementById('responseMessage');

    // ---------- HELPER: Show status ----------
    function showStatus(message, type) {
        msgDiv.textContent = message;
        msgDiv.className = type; // 'success', 'error', or 'info'
        if (!type) {
            msgDiv.style.display = 'none';
        } else {
            msgDiv.style.display = 'block';
        }
    }

    // ---------- HELPER: Reset form ----------
    function resetForm() {
        form.reset();
        if (document.activeElement && document.activeElement.blur) {
            document.activeElement.blur();
        }
    }

    // ---------- FORM SUBMIT HANDLER ----------
    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        // 1. Gather the data
        const payload = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            company: document.getElementById('company').value.trim(),
            message: document.getElementById('message').value.trim()
        };

        // Validation
        if (!payload.name || !payload.email) {
            showStatus('❌ Please fill in both Name and Email.', 'error');
            return;
        }

        // 2. Disable button
        submitBtn.disabled = true;
        submitBtn.textContent = '⏳ Sending...';
        showStatus('📤 Sending to backend...', 'info');

        try {
            // 3. Send to your backend
            const response = await fetch(BACKEND_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            // 4. Handle response
            if (response.ok) {
                const data = await response.json();
                showStatus('✅ ' + data.message + ' 🎉', 'success');
                resetForm();
            } else {
                const errorData = await response.json().catch(() => ({}));
                showStatus(`❌ Backend error: ${errorData.error || response.status}`, 'error');
            }

        } catch (error) {
            console.error('Fetch error:', error);
            const errorMsg = isProduction 
                ? '❌ Connection error. Please try again later.'
                : `❌ Connection error: Can't reach backend on port 5000. Is it running? (${error.message})`;
            showStatus(errorMsg, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = '✦  Send Lead  ✦';
        }
    });

    // Click on status to dismiss
    msgDiv.addEventListener('click', function() {
        this.style.display = 'none';
    });

    console.log('✅ Form is ready! Backend URL:', BACKEND_URL);
    console.log('📍 Environment:', isProduction ? 'Production (Vercel)' : 'Local Development');
})();