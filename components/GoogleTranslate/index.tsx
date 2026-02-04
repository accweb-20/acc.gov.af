"use client";

import { useEffect, useRef } from "react";
import { useLang } from "@/context/LanguageContext";

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

/**
 * Set cookie for googtrans used by Google Translate widget.
 * - days: cookie expiration in days
 * - NOTE: Do NOT set a domain for localhost; uncomment domain line only for production domain.
 */
function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  let cookie = `${name}=${value};path=/;expires=${expires};SameSite=Lax`;
  // Example: uncomment and replace with your domain for production (do NOT use on localhost)
  // if (location.hostname !== "localhost") cookie += ";domain=.example.com";
  document.cookie = cookie;
}

function getCurrentLangCode(): string {
  return document.documentElement.lang || "en";
}

export default function GoogleTranslate({ showWidget = false }: { showWidget?: boolean }) {
  const { lang } = useLang();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (initializedRef.current) return;

    // global init called by google script
    window.googleTranslateElementInit = function googleTranslateElementInit() {
      try {
        /* eslint-disable @typescript-eslint/no-unsafe-member-access */
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,ps,fa",
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          "google_translate_element"
        );
        /* eslint-enable @typescript-eslint/no-unsafe-member-access */
      } catch (e) {
        // ignore init errors
      }
    };

    const script = document.createElement("script");
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    initializedRef.current = true;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const target = lang === "en" ? "en" : lang === "ps" ? "ps" : "fa";
    const from = getCurrentLangCode() || "en";

    // fast approach: set the widget dropdown value if present
    const trySetCombo = () => {
      const combo = document.querySelector<HTMLSelectElement>("select.goog-te-combo");
      if (combo) {
        combo.value = target;
        const evt = document.createEvent("HTMLEvents");
        evt.initEvent("change", true, true);
        combo.dispatchEvent(evt);
        return true;
      }
      return false;
    };

    if (trySetCombo()) return;

    let attempts = 0;
    const t = setInterval(() => {
      attempts += 1;
      if (trySetCombo() || attempts > 10) {
        clearInterval(t);
      }
    }, 300);

    // fallback: set cookie and reload if dropdown approach fails
    const fallbackTimeout = setTimeout(() => {
      try {
        // set googtrans cookie once (format: /from/to)
        setCookie("googtrans", `/${from}/${target}`, 7);
      } catch (e) {
        // ignore cookie write errors
      }

      // reload only if necessary
      if (from !== target) {
        
      }
    }, 2000); // shorter wait (2s) for faster UX

    return () => {
      clearInterval(t);
      clearTimeout(fallbackTimeout);
    };
  }, [lang]);

  return (
    // keep hidden in production if you only want your custom dropdown to control translation
    <div id="google_translate_element" style={{ display: showWidget ? "block" : "none" }} />
  );
}
