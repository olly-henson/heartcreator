// ============================================================
// Regulate for Relief — Share Win Worker
// ============================================================
//
// SETUP (one time):
//   1. Cloudflare dashboard > Workers & Pages > Create > Worker
//   2. Paste this file, deploy
//   3. Settings > Domains & Routes > Add Custom Domain > share.ollyhenson.com
//      (Cloudflare handles the DNS record automatically)
//
// HOW IT WORKS:
//   The progress report email links to:
//     https://share.ollyhenson.com/?text=<url-encoded win text>
//   The page shows the win, auto-copies to clipboard, and links to the community.
// ============================================================

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const text = url.searchParams.get('text') || '';
    const type = url.searchParams.get('type') || 'win';
    const heading    = type === 'coach'   ? 'Your client needs help with' :
                       type === 'help'    ? 'Ask for help in the community' :
                       type === 'results' ? 'Share client results' :
                       type === 'final'   ? 'Share Your Results' :
                       type === 'started' ? 'Let us know you\'ve started!' :
                                            'Share your win';
    const buttonText = type === 'coach'   ? 'Respond in Community' :
                       type === 'help'    ? 'Get help in the community' :
                       type === 'results' ? 'Share results' :
                       type === 'final'   ? 'Share with the community' :
                       type === 'started' ? 'Let us know in the community' :
                                            'Share in Community';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Share your win — Regulate for Relief</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Arial, sans-serif;
      background: #fafafa;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
    }
    .card {
      background: #ffffff;
      border: 1px solid #e8e8e8;
      border-radius: 12px;
      padding: 40px;
      max-width: 560px;
      width: 100%;
    }
    .label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #999;
      margin-bottom: 12px;
    }
    h1 {
      font-size: 20px;
      color: #111;
      margin-bottom: 24px;
    }
    textarea {
      width: 100%;
      padding: 16px;
      font-family: Arial, sans-serif;
      font-size: 15px;
      line-height: 1.6;
      color: #111;
      border: 1px solid #ddd;
      border-radius: 8px;
      resize: none;
      background: #f9f9f9;
    }
    .actions {
      display: flex;
      gap: 12px;
      margin-top: 20px;
      flex-wrap: wrap;
    }
    .btn {
      padding: 12px 24px;
      border-radius: 6px;
      font-size: 14px;
      font-family: Arial, sans-serif;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
    }
    .btn-primary {
      background: #111;
      color: #fff;
      border: none;
    }
    .btn-secondary {
      background: transparent;
      color: #111;
      border: 1px solid #ccc;
    }
    .status {
      margin-top: 16px;
      font-size: 13px;
      color: #66bb6a;
      min-height: 20px;
    }
  </style>
</head>
<body>
  <div class="card">
    <p class="label">Regulate for Relief</p>
    <h1>${heading}</h1>
    <textarea id="win" rows="4" readonly>${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
    <div class="actions">
      <button class="btn btn-primary" onclick="copyText()">Copy to clipboard</button>
      <a class="btn btn-secondary" href="https://www.skool.com/the-healing-code-8609" target="_blank">${buttonText}</a>
    </div>
    <p class="status" id="status"></p>
  </div>
  <script>
    const winText = ${JSON.stringify(text)};

    function copyText() {
      navigator.clipboard.writeText(winText).then(function() {
        document.getElementById('status').textContent = 'Copied — head to the community and paste.';
      }).catch(function() {
        document.getElementById('status').textContent = 'Select the text above and copy manually.';
      });
    }

    // Auto-copy on load
    if (winText) {
      navigator.clipboard.writeText(winText).then(function() {
        document.getElementById('status').textContent = 'Copied to clipboard — head to the community and paste.';
      }).catch(function() {
        // Browser blocked auto-copy (e.g. no user gesture) — user can click Copy
      });
    }
  </script>
</body>
</html>`;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  },
};
