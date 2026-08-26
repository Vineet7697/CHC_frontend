import React from "react";

function FieldWrap({
  label,
  required,
  error,
  hint,
  children,
  id,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  id: string;
}) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-semibold text-ink mb-1.5">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-red-600 mt-1.5">{error}</p>
      ) : hint ? (
        <p className="text-xs text-slate-400 mt-1.5">{hint}</p>
      ) : null}
    </div>
  );
}

const baseInput =
  "w-full text-sm bg-panel border rounded-lg px-3.5 py-2.5 outline-none transition-colors placeholder:text-slate-400 disabled:bg-teal-50/60 disabled:text-slate-400";

export function TextField({
  label,
  id,
  required,
  error,
  hint,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; id: string; required?: boolean; error?: string; hint?: string }) {
  return (
    <FieldWrap label={label} required={required} error={error} hint={hint} id={id}>
      <input
        id={id}
        className={`${baseInput} ${error ? "border-red-400 focus:border-red-500" : "border-line focus:border-teal-700"}`}
        {...props}
      />
    </FieldWrap>
  );
}

export function TextAreaField({
  label,
  id,
  required,
  error,
  hint,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; id: string; required?: boolean; error?: string; hint?: string }) {
  return (
    <FieldWrap label={label} required={required} error={error} hint={hint} id={id}>
      <textarea
        id={id}
        className={`${baseInput} resize-none ${error ? "border-red-400 focus:border-red-500" : "border-line focus:border-teal-700"}`}
        {...props}
      />
    </FieldWrap>
  );
}

export function SelectField({
  label,
  id,
  required,
  error,
  hint,
  options,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  id: string;
  required?: boolean;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <FieldWrap label={label} required={required} error={error} hint={hint} id={id}>
      <select
        id={id}
        className={`${baseInput} ${error ? "border-red-400 focus:border-red-500" : "border-line focus:border-teal-700"}`}
        {...props}
      >
        <option value="">Select...</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldWrap>
  );
}
