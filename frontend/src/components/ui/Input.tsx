import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      leftIcon,
      rightIcon,
      className = '',
      containerClassName = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={`w-full flex flex-col gap-1.5 ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-slate-600 dark:text-slate-300 ml-1 select-none"
          >
            {label}
          </label>
        )}

        <div
          className={`neu-inset rounded-2xl flex items-center px-4 py-3 gap-3 transition-all duration-200 ${
            error ? 'border-rose-400 dark:border-rose-500' : ''
          }`}
        >
          {leftIcon && (
            <div className="text-slate-400 dark:text-slate-500 flex-shrink-0">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-transparent border-none outline-none text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 ${className}`}
            {...props}
          />

          {rightIcon && (
            <div className="text-slate-400 dark:text-slate-500 flex-shrink-0 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <span className="text-[11px] text-rose-500 font-medium ml-1">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
