"use client";

import { useEffect, useState } from "react";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };

    toggleVisibility();

    window.addEventListener("scroll", toggleVisibility, { passive: true });

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="fixed right-8 bottom-8 z-[99]">
      {isVisible && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="bg-[#02587B] hover:shadow-signUp flex h-10 w-10 cursor-pointer items-center justify-center rounded-md text-white shadow-lg transition duration-300 ease-in-out"
        >
          <span className="mt-[6px] h-3 w-3 rotate-45 border-t border-l border-white" />
        </button>
      )}
    </div>
  );
}