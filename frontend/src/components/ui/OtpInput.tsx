import React, { useRef, useEffect } from 'react';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  value,
  onChange,
  disabled = false,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (!val) return;

    const newValueArr = value.split('');
    newValueArr[index] = val[val.length - 1]; // pick last char
    const newCombined = newValueArr.join('');
    onChange(newCombined);

    // Auto forward focus
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const newValueArr = value.split('');
      if (newValueArr[index]) {
        newValueArr[index] = '';
        onChange(newValueArr.join(''));
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text/plain').replace(/[^0-9]/g, '').slice(0, length);
    if (pasted) {
      onChange(pasted);
      const nextFocus = Math.min(pasted.length, length - 1);
      inputRefs.current[nextFocus]?.focus();
    }
  };

  return (
    <div className="flex items-center justify-center gap-2.5 sm:gap-3 my-2" onPaste={handlePaste}>
      {Array.from({ length }).map((_, index) => {
        const char = value[index] || '';
        const isCurrentFocus = value.length === index || (index === length - 1 && value.length === length);

        return (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={char}
            disabled={disabled}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className={`w-11 h-13 sm:w-13 sm:h-14 neu-inset rounded-2xl text-center font-heading text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 outline-none transition-all duration-200 ${
              isCurrentFocus
                ? 'border-pastel-lavender/80 ring-2 ring-pastel-lavender/30 dark:ring-pastel-lavender/20'
                : 'border-slate-200/40 dark:border-white/5'
            }`}
          />
        );
      })}
    </div>
  );
};
