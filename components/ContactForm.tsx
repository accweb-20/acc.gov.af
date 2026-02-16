// components/ContactForm.tsx
"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";

type FormState = {
  first_name: string;
  last_name: string;
  email: string;
  subject: string;
  message: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

const initialState: FormState = {
  first_name: "",
  last_name: "",
  email: "",
  subject: "",
  message: "",
};

export default function ContactForm(): React.ReactElement {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [shakeFields, setShakeFields] = useState<Record<string, number>>({});

  // --- REFS: declare each ref separately so TS infers correct element types ---
  const firstNameRef = useRef<HTMLInputElement | null>(null);
  const lastNameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const subjectRef = useRef<HTMLInputElement | null>(null);
  const messageRef = useRef<HTMLTextAreaElement | null>(null);

  // Map keys to refs for lookup (keeps use-sites simple)
  const refs = {
    first_name: firstNameRef,
    last_name: lastNameRef,
    email: emailRef,
    subject: subjectRef,
    message: messageRef,
  } as const;

  const icons = [
    { src: "/icons/social-media/facebook.svg", alt: "Facebook", href: "https://www.facebook.com/afghancart1" },
    { src: "/icons/social-media/instagram.svg", alt: "Instagram", href: "https://www.instagram.com/afghancartcorportation/?hl=en" },
    { src: "/icons/social-media/x.svg", alt: "X", href: "https://x.com/Afghancart" },
  ];

  // Shadows
  const normalShadow = "0 1px 4px rgba(2, 88, 123,0.2), 0 -1px 4px rgba(2, 88, 123,0.2)";
  const errorShadow = "0 1px 4px rgba(246,0,0,0.22), 0 -1px 4px rgba(246,0,0,0.26)";

  // Apply single-element CSS shake (reflow trick) — used for server errors or explicit shakes
  function applyShake(ref: React.RefObject<HTMLElement | null>) {
    if (!ref.current) return;
    ref.current.classList.remove("shake");
    // reflow to restart animation
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    void ref.current.offsetWidth;
    ref.current.classList.add("shake");
  }

  function validate(values: FormState): FieldErrors {
    const e: FieldErrors = {};
    if (!values.first_name.trim() || values.first_name.trim().length < 3) e.first_name = "First name must be at least 3 characters";
    if (!values.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) e.email = "Invalid email address";
    if (!values.subject.trim() || values.subject.trim().length < 3) e.subject = "Subject must be at least 3 characters";
    if (!values.message.trim() || values.message.trim().length < 10 || values.message.trim().length > 500) {
      e.message = "Message must be between 10 and 500 characters";
    }
    return e;
  }

  function triggerShakeFor(errorsObj: FieldErrors) {
    // increment counter to retrigger CSS animation each click
    const newShake: Record<string, number> = { ...shakeFields };
    for (const key of Object.keys(errorsObj)) {
      newShake[key] = (newShake[key] ?? 0) + 1;
    }
    setShakeFields(newShake);

    // focus the first invalid field
    const keys = Object.keys(errorsObj) as (keyof FormState)[];
    if (keys.length) {
      const first = keys[0];
      const ref = refs[first];
      const el = ref?.current;
      if (el && typeof el.focus === "function") el.focus();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerMessage(null);

    const err = validate(form);
    setErrors(err);

    // Always trigger shake for invalid fields so repeated clicks re-shake them
    if (Object.keys(err).length) {
      triggerShakeFor(err);
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        const msg = json?.error ?? "Failed saving message";
        setServerMessage(String(msg));
        // shake relevant fields (or all main fields) to indicate failure
        applyShake(firstNameRef);
        applyShake(emailRef);
        applyShake(subjectRef);
        applyShake(messageRef);
        return;
      } else {
        setForm(initialState);
        setErrors({});
        setServerMessage(null);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
      }
    } catch (err) {
      setServerMessage("Network error");
      // shake UI to indicate network/server failure
      applyShake(firstNameRef);
      applyShake(emailRef);
      applyShake(subjectRef);
      applyShake(messageRef);
    } finally {
      setLoading(false);
    }
  }

  function applyFieldValidationOnChange(name: keyof FormState, value: string) {
    // perform same checks as validate() but only for the single field
    if (name === "first_name") {
      if (!value.trim() || value.trim().length < 3) {
        setErrors((prev) => ({ ...prev, first_name: "First name must be at least 3 characters" }));
      } else {
        setErrors((prev) => {
          const copy = { ...prev };
          delete copy.first_name;
          return copy;
        });
      }
    } else if (name === "email") {
      if (!value.trim()) {
        setErrors((prev) => ({ ...prev, email: "Email is required" }));
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setErrors((prev) => ({ ...prev, email: "Invalid email address" }));
      } else {
        setErrors((prev) => {
          const copy = { ...prev };
          delete copy.email;
          return copy;
        });
      }
    } else if (name === "subject") {
      if (!value.trim() || value.trim().length < 3) {
        setErrors((prev) => ({ ...prev, subject: "Subject must be at least 3 characters" }));
      } else {
        setErrors((prev) => {
          const copy = { ...prev };
          delete copy.subject;
          return copy;
        });
      }
    } else if (name === "message") {
      const len = value.trim().length;
      if (len < 10 || len > 500) {
        setErrors((prev) => ({ ...prev, message: "Message must be between 10 and 500 characters" }));
      } else {
        setErrors((prev) => {
          const copy = { ...prev };
          delete copy.message;
          return copy;
        });
      }
    } else {
      // last_name etc: remove error if any
      setErrors((prev) => {
        if (!prev[name]) return prev;
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const name = e.target.name as keyof FormState;
    const value = e.target.value;
    setForm((s) => ({ ...s, [name]: value }));

    // Clear the error for this field and re-validate field-level constraints immediately
    applyFieldValidationOnChange(name, value);

    // Also trigger a quick visual shake removal/restore for that field if it had a recent shake counter
    // (incrementing shakeFields isn't necessary here unless we want to forcibly re-run animation)
    // we keep the existing shakeFields behavior for submit-time shakes
  }

  return (
    <div className="mx-auto w-[90%] md:w-[93%] lg:w-[90%] max-w-[493px] md:max-w-[924px] lg:max-w-[1140px] text-[#1A1A1A] font-rubik">
      <style>{`
        @keyframes shakeX {
          0% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
          100% { transform: translateX(0); }
        }
        @keyframes iconShake {
          0% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-4px) rotate(-3deg); }
          50% { transform: translateY(0) rotate(0deg); }
          75% { transform: translateY(-2px) rotate(2deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }
        .shake { animation: shakeX 420ms ease-in-out; }
        .icon-hover:hover { animation: iconShake 550ms ease-in-out; transform-origin: center; }
      `}</style>

      {/* Heading + description above the grid so the aside starts aligned with first input */}
      <div className="mb-6">
        <h2 className="text-[30px] md:text-[65px] leading-none font-extrabold tracking-wide text-[#1A1A1A] mb-6">Any questions?</h2>
        <p className="mt-2 text-[#1A1A1A] text-[18px] max-w-2xl">
          Fill out the form below and follow us on social media for the last updates and feedback
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* LEFT: Form */}
        <div>
          <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <input
                  ref={firstNameRef}
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  className={`h-[36px] px-3 w-full text-sm outline-none ${shakeFields.first_name ? "shake" : ""}`}
                  style={{
                    border: "none",
                    boxShadow: errors.first_name ? errorShadow : normalShadow,
                    borderRadius: 0,
                    background: "white",
                    color: "#1A1A1A",
                  }}
                  placeholder="First Name*"
                  aria-invalid={!!errors.first_name}
                />
                {/* Removed visible error text for first_name (only visual/error styling remains) */}
              </div>

              <div>
                <input
                  ref={lastNameRef}
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  className={`h-[36px] px-3 w-full text-sm outline-none ${shakeFields.last_name ? "shake" : ""}`}
                  style={{
                    border: "none",
                    boxShadow: errors.last_name ? errorShadow : normalShadow,
                    borderRadius: 0,
                    background: "white",
                    color: "#1A1A1A",
                  }}
                  placeholder="Last Name"
                  aria-invalid={!!errors.last_name}
                />
                {/* Removed visible error text for last_name */}
              </div>
            </div>

            <div className="mb-4">
              <input
                ref={emailRef}
                name="email"
                value={form.email}
                onChange={handleChange}
                className={`h-[36px] px-3 w-full text-sm outline-none ${shakeFields.email ? "shake" : ""}`}
                style={{
                  border: "none",
                  boxShadow: errors.email ? errorShadow : normalShadow,
                  borderRadius: 0,
                  background: "white",
                  color: "#1A1A1A",
                }}
                placeholder="Email Address*"
                aria-invalid={!!errors.email}
              />
              
            </div>

            <div className="mb-4">
              <input
                ref={subjectRef}
                name="subject"
                value={form.subject}
                onChange={handleChange}
                className={`h-[36px] px-3 w-full text-sm outline-none ${shakeFields.subject ? "shake" : ""}`}
                style={{
                  border: "none",
                  boxShadow: errors.subject ? errorShadow : normalShadow,
                  borderRadius: 0,
                  background: "white",
                  color: "#1A1A1A",
                }}
                placeholder="Subject*"
                aria-invalid={!!errors.subject}
              />
              {/* Removed visible error text for subject */}
            </div>

            <div className="mb-4">
              <textarea
                ref={messageRef}
                name="message"
                value={form.message}
                onChange={handleChange}
                className={`h-[120px] px-3 py-2 w-full text-sm outline-none resize-none ${shakeFields.message ? "shake" : ""}`}
                style={{
                  border: "none",
                  boxShadow: errors.message ? errorShadow : normalShadow,
                  borderRadius: 0,
                  background: "white",
                  color: "#1A1A1A",
                }}
                placeholder="Message*"
                aria-invalid={!!errors.message}
              />
              {/* Intentionally removed visible error text for message.
                  Validation and error styling (shadow / shake / aria-invalid) remain active. */}
            </div>

            {serverMessage ? <div className="mb-3 text-sm text-red-600">{serverMessage}</div> : null}

            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: "#F4BA00",
                  clipPath: "polygon(0 0, 100% 20%, 100% 100%, 0% 100%)",
                }}
                className="inline-block px-8 py-2 cursor-pointer font-bold text-[16px] text-[#1A1A1A] disabled:opacity-60"
                aria-disabled={loading}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>

              <div className="text-sm text-gray-600" aria-hidden>
                {/* reserved for inline hints */}
              </div>
            </div>
          </form>
        </div>

        {/* RIGHT: Contact details + social icons */}
        <aside className="text-sm">
          <div className="mb-6">
            <div className="font-bold text-base mb-1">Find US</div>
            <div className="text-gray-700">Khawaja Rawash Sreet, Custom Road, 9th Zoon, Kabul, Afghanistan</div>
          </div>

          <div className="mb-6">
            <div className="font-bold text-base mb-1">Email Us</div>
            <div>
              <a href="mailto:info@acc.gov.af" className="text-gray-700 hover:underline">
                info@acc.gov.af
              </a>
            </div>
          </div>

          <div className="mb-6">
            <div className="font-bold text-base mb-1">Call Us</div>
            <div className="text-gray-700">020 292 4696</div>
          </div>

          <div>
            <div className="font-semibold mb-3">Follow us</div>

            {/* Icons: one row, circular, responsive */}
            <div className="flex flex-wrap justify-start gap-3 items-center">
              {icons.map((icon) => (
                <a key={icon.alt} href={icon.href} target="_blank" rel="noreferrer" aria-label={icon.alt}>
                  <div
                    className="w-10 h-10 rounded-full bg-[#02587B] flex items-center justify-center icon-hover"
                    style={{ cursor: "pointer" }}
                  >
                    <div className="relative w-5 h-5">
                      <Image src={icon.src} alt={icon.alt} fill style={{ objectFit: "contain" }} />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed left-1/2 transform -translate-x-1/2 bottom-8 z-50">
          <div className="bg-white px-6 py-3  text-green-700 font-medium" style={{boxShadow: "0 12px 40px rgba(0,0,0,0.18), 0 4px 10px rgba(0,0,0,0.08)"}}>
            Your message is submitted successfully
          </div>
        </div>
      )}
    </div>
  );
}
