<?php
/**
 * ════════════════════════════════════════════════════════════
 *   الرواق للسفر — Telegram Bot API Handler
 *   Receives booking form data and forwards it to Telegram
 * ════════════════════════════════════════════════════════════
 */

// ── CORS & content-type headers ──
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ── Only allow POST ──
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// ── Load bot configuration ──
$configFile = __DIR__ . '/config.php';
if (!file_exists($configFile)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Configuration file not found']);
    exit;
}
require_once $configFile;

if (TELEGRAM_BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE' || TELEGRAM_CHAT_ID === 'YOUR_CHAT_ID_HERE') {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Bot not configured. Please update backend/config.php with your bot token and chat ID.'
    ]);
    exit;
}

// ── Parse incoming JSON ──
$rawBody = file_get_contents('php://input');
$data    = json_decode($rawBody, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
    exit;
}

// ── Sanitize inputs ──
function clean($val) {
    return htmlspecialchars(strip_tags(trim((string)$val)), ENT_QUOTES, 'UTF-8');
}

$month         = clean($data['month']         ?? '');
$tripType      = clean($data['trip_type']      ?? '');
$fullName      = clean($data['full_name']      ?? '');
$phone         = clean($data['phone']          ?? '');
$accommodation = clean($data['accommodation']  ?? '');
$hotelStars    = clean($data['hotel_stars']    ?? '');
$city          = clean($data['city']           ?? '');
$notes         = clean($data['notes']          ?? 'لا توجد');

// ── Validate required fields ──
$required = ['month' => $month, 'trip_type' => $tripType, 'full_name' => $fullName,
             'phone' => $phone, 'accommodation' => $accommodation,
             'hotel_stars' => $hotelStars, 'city' => $city];

foreach ($required as $field => $value) {
    if (empty($value)) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => "الحقل '$field' مطلوب"]);
        exit;
    }
}

// ── Build Telegram message ──
$date = (new DateTime('now', new DateTimeZone('Africa/Casablanca')))->format('Y-m-d H:i');

$message = "🌍 <b>طلب حجز جديد — الرواق للسفر</b>\n";
$message .= "━━━━━━━━━━━━━━━━━━━━\n";
$message .= "📅 <b>الشهر:</b> {$month}\n";
$message .= "✈️ <b>نوع الرحلة:</b> {$tripType}\n";
$message .= "━━━━━━━━━━━━━━━━━━━━\n";
$message .= "👤 <b>الإسم الكامل:</b> {$fullName}\n";
$message .= "📞 <b>رقم الهاتف:</b> <code>{$phone}</code>\n";
$message .= "🛏️ <b>نوع التسكين:</b> {$accommodation}\n";
$message .= "⭐ <b>تصنيف الفندق:</b> {$hotelStars}\n";
$message .= "🏙️ <b>المدينة:</b> {$city}\n";
$message .= "📝 <b>ملاحظات:</b> {$notes}\n";
$message .= "━━━━━━━━━━━━━━━━━━━━\n";
$message .= "⏰ <b>التاريخ:</b> {$date}\n";
$message .= "#حجز_جديد #الرواق_للسفر";

// ── Send to Telegram ──
$apiUrl  = "https://api.telegram.org/bot" . TELEGRAM_BOT_TOKEN . "/sendMessage";
$payload = json_encode([
    'chat_id'    => TELEGRAM_CHAT_ID,
    'text'       => $message,
    'parse_mode' => 'HTML',
]);

$ch = curl_init($apiUrl);
curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $payload,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
    CURLOPT_TIMEOUT        => 15,
    CURLOPT_SSL_VERIFYPEER => true,
]);

$response = curl_exec($ch);
$curlError = curl_error($ch);
$httpCode  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// ── Handle cURL errors ──
if ($curlError) {
    http_response_code(503);
    echo json_encode(['success' => false, 'message' => 'Connection error: ' . $curlError]);
    exit;
}

$result = json_decode($response, true);

// ── Return result ──
if ($result && $result['ok'] === true) {
    echo json_encode([
        'success' => true,
        'message' => 'تم إرسال طلبك بنجاح! سيتواصل معك فريقنا قريباً.',
    ]);
} else {
    $errDesc = $result['description'] ?? 'Unknown Telegram error';
    http_response_code(502);
    echo json_encode([
        'success' => false,
        'message' => 'خطأ في إرسال الرسالة: ' . $errDesc,
    ]);
}
