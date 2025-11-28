import { useState } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Reusable Select Component (RTL Ready)
 * Props:
 * - label: string
 * - options: [{ label: string, value: string }]
 * - value: string
 * - onChange: (value) => void
 * - placeholder: string
 */
export default function UISelect({ label, options = [], value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);

  const selectedLabel = options.find((opt) => opt.value === value)?.label;

  return (
    <div className="w-full" dir="rtl">
      {label && (
        <label className="block text-sm mb-1 font-medium text-gray-700">{label}</label>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 flex items-center justify-between text-gray-800 focus:ring-2 focus:ring-blue-500"
        >
          <span className="text-sm">
            {selectedLabel || (
              <span className="text-gray-400">{placeholder || "اختر..."}</span>
            )}
          </span>

          <ChevronDown className="h-4 w-4 text-gray-500" />
        </button>

        {open && (
          <ul className="absolute z-50 bg-white border rounded-lg shadow-lg mt-1 w-full max-h-60 overflow-auto animate-fadeIn">
            {options.map((opt) => (
              <li
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className="p-2.5 cursor-pointer text-sm hover:bg-blue-50"
              >
                {opt.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}