/* Saint Paul Luxury — informational currency display.

   IMPORTANT: NGN stays the one real, authoritative price everywhere on the
   site. Orders are still confirmed and paid in Naira over WhatsApp (there
   is no live multi-currency payment gateway yet, see main.js). This file
   only adds a clearly-labelled "approximately in your currency" estimate
   next to the NGN price, for a visitor browsing from outside Nigeria, so
   they don't have to do the mental math. It never replaces the NGN price
   and never implies that's the amount that will be charged.

   Two free, keyless third-party services are used, and both are optional:
   - ipwho.is to guess the visitor's country from their IP, so the right
     currency is pre-selected (the visitor can always override it).
   - @fawazahmed0/currency-api (served off the jsDelivr CDN) for daily
     NGN exchange rates.
   If either is slow, blocked (ad blockers, corporate networks, offline),
   or returns something unexpected, this file fails silently and the page
   simply shows the NGN price with no estimate, exactly as it would if
   this file didn't exist. Nothing here ever blocks rendering or breaks
   a page that doesn't call it. */

const CURRENCY_STORAGE_KEY = "spl_currency";
const RATES_STORAGE_KEY = "spl_fx_rates";
const RATES_MAX_AGE_MS = 24 * 60 * 60 * 1000; // re-fetch at most once a day

const SUPPORTED_CURRENCIES = {
  NGN: { symbol: "₦", locale: "en-NG" },
  USD: { symbol: "$", locale: "en-US" },
  GBP: { symbol: "£", locale: "en-GB" },
  EUR: { symbol: "€", locale: "en-IE" },
  GHS: { symbol: "GH₵", locale: "en-GH" },
  CAD: { symbol: "CA$", locale: "en-CA" }
};

/* To support another country: add its ISO country code here, and make
   sure its currency also has an entry in SUPPORTED_CURRENCIES above. */
const COUNTRY_TO_CURRENCY = {
  NG: "NGN",
  US: "USD",
  GB: "GBP",
  GH: "GHS",
  CA: "CAD",
  /* Eurozone */
  AT: "EUR", BE: "EUR", CY: "EUR", EE: "EUR", FI: "EUR", FR: "EUR",
  DE: "EUR", GR: "EUR", HR: "EUR", IE: "EUR", IT: "EUR", LV: "EUR",
  LT: "EUR", LU: "EUR", MT: "EUR", NL: "EUR", PT: "EUR", SK: "EUR",
  SI: "EUR", ES: "EUR"
};

let activeCurrency = "NGN";
let activeRates = null;

function getStoredCurrency() {
  try {
    return localStorage.getItem(CURRENCY_STORAGE_KEY);
  } catch (e) {
    return null;
  }
}

function setStoredCurrency(code) {
  try {
    localStorage.setItem(CURRENCY_STORAGE_KEY, code);
  } catch (e) {
    // localStorage unavailable (private browsing, blocked, etc.) — the
    // switcher still works for this page view, it just won't persist.
  }
}

function getCachedRates() {
  try {
    const raw = localStorage.getItem(RATES_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed.fetchedAt || Date.now() - parsed.fetchedAt > RATES_MAX_AGE_MS) return null;
    return parsed.rates || null;
  } catch (e) {
    return null;
  }
}

function setCachedRates(rates) {
  try {
    localStorage.setItem(RATES_STORAGE_KEY, JSON.stringify({ rates, fetchedAt: Date.now() }));
  } catch (e) {}
}

function fetchWithTimeout(url, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer));
}

/* Rates are "units of that currency per 1 NGN", e.g. rates.usd = 0.00075. */
async function fetchRates() {
  const cached = getCachedRates();
  if (cached) return cached;
  const sources = [
    "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/ngn.json",
    "https://latest.currency-api.pages.dev/v1/currencies/ngn.json"
  ];
  for (const url of sources) {
    try {
      const res = await fetchWithTimeout(url, 4000);
      if (!res.ok) continue;
      const data = await res.json();
      if (data && data.ngn) {
        setCachedRates(data.ngn);
        return data.ngn;
      }
    } catch (e) {
      // try the next source
    }
  }
  return null;
}

