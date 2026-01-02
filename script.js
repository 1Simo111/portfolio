const year = document.querySelector("#year");
const langButtons = document.querySelectorAll(".lang-btn");
const i18nNodes = document.querySelectorAll("[data-i18n]");
const i18nHtmlNodes = document.querySelectorAll("[data-i18n-html]");
const placeholderNodes = document.querySelectorAll("[data-placeholder-en]");
let currentLang = "en";

if (year) {
  year.textContent = new Date().getFullYear();
}

const setLanguage = (lang) => {
  currentLang = lang;
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

const contactForm = document.querySelector(".contact-form");
const statusPopup = document.querySelector("#status-popup");
const popupTitle = document.querySelector("#popup-title");
const popupMessage = document.querySelector("#popup-message");
const popupIcon = document.querySelector(".popup-icon");
const popupCloseButtons = document.querySelectorAll("[data-popup-close]");
const popupCopy = {
  en: {
    success: {
      title: "Message sent",
      message: "Thanks for reaching out. I'll get back to you soon.",
    },
    error: {
      title: "Message not sent",
      message: "Please try again in a moment.",
    },
    validation: {
      title: "Complete the form",
      message: "Please fill out all fields before submitting.",
    },
  },
  fr: {
    success: {
      title: "Message envoyé",
      message: "Merci pour votre message. Je vous répondrai bientôt.",
    },
    error: {
      title: "Message non envoyé",
      message: "Veuillez réessayer dans un instant.",
    },
    validation: {
      title: "Formulaire incomplet",
      message: "Veuillez remplir tous les champs avant d'envoyer.",
    },
  },
};

const showPopup = (type, title, message, variant = type) => {
  if (!statusPopup || !popupTitle || !popupMessage || !popupIcon) {
    return;
  }

  const localized = popupCopy[currentLang]?.[variant];
  statusPopup.classList.remove("success", "error");
  statusPopup.classList.add("is-visible", type);
  statusPopup.setAttribute("aria-hidden", "false");
  popupTitle.textContent = localized?.title || title;
  popupMessage.textContent = localized?.message || message;
  popupIcon.textContent = type === "success" ? "OK" : "!";
};

const hidePopup = () => {
  if (!statusPopup) {
    return;
  }

  statusPopup.classList.remove("is-visible", "success", "error");
  statusPopup.setAttribute("aria-hidden", "true");
};

popupCloseButtons.forEach((button) => {
  button.addEventListener("click", hidePopup);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && statusPopup?.classList.contains("is-visible")) {
    hidePopup();
  }
});

if (contactForm && window.supabase) {
  const supabase = window.supabase.createClient(
    window.SUPABASE_URL,
    window.SUPABASE_ANON_KEY
  );

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const payload = {
      name: formData.get("name")?.toString().trim() || "",
      email: formData.get("email")?.toString().trim() || "",
      message: formData.get("message")?.toString().trim() || "",
    };

    if (!payload.name || !payload.email || !payload.message) {
      showPopup(
        "error",
        "Complete the form",
        "Please fill out all fields before submitting.",
        "validation"
      );
      return;
    }

    const { error } = await supabase
      .from("contact_submissions")
      .insert([payload]);

    if (error) {
      console.error("Supabase insert failed", error);
      showPopup("error", "Message not sent", "Please try again in a moment.");
      return;
    }

    showPopup("success", "Message sent", "Thanks for reaching out. I'll get back to you soon.");
    contactForm.reset();
  });
}
