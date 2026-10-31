// app/(admin)/manage/forms.tsx
// Client-side forms for the admin dashboard.
"use client";

import { useActionState, useEffect, useRef, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, Lock, LogIn, Mail, Send } from "lucide-react";
import { login, sendReply, type FormState } from "./actions";

const LABEL = "mb-1.5 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.14em] text-[#1A1A1A]/45";
const FIELD =
  "w-full border border-[#1A1A1A]/15 bg-white px-3 text-[15px] outline-none transition focus:border-[#02587B] focus:ring-2 focus:ring-[#02587B]/15";
const YELLOW = "polygon(0 0, 100% 20%, 100% 100%, 0% 100%)";

function Notice({ state }: { state: FormState }) {
  if (!state?.error && !state?.ok) return null;
  const ok = !!state.ok;
  return (
    <p
      role="status"
      className={`adm-in flex items-start gap-2 border-l-4 px-3 py-2 text-[14px] ${
        ok ? "border-[#02587B] bg-[#E3EEF2] text-[#02587B]" : "border-[#B60000] bg-[#B60000]/5 text-[#B60000]"
      }`}
    >
      {ok ? <CheckCircle2 size={18} className="shrink-0" /> : <AlertCircle size={18} className="shrink-0" />}
      {state.ok ?? state.error}
    </p>
  );
}

function SubmitButton({ children, icon }: { children: ReactNode; icon: ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      style={{ clipPath: YELLOW }}
      className="inline-flex items-center justify-center gap-2 bg-[#F4BA00] px-8 py-2.5 text-[16px] font-bold text-[#1A1A1A] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(244,186,0,0.35)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? <Loader2 size={18} className="animate-spin" /> : icon}
      {pending ? "Please wait..." : children}
    </button>
  );
}

/* ---------------- Login ---------------- */

export function LoginForm() {
  const [state, action] = useActionState(login, undefined);
  const [show, setShow] = useState(false);

  return (
    <form action={action} className="space-y-5">
      <div>
        <label htmlFor="email" className={LABEL}>
          <Mail size={14} /> Email
        </label>
        <input id="email" name="email" type="email" autoComplete="username" required className={`${FIELD} h-11`} />
      </div>
      <div>
        <label htmlFor="password" className={LABEL}>
          <Lock size={14} /> Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
            className={`${FIELD} h-11 pr-11`}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-[#1A1A1A]/45 hover:text-[#02587B]"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
      <Notice state={state} />
      <SubmitButton icon={<LogIn size={18} />}>Sign in</SubmitButton>
    </form>
  );
}

/* ---------------- Reply ---------------- */

export function ReplyForm({ id, defaultMessage }: { id: string; defaultMessage: string }) {
  const [state, action] = useActionState(sendReply, undefined);
  const ref = useRef<HTMLTextAreaElement | null>(null);
  const [len, setLen] = useState(defaultMessage.length);

  // Clear the box after a successful send
  useEffect(() => {
    if (state?.ok && ref.current) {
      ref.current.value = "";
      setLen(0);
    }
  }, [state]);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={id} />
      <textarea
        ref={ref}
        name="message"
        rows={9}
        maxLength={5000}
        defaultValue={defaultMessage}
        onChange={(e) => setLen(e.target.value.length)}
        className={`${FIELD} resize-y py-3 leading-relaxed`}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-[12px] text-[#1A1A1A]/45">{len} / 5000</span>
        <SubmitButton icon={<Send size={17} />}>Send Reply</SubmitButton>
      </div>
      <Notice state={state} />
    </form>
  );
}