async function detectCountryCurrency() {
  try {
    const res = await fetchWithTimeout("https://ipwho.is/", 3000);
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.success && data.country_code) {
      return COUNTRY_TO_CURRENCY[data.country_code] || null;
    }
  } catch (e) {}
  return null;
}

function convertFromNgn(ngnAmount) {
  if (activeCurrency === "NGN" || !activeRates) return null;
  const rate = activeRates[activeCurrency.toLowerCase()];
  if (!rate || !isFinite(rate)) return null;
  return ngnAmount * rate;
}

function formatMoney(amount, currencyCode) {
  const meta = SUPPORTED_CURRENCIES[currencyCode];
  const rounded = amount >= 100 ? Math.round(amount) : Math.round(amount * 100) / 100;
  return meta.symbol + rounded.toLocaleString(meta.locale);
}

/* Finds every [data-ngn] price element on the page (written by priceHtml()
   in products.js, or set directly by cart.html/checkout.html for computed
   totals) and shows the visitor's chosen currency as the prominent figure,
   with the real NGN amount kept visible but secondary — that NGN figure is
   the one actually charged (see main.js: no multi-currency payment gateway
   is wired up), so it is never hidden, only de-emphasised once a foreign
   estimate is shown. Safe to call repeatedly, e.g. after a currency switch
   or a grid re-render.

   The original NGN markup (which can be a plain price, or the
   sale/compare/discount-badge row from priceHtml()) is wrapped in a
   .price-ngn span the first time this runs on an element, so CSS can style
   it independently of the inserted .price-fx estimate without this file
   needing to know each page's exact price markup. */
function applyCurrencyDisplay() {
  document.querySelectorAll("[data-ngn]").forEach(el => {
    const ngn = parseFloat(el.dataset.ngn);
    if (!el.querySelector(":scope > .price-ngn")) {
      const wrapper = document.createElement("span");
      wrapper.className = "price-ngn";
      while (el.firstChild) wrapper.appendChild(el.firstChild);
      el.appendChild(wrapper);
    }
    let fxEl = el.querySelector(":scope > .price-fx");
    if (activeCurrency === "NGN" || !isFinite(ngn)) {
      if (fxEl) fxEl.remove();
      el.classList.remove("has-fx");
      return;
    }
    const converted = convertFromNgn(ngn);
    if (converted == null) {
      if (fxEl) fxEl.remove();
      el.classList.remove("has-fx");
      return;
    }
    el.classList.add("has-fx");
    if (!fxEl) {
      fxEl = document.createElement("span");
      fxEl.className = "price-fx";
      el.appendChild(fxEl);
    }
    fxEl.textContent = `≈ ${formatMoney(converted, activeCurrency)}`;
  });
}

function renderCurrencySwitcher() {
  document.querySelectorAll("[data-currency-switcher]").forEach(mount => {
    mount.innerHTML = "";
    const select = document.createElement("select");
    select.className = "currency-select";
    select.setAttribute("aria-label", "Display currency (orders are still charged in Naira)");
    Object.keys(SUPPORTED_CURRENCIES).forEach(code => {
      const opt = document.createElement("option");
      opt.value = code;
      opt.textContent = code;
      if (code === activeCurrency) opt.selected = true;
      select.appendChild(opt);
    });
    select.addEventListener("change", async () => {
      activeCurrency = select.value;
      setStoredCurrency(activeCurrency);
      if (activeCurrency !== "NGN" && !activeRates) {
        activeRates = await fetchRates();
        if (!activeRates) {
          activeCurrency = "NGN";
          select.value = "NGN";
        }
      }
      applyCurrencyDisplay();
    });
    mount.appendChild(select);
  });
}

async function initCurrency() {
  const stored = getStoredCurrency();
  if (stored && SUPPORTED_CURRENCIES[stored]) {
    activeCurrency = stored;
  } else {
    const detected = await detectCountryCurrency();
    if (detected) activeCurrency = detected;
  }
  if (activeCurrency !== "NGN") {
    activeRates = await fetchRates();
    if (!activeRates) activeCurrency = "NGN"; // no rate available, show NGN only
  }
  renderCurrencySwitcher();
  applyCurrencyDisplay();
}

document.addEventListener("DOMContentLoaded", initCurrency);
