import { $all, $ } from "../core/dom.js";

export function initSheets() {
  const overlay = $("#overlay");

  $all("[data-close-sheet]").forEach(btn => btn.addEventListener("click", closeAllSheets));
  overlay.addEventListener("click", closeAllSheets);
}

export function openSheet(id) {
  $("#overlay").classList.remove("hidden");
  $(id).classList.remove("hidden");
}

export function closeAllSheets() {
  $("#overlay").classList.add("hidden");
  $all(".sheet").forEach(s => s.classList.add("hidden"));
}
