const year = document.querySelector("#year");
const langButtons = document.querySelectorAll(".lang-btn");
const i18nNodes = document.querySelectorAll("[data-i18n]");
const i18nHtmlNodes = document.querySelectorAll("[data-i18n-html]");
const placeholderNodes = document.querySelectorAll("[data-placeholder-en]");

if (year) {
  year.textContent = new Date().getFullYear();
}

const setLanguage = (lang) => {
  document.documentElement.lang = lang;

  i18nNodes.forEach((node) => {
    const value = node.dataset[lang];
    if (value) {
      node.textContent = value;
    }
  });

  i18nHtmlNodes.forEach((node) => {
    const value = node.dataset[`${lang}Html`];
    if (value) {
      node.innerHTML = value;
    }
  });

  const placeholderKey = `placeholder${lang.charAt(0).toUpperCase()}${lang.slice(1)}`;
  placeholderNodes.forEach((node) => {
    const value = node.dataset[placeholderKey];
    if (value) {
      node.setAttribute("placeholder", value);
    }
  });

  langButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.lang === lang);
  });

  try {
    localStorage.setItem("lang", lang);
  } catch (error) {
    // Ignore storage errors (private mode, blocked storage).
  }
};

langButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const lang = button.dataset.lang || "en";
    setLanguage(lang);
  });
});

const savedLang = (() => {
  try {
    return localStorage.getItem("lang");
  } catch (error) {
    return null;
  }
})();

setLanguage(savedLang || "en");
