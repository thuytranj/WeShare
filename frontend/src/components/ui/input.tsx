import * as React from 'react';
import { Input as InputPrimitive } from '@base-ui/react/input';
import { cn } from '@/lib/utils';

export interface InputProps extends React.ComponentProps<'input'> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
  unstyled?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      label,
      error,
      leftIcon,
      rightIcon,
      containerClassName = '',
      unstyled = false,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const inputControl = (
      <InputPrimitive
        id={inputId}
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(
          'w-full min-w-0 bg-transparent text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
          !unstyled && !label && !leftIcon && !rightIcon && !error && [
            'h-10 rounded-2xl px-4 py-2.5',
            'neu-inset focus-visible:ring-2 focus-visible:ring-[#8B70DF]/40',
            'border-none shadow-[inset_3px_3px_6px_#D1D9E6,inset_-3px_-3px_6px_#FFFFFF] dark:shadow-[inset_3px_3px_6px_#0A0D14,inset_-2px_-2px_6px_rgba(255,255,255,0.02)]',
          ],
          className
        )}
        {...props}
      />
    );

    if (label || error || leftIcon || rightIcon) {
      return (
        <div className={cn('w-full flex flex-col gap-1.5', containerClassName)}>
          {label && (
            <label
              htmlFor={inputId}
              className="text-xs font-semibold text-slate-600 dark:text-slate-300 ml-1 select-none"
            >
              {label}
            </label>
          )}

          <div
            className={cn(
              'neu-inset rounded-2xl flex items-center px-4 py-2.5 gap-3 transition-all duration-200',
              error ? 'border-rose-400 dark:border-rose-500' : ''
            )}
          >
            {leftIcon && (
              <div className="text-slate-400 dark:text-slate-500 shrink-0">
                {leftIcon}
              </div>
            )}

            {inputControl}

            {rightIcon && (
              <div className="text-slate-400 dark:text-slate-500 shrink-0 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300">
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

    return inputControl;
  }
);

Input.displayName = 'Input';
