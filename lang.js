(function () {
  "use strict";

  var STORAGE_KEY = "fm-lang";

  function safeGetStored() {
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      if (v === "it" || v === "en") return v;
    } catch (e) { /* ignore */ }
    return null;
  }

  function safeSetStored(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) { /* ignore */ }
  }

  function fromQuery() {
    try {
      var q = new URLSearchParams(window.location.search).get("lang");
      if (q === "it" || q === "en") return q;
    } catch (e) { /* ignore */ }
    return null;
  }

  function fromBrowser() {
    var list = [];
    try {
      if (navigator.languages && navigator.languages.length) {
        list = navigator.languages;
      } else if (navigator.language) {
        list = [navigator.language];
      }
    } catch (e) { /* ignore */ }
    for (var i = 0; i < list.length; i++) {
      var code = String(list[i] || "").toLowerCase();
      if (code.indexOf("it") === 0) return "it";
    }
    return "en";
  }

  function resolveLang() {
    return fromQuery() || safeGetStored() || fromBrowser();
  }

  function applyTitle(lang) {
    var root = document.documentElement;
    var titleEl = document.querySelector("title");
    if (lang === "en") {
      var en =
        root.getAttribute("data-title-en") ||
        (titleEl && titleEl.getAttribute("data-title-en"));
      if (en) document.title = en;
    } else if (titleEl && titleEl.getAttribute("data-title-it")) {
      document.title = titleEl.getAttribute("data-title-it");
    } else if (root.getAttribute("data-title-it")) {
      document.title = root.getAttribute("data-title-it");
    }
  }

  function applyPressed(lang) {
    var buttons = document.querySelectorAll(".lang-switch button[data-set-lang]");
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      var pressed = btn.getAttribute("data-set-lang") === lang;
      btn.setAttribute("aria-pressed", pressed ? "true" : "false");
    }
  }

  function applyLangClass(lang) {
    if (lang !== "it" && lang !== "en") lang = "it";
    var root = document.documentElement;
    root.lang = lang;
    root.classList.remove("lang-it", "lang-en");
    root.classList.add("lang-" + lang);
    return lang;
  }

  function finishUi(lang) {
    applyTitle(lang);
    applyPressed(lang);
  }

  function bindSwitch() {
    var buttons = document.querySelectorAll(".lang-switch button[data-set-lang]");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener("click", function (ev) {
        var lang = ev.currentTarget.getAttribute("data-set-lang");
        if (lang !== "it" && lang !== "en") return;
        applyLangClass(lang);
        finishUi(lang);
        safeSetStored(lang);
        try {
          var url = new URL(window.location.href);
          url.searchParams.set("lang", lang);
          window.history.replaceState({}, "", url);
        } catch (e) { /* ignore */ }
      });
    }
  }

  var lang = applyLangClass(resolveLang());

  function onReady() {
    finishUi(lang);
    bindSwitch();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady);
  } else {
    onReady();
  }
})();
