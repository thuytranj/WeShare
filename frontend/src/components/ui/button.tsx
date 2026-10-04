import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// eslint-disable-next-line react-refresh/only-export-components
export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 select-none cursor-pointer whitespace-nowrap text-sm font-medium transition-all outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none',
  {
    variants: {
      variant: {
        default: 'neu-btn-primary font-semibold text-white',
        primary: 'neu-btn-primary font-semibold text-white',
        secondary: 'neu-btn font-semibold text-slate-700 dark:text-slate-200',
        ghost:
          'bg-transparent hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-medium active:scale-95',
        inset: 'neu-inset text-pastel-lavender font-semibold shadow-inner',
        outline:
          'border border-input bg-transparent shadow-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200',
        destructive:
          'bg-rose-600 text-white shadow-xs hover:bg-rose-700 active:scale-95',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'px-5 py-2.5 text-sm rounded-full',
        sm: 'px-3.5 py-1.5 text-xs rounded-full',
        md: 'px-5 py-2.5 text-sm rounded-full',
        lg: 'px-6 py-3.5 text-base rounded-full',
        icon: 'size-8 p-0 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant,
      size,
      fullWidth = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          buttonVariants({ variant, size }),
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          leftIcon
        )}
        {children !== undefined && <span>{children}</span>}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
