/**
 * الرواق للسفر — programs.js
 *
 * Handles:
 *  - Rendering 12 month cards
 *  - 3-step booking flow (month → trip type → form)
 *  - Form validation
 *  - Sending data to Telegram Bot API via PHP backend (or directly if backend unavailable)
 *
 * ══════════════════════════════════════════════════════
 *  TELEGRAM SETUP INSTRUCTIONS
 * ══════════════════════════════════════════════════════
 *  1. Create a bot: message @BotFather on Telegram, type /newbot
 *  2. Copy the bot token (format: 123456:ABCdef...)
 *  3. Find your Chat ID:
 *     a. Send any message to your new bot
 *     b. Open: https://api.telegram.org/bot{YOUR_TOKEN}/getUpdates
 *     c. Look for "chat":{"id": YOUR_CHAT_ID}
 *  4. Put token + chat_id in /backend/config.php
 *  5. Done! Form submissions will arrive in your Telegram.
 * ══════════════════════════════════════════════════════
 */

/* ── Month data ── */
const MONTHS = [
  { ar: 'يناير',   en: 'Jan', emoji: '❄️' },
  { ar: 'فبراير',  en: 'Feb', emoji: '🌸' },
  { ar: 'مارس',    en: 'Mar', emoji: '🌿' },
  { ar: 'أبريل',   en: 'Apr', emoji: '🌷' },
  { ar: 'ماي',     en: 'May', emoji: '☀️' },
  { ar: 'يونيو',   en: 'Jun', emoji: '🌊' },
  { ar: 'يوليوز',  en: 'Jul', emoji: '🏖️' },
  { ar: 'غشت',     en: 'Aug', emoji: '🌴' },
  { ar: 'شتنبر',   en: 'Sep', emoji: '🍂' },
  { ar: 'أكتوبر',  en: 'Oct', emoji: '🕌' },
  { ar: 'نونبر',   en: 'Nov', emoji: '🌙' },
  { ar: 'دجنبر',   en: 'Dec', emoji: '✨' },
];

/* ── State ── */
let selectedMonth   = null;
let selectedTripType = null;

/* ── DOM refs ── */
const monthsSection      = document.getElementById('months-section');
const tripTypeSection    = document.getElementById('trip-type-section');
const bookingFormSection = document.getElementById('booking-form-section');
const monthsGrid         = document.getElementById('months-grid');
const tripSubtitle       = document.getElementById('trip-subtitle');
const bookingSummary     = document.getElementById('booking-summary');
const bookingForm        = document.getElementById('booking-form');
const submitBtn          = document.getElementById('submit-btn');
const btnText            = document.getElementById('btn-text');
const successMessage     = document.getElementById('success-message');
const formError          = document.getElementById('form-error');

/* ─────────────────────────────────────────────
   STEP 1: Render month cards
   ───────────────────────────────────────────── */
function renderMonths() {
  if (!monthsGrid) return;
  monthsGrid.innerHTML = '';

  MONTHS.forEach((month, index) => {
    const card = document.createElement('div');
    card.className = 'month-card animate-on-scroll';
    card.style.transitionDelay = `${(index % 4) * 0.06}s`;
    card.innerHTML = `
      <span class="month-emoji">${month.emoji}</span>
      <div class="month-name">${month.ar}</div>
      <div class="month-en">${month.en}</div>
    `;
    card.addEventListener('click', () => selectMonth(month.ar, card));
    monthsGrid.appendChild(card);
  });

  // Trigger scroll animation for dynamically added cards
  requestAnimationFrame(() => {
    document.querySelectorAll('.month-card').forEach(el => el.classList.add('animated'));
  });
}

/* ─────────────────────────────────────────────
   STEP 1 → 2: Month selected
   ───────────────────────────────────────────── */
function selectMonth(monthName, cardEl) {
  selectedMonth = monthName;

  // Visual: highlight selected card
  document.querySelectorAll('.month-card').forEach(c => c.classList.remove('selected'));
  cardEl.classList.add('selected');

  // Update trip subtitle
  if (tripSubtitle) {
    tripSubtitle.textContent = `شهر ${monthName} — اختر نوع الرحلة`;
  }

  // Reset trip type card highlights
  document.getElementById('card-individual')?.classList.remove('selected');
  document.getElementById('card-family')?.classList.remove('selected');

  // Transition to step 2
  goToStep(2);
  scrollToContent(tripTypeSection);
}

