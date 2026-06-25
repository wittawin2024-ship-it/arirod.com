import React from "react";

interface FormFieldProps {
  label: string;
  id: string;
  name: string;
  type?: "text" | "number" | "email" | "password" | "select" | "textarea" | "date";
  value: string | number;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  rows?: number;
  disabled?: boolean;
  hint?: string;
}

export default function FormField({
  label,
  id,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  placeholder = "",
  options = [],
  rows = 3,
  disabled = false,
  hint,
}: FormFieldProps) {
  const baseInputClass =
    "w-full px-4 py-2.5 bg-white border border-[var(--cloud-gray)] rounded-md text-[var(--graphite)] text-sm focus:outline-none focus:border-[var(--electric-blue)] focus:ring-1 focus:ring-[var(--electric-blue)] transition-colors disabled:bg-[var(--light-ash)] disabled:text-[var(--silver-fog)]";

  return (
    <div className="mb-4">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-[var(--pewter)] mb-1.5"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {type === "textarea" ? (
        <textarea
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          className={baseInputClass}
        />
      ) : type === "select" ? (
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={baseInputClass}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          disabled={disabled}
          className={baseInputClass}
        />
      )}

      {hint && <p className="mt-1.5 text-xs text-[var(--silver-fog)]">{hint}</p>}
    </div>
  );
}
