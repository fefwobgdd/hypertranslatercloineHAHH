"use strict";

const SUPPORTED_LANGS = [
  "af", "sq", "am", "ar", "hy", "az", "eu", "bn", "bs", "bg", "ca", "ceb", "zh-CN", "zh-TW", "co", "hr", "cs", "da", "nl", "en", "eo", "et", "fi", "fr", "fy", "gl", "ka", "de", "el", "gu", "ht", "ha", "haw", "iw", "hi", "hmn", "hu", "is", "id", "ga", "ja", "jw", "kn", "kk", "km", "ko", "ku", "lo", "lv", "lt", "lb", "mk", "mg", "ms", "ml", "mt", "mi", "mr", "mn", "ne", "no", "ny", "ps", "fa", "pl", "pt", "pa", "ro", "ru", "sm", "gd", "sr", "st", "sn", "sd", "si", "sk", "sl", "so", "es", "sw", "sv", "tl", "tg", "ta", "te", "th", "tr", "uk", "ur", "uz", "vi", "cy", "xh", "yi", "yo", "zu"
];

const elements = {
  input: document.querySelector("#input-text"), output: document.querySelector("#output-text"),
  source: document.querySelector("#source-language"), target: document.querySelector("#target-language"),
  count: document.querySelector("#translation-count"), transformEach: document.querySelector("#transform-each"),
  transformMenu: document.querySelector("#transform-menu"), transformStop: document.querySelector("#transform-stop"),
  translate: document.querySelector("#translate-button"), clear: document.querySelector("#clear-button"),
  transform: document.querySelector("#transform-button"), copy: document.querySelector("#copy-button"),
  previous: document.querySelector("#previous-button"), next: document.querySelector("#next-button"),
  progressBar: document.querySelector("#progress-bar"), progressLabel: document.querySelector("#progress-label")
};

let outputHistory = [];
let outputHistoryIndex = -1;
let translating = false;

function setOutputText(text) { elements.output.value = text; }
function setProgress(completed, total) {
  const percentage = total ? completed / total * 100 : 0;
  elements.progressBar.style.width = `${percentage}%`;
  elements.progressLabel.textContent = `Translation progress: ${completed}/${total} translated`;
}
function updateHistoryButtons() {
  elements.previous.disabled = translating || !outputHistory.length || outputHistoryIndex <= 0;
  elements.next.disabled = translating || !outputHistory.length || outputHistoryIndex >= outputHistory.length - 1;
}
function showCurrentOutputHistory() {
  if (outputHistory.length) setOutputText(outputHistory[outputHistoryIndex]);
  updateHistoryButtons();
}
function addOutputHistory(text) {
  outputHistory.push(text);
  outputHistoryIndex = outputHistory.length - 1;
  showCurrentOutputHistory();
}
function normaliseLanguage(value) { return value.trim(); }

async function translateRequest(text, source, target) {
  const query = new URLSearchParams({ client: "gtx", sl: source, tl: target, dt: "t", q: text });
  const response = await fetch(`https://translate.googleapis.com/translate_a/single?${query}`);
  if (!response.ok) throw new Error(`Translation request failed (${response.status}).`);
  const data = await response.json();
  if (!Array.isArray(data[0])) throw new Error("Google Translate returned an unexpected response.");
  return data[0].map((line) => line[0] || "").join("");
}

async function hypertranslate(text, beginLang, endLang, count, transformFunction, transformStopAfter) {
  if (beginLang !== "auto" && !SUPPORTED_LANGS.includes(beginLang)) throw new Error(`"${beginLang}" is not a supported starting language.`);
  if (!SUPPORTED_LANGS.includes(endLang)) throw new Error(`"${endLang}" is not a supported ending language.`);
  if (!Number.isInteger(count) || count < 0) throw new Error("Translate count must be a non-negative whole number.");

  const totalTranslations = count + 1;
  let currentText = text;
  let currentLang = beginLang;
  for (let index = 0; index < count; index += 1) {
    const nextLang = SUPPORTED_LANGS[Math.floor(Math.random() * SUPPORTED_LANGS.length)];
    currentText = await translateRequest(currentText, currentLang, nextLang);
    currentLang = nextLang;
    const translatedCount = index + 1;
    if (transformFunction && (transformStopAfter === null || translatedCount <= transformStopAfter)) currentText = transformFunction(currentText);
    addOutputHistory(currentText);
    setProgress(translatedCount, totalTranslations);
  }
  currentText = await translateRequest(currentText, currentLang, endLang);
  if (transformFunction && (transformStopAfter === null || totalTranslations <= transformStopAfter)) currentText = transformFunction(currentText);
  addOutputHistory(currentText);
  setProgress(totalTranslations, totalTranslations);
  return currentText;
}

function setBusy(isBusy) {
  translating = isBusy;
  elements.translate.disabled = isBusy;
  elements.translate.textContent = isBusy ? "Translating…" : "Translate!";
  updateHistoryButtons();
}

async function startTranslation() {
  if (translating) return;
  const countValue = elements.count.value.trim();
  if (!/^\d+$/.test(countValue)) { setOutputText("Translate count must be a number."); return; }
  const stopValue = elements.transformStop.value.trim();
  if (elements.transformEach.checked && stopValue && !/^\d+$/.test(stopValue)) { setOutputText("Stop transforming after must be a number."); return; }
  const selectedTransform = window.transforms[elements.transformMenu.value];
  const transformFunction = elements.transformEach.checked ? selectedTransform?.transform : null;
  if (elements.transformEach.checked && !transformFunction) { setOutputText("Selected transform is not available."); return; }

  outputHistory = [];
  outputHistoryIndex = -1;
  setProgress(0, Number(countValue) + 1);
  setOutputText("Translating…");
  setBusy(true);
  try {
    await hypertranslate(elements.input.value, normaliseLanguage(elements.source.value), normaliseLanguage(elements.target.value), Number(countValue), transformFunction, stopValue ? Number(stopValue) : null);
  } catch (error) {
    setOutputText(error instanceof Error ? error.message : String(error));
  } finally { setBusy(false); }
}

elements.translate.addEventListener("click", startTranslation);
elements.clear.addEventListener("click", () => { elements.input.value = ""; elements.input.focus(); });
elements.transform.addEventListener("click", () => {
  if (!elements.input.value.trim()) return;
  const transform = window.transforms[elements.transformMenu.value]?.transform;
  if (transform) elements.input.value = transform(elements.input.value.trim());
});
elements.copy.addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(elements.output.value); elements.copy.textContent = "Copied!"; }
  catch { elements.output.select(); document.execCommand("copy"); elements.copy.textContent = "Copied!"; }
  window.setTimeout(() => { elements.copy.textContent = "Copy!"; }, 1200);
});
elements.previous.addEventListener("click", () => { outputHistoryIndex = Math.max(0, outputHistoryIndex - 1); showCurrentOutputHistory(); });
elements.next.addEventListener("click", () => { outputHistoryIndex = Math.min(outputHistory.length - 1, outputHistoryIndex + 1); showCurrentOutputHistory(); });
updateHistoryButtons();