/* ─────────────────────────────────────────────
   STEP 2 → 3: Trip type selected
   ───────────────────────────────────────────── */
function selectTripType(type) {
  selectedTripType = type;

  // Visual: highlight selected card
  const cardIndividual = document.getElementById('card-individual');
  const cardFamily     = document.getElementById('card-family');
  cardIndividual?.classList.remove('selected');
  cardFamily?.classList.remove('selected');

  if (type === 'فردي') {
    cardIndividual?.classList.add('selected');
  } else {
    cardFamily?.classList.add('selected');
  }

  // Update booking summary tags
  if (bookingSummary) {
    bookingSummary.innerHTML = `
      <span class="summary-tag">📅 ${selectedMonth}</span>
      <span class="summary-tag">${type === 'فردي' ? '🧳 رحلة فردية' : '👨‍👩‍👧‍👦 رحلة عائلية'}</span>
    `;
  }

  // Reset form & hide success
  resetFormFields();

  // Transition to step 3
  goToStep(3);
  scrollToContent(bookingFormSection);
}

/* ─────────────────────────────────────────────
   Navigation back
   ───────────────────────────────────────────── */
function goBack(toStep) {
  if (toStep === 1) {
    goToStep(1);
    scrollToContent(monthsSection);
  } else if (toStep === 2) {
    goToStep(2);
    scrollToContent(tripTypeSection);
  }
}

/* ─────────────────────────────────────────────
   Step indicator update + section visibility
   ───────────────────────────────────────────── */
function goToStep(step) {
  const step1El = document.getElementById('step-1');
  const step2El = document.getElementById('step-2');
  const step3El = document.getElementById('step-3');
  const line1   = document.getElementById('line-1');
  const line2   = document.getElementById('line-2');

  // Reset all
  [step1El, step2El, step3El].forEach(el => {
    if (el) { el.classList.remove('active', 'done'); }
  });
  [line1, line2].forEach(el => {
    if (el) { el.classList.remove('active', 'done'); }
  });

  // Hide all sections
  monthsSection.style.display      = 'none';
  tripTypeSection.classList.remove('active');
  bookingFormSection.classList.remove('active');

  if (step === 1) {
    monthsSection.style.display = 'block';
    step1El?.classList.add('active');
  } else if (step === 2) {
    tripTypeSection.classList.add('active');
    step1El?.classList.add('done');
    step2El?.classList.add('active');
    line1?.classList.add('done');
  } else if (step === 3) {
    bookingFormSection.classList.add('active');
    step1El?.classList.add('done');
    step2El?.classList.add('done');
    step3El?.classList.add('active');
    line1?.classList.add('done');
    line2?.classList.add('active');
  }
}

function scrollToContent(el) {
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 100;
  window.scrollTo({ top, behavior: 'smooth' });
}

/* ─────────────────────────────────────────────
   Form validation
   ───────────────────────────────────────────── */
function validateForm() {
  const fullName      = document.getElementById('full-name').value.trim();
  const phone         = document.getElementById('phone').value.trim();
  const accommodation = document.querySelector('input[name="accommodation"]:checked');
  const hotelStars    = document.querySelector('input[name="hotel_stars"]:checked');
  const city          = document.getElementById('city').value.trim();

  if (!fullName)      return 'الرجاء إدخال الإسم الكامل';
  if (!phone)         return 'الرجاء إدخال رقم الهاتف';
  if (!/^[0-9+\s\-]{8,15}$/.test(phone)) return 'الرجاء إدخال رقم هاتف صحيح';
  if (!accommodation) return 'الرجاء اختيار نوع التسكين';
  if (!hotelStars)    return 'الرجاء اختيار تصنيف الفندق';
  if (!city)          return 'الرجاء إدخال اسم المدينة';
  return null;
}

/* ─────────────────────────────────────────────
   Form submit → send to backend → Telegram
   ───────────────────────────────────────────── */
