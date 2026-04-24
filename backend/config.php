<?php
/**
 * ════════════════════════════════════════════════════════════
 *   الرواق للسفر — Telegram Bot Configuration
 * ════════════════════════════════════════════════════════════
 *
 *  SETUP STEPS:
 *  ────────────
 *  1. Open Telegram and search for @BotFather
 *  2. Send: /newbot
 *  3. Follow prompts → copy your BOT TOKEN
 *  4. Find your CHAT ID:
 *       a. Send any message to your new bot first
 *       b. Visit in browser:
 *          https://api.telegram.org/bot{YOUR_TOKEN}/getUpdates
 *       c. Find: "chat":{"id": 1234567890}  ← that's your chat ID
 *  5. Replace the values below with your real token & chat ID
 *  6. Upload this file to your PHP server
 *
 *  ⚠️  SECURITY: Never commit this file to a public repository.
 *      Add it to .gitignore if using version control.
 * ════════════════════════════════════════════════════════════
 */

// ── Replace with your actual bot token ──
define('TELEGRAM_BOT_TOKEN', 'YOUR_BOT_TOKEN_HERE');
// Example: '123456789:ABCdefGhijKlmnoPQRstuvWXYZ_abc123'

// ── Replace with your actual Telegram chat ID ──
define('TELEGRAM_CHAT_ID', 'YOUR_CHAT_ID_HERE');
// Example: '987654321' or '-1001234567890' for a group/channel
