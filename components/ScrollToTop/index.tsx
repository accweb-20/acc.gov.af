"use client";
// Back-to-top button (bottom right). Fades in after scrolling down 300px.

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => setIsVisible(window.scrollY > 300);
    toggleVisibility();
    window.addEventListener("scroll", toggleVisibility, { passive: true });
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, left: 0, behavior: "smooth" })}
      aria-label="Back to top"
      title="Back to top"
      tabIndex={isVisible ? 0 : -1}
      className={`fixed bottom-6 right-6 z-[99] grid h-11 w-11 place-items-center bg-[#F4BA00] text-[#1A1A1A] shadow-[0_10px_24px_rgba(0,0,0,0.25)] transition duration-300 hover:-translate-y-1 hover:bg-brand hover:text-white ${
        isVisible ? "opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <ArrowUp size={20} strokeWidth={2.5} />
    </button>
  );
}