if (bookingForm) {
  bookingForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    hideError();

    const validationError = validateForm();
    if (validationError) {
      showError(validationError);
      return;
    }

    // Collect data
    const data = {
      month:         selectedMonth,
      trip_type:     selectedTripType,
      full_name:     document.getElementById('full-name').value.trim(),
      phone:         document.getElementById('phone').value.trim(),
      accommodation: document.querySelector('input[name="accommodation"]:checked').value,
      hotel_stars:   document.querySelector('input[name="hotel_stars"]:checked').value,
      city:          document.getElementById('city').value.trim(),
      notes:         document.getElementById('notes').value.trim() || 'لا توجد',
    };

    // Show loading state
    submitBtn.disabled = true;
    btnText.textContent = '⏳ جارٍ الإرسال...';

    try {
      /*
       * ══════════════════════════════════════════════════════
       *  OPTION A: Via PHP backend (recommended for production)
       *  Make sure /backend/telegram.php is accessible
       * ══════════════════════════════════════════════════════
       */
      const response = await fetch('backend/telegram.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        showSuccess();
      } else {
        throw new Error(result.message || 'خطأ في الإرسال');
      }

    } catch (err) {
      /*
       * ══════════════════════════════════════════════════════
       *  OPTION B: Direct Telegram API (fallback / testing)
       *  WARNING: exposes bot token in client-side JS!
       *  Replace the placeholder values below for testing only.
       *  For production always use the PHP backend.
       * ══════════════════════════════════════════════════════
       *
       * const BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE';
       * const CHAT_ID   = 'YOUR_CHAT_ID_HERE';
       * await sendDirectToTelegram(data, BOT_TOKEN, CHAT_ID);
       * showSuccess(); return;
       */
      console.error('Backend error:', err.message);
      showError('حدث خطأ في الإرسال. تأكد من إعداد الخادم الخلفي (backend/telegram.php). راجع README للتعليمات.');
    } finally {
      submitBtn.disabled = false;
      btnText.textContent = '📤 إرسال الطلب';
    }
  });
}

/* Direct Telegram API (testing/fallback) */
async function sendDirectToTelegram(data, token, chatId) {
  const msg = buildTelegramMessage(data);
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: 'HTML' }),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.description || 'Telegram error');
}

function buildTelegramMessage(d) {
  return `
🌍 <b>طلب حجز جديد — الرواق للسفر</b>
━━━━━━━━━━━━━━━━━━━━
📅 <b>الشهر:</b> ${d.month}
✈️ <b>نوع الرحلة:</b> ${d.trip_type}
👤 <b>الإسم الكامل:</b> ${d.full_name}
📞 <b>رقم الهاتف:</b> <code>${d.phone}</code>
🛏️ <b>نوع التسكين:</b> ${d.accommodation}
⭐ <b>تصنيف الفندق:</b> ${d.hotel_stars}
🏙️ <b>المدينة:</b> ${d.city}
📝 <b>ملاحظات:</b> ${d.notes}
━━━━━━━━━━━━━━━━━━━━
⏰ ${new Date().toLocaleString('ar-MA', { timeZone: 'Africa/Casablanca' })}
`.trim();
}

/* ─────────────────────────────────────────────
   UI helpers
   ───────────────────────────────────────────── */
function showSuccess() {
  bookingForm.style.display = 'none';
  successMessage.classList.add('show');
  // Hide the back button
  const backBtn = bookingFormSection.querySelector('[onclick="goBack(2)"]');
  if (backBtn) backBtn.closest('div').style.display = 'none';
}

function showError(msg) {
  if (!formError) return;
  formError.textContent = '⚠️ ' + msg;
  formError.style.display = 'block';
  formError.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
function hideError() {
  if (formError) formError.style.display = 'none';
}

function resetFormFields() {
  if (!bookingForm) return;
  bookingForm.reset();
  bookingForm.style.display = 'block';
  successMessage.classList.remove('show');
  hideError();
  // Show back button again
  const backBtn = bookingFormSection?.querySelector('[onclick="goBack(2)"]');
  if (backBtn) backBtn.closest('div').style.display = 'block';
}

function resetAll() {
  selectedMonth    = null;
  selectedTripType = null;
  resetFormFields();
  goToStep(1);
  scrollToContent(monthsSection);
  document.querySelectorAll('.month-card').forEach(c => c.classList.remove('selected'));
}

/* ─── Initialize ─── */
renderMonths();
goToStep(1);
