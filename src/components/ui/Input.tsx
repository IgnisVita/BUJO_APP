// ABOUTME: Beautiful input component with floating labels and animations
// Supports various types, error states, and icon integration

import { cva, type VariantProps } from 'class-variance-authority';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Eye, EyeOff, type LucideIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils/cn';

const inputVariants = cva(
  'flex w-full rounded-lg border bg-background text-sm ring-offset-background transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'border-input focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent',
        glass:
          'backdrop-blur-md bg-white/5 border-white/10 focus-visible:bg-white/10 focus-visible:border-white/20',
        filled:
          'border-transparent bg-neutral-100 focus-visible:bg-neutral-50 dark:bg-neutral-800 dark:focus-visible:bg-neutral-700',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 py-2',
        lg: 'h-12 px-4 text-base',
      },
      hasError: {
        true: 'border-destructive focus-visible:ring-destructive',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      hasError: false,
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  onRightIconClick?: () => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      variant,
      size,
      label,
      helperText,
      error,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      onRightIconClick,
      id,
      placeholder,
      value,
      onChange,
      onFocus,
      onBlur,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const [isFocused, setIsFocused] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState(value || '');
    const inputId = id || generatedId;

    const hasValue = Boolean(value || internalValue);
    const hasError = Boolean(error);
    const isPassword = type === 'password';

    React.useEffect(() => {
      setInternalValue(value || '');
    }, [value]);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalValue(e.target.value);
      onChange?.(e);
    };

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    // Determine which icon to show on the right
    let FinalRightIcon = RightIcon;
    let finalOnRightIconClick = onRightIconClick;

    if (isPassword && !RightIcon) {
      FinalRightIcon = showPassword ? EyeOff : Eye;
      finalOnRightIconClick = togglePasswordVisibility;
    }

    return (
      <div className="relative w-full">
        {/* Floating Label */}
        {label && (
          <motion.label
            htmlFor={inputId}
            className={cn(
              'absolute left-3 transition-all duration-200 pointer-events-none z-10',
              'text-muted-foreground',
              {
                'text-xs -top-2 px-1 bg-background': isFocused || hasValue || placeholder,
                'text-sm top-2.5': !isFocused && !hasValue && !placeholder,
                'text-destructive': hasError,
                'text-primary-600 dark:text-primary-400': isFocused && !hasError,
              },
              LeftIcon && 'left-10'
            )}
            initial={false}
            animate={{
              y: isFocused || hasValue || placeholder ? -10 : 0,
              scale: isFocused || hasValue || placeholder ? 0.85 : 1,
              x: isFocused || hasValue || placeholder ? -4 : 0,
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            {label}
          </motion.label>
        )}

        {/* Input Container */}
        <div className="relative flex items-center">
          {/* Left Icon */}
          {LeftIcon && (
            <div className="absolute left-3 text-muted-foreground">
              <LeftIcon className="h-4 w-4" />
            </div>
          )}

          {/* Input Field */}
          <input
            type={isPassword && showPassword ? 'text' : type}
            className={cn(
              inputVariants({ variant, size, hasError, className }),
              LeftIcon && 'pl-10',
              (FinalRightIcon || hasError) && 'pr-10'
            )}
            ref={ref}
            id={inputId}
            value={internalValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            {...props}
          />

          {/* Right Icon / Error Icon */}
          <AnimatePresence mode="wait">
            {hasError ? (
              <motion.div
                key="error"
                className="absolute right-3 text-destructive"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
              >
                <AlertCircle className="h-4 w-4" />
              </motion.div>
            ) : FinalRightIcon ? (
              <motion.button
                key="icon"
                type="button"
                onClick={finalOnRightIconClick}
                className={cn(
                  'absolute right-3 text-muted-foreground hover:text-foreground transition-colors',
                  !finalOnRightIconClick && 'pointer-events-none'
                )}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                disabled={disabled}
              >
                <FinalRightIcon className="h-4 w-4" />
              </motion.button>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Helper Text / Error Message */}
        <AnimatePresence mode="wait">
          {error ? (
            <motion.p
              key="error"
              id={`${inputId}-error`}
              className="mt-1.5 text-xs text-destructive"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {error}
            </motion.p>
          ) : helperText ? (
            <motion.p
              key="helper"
              id={`${inputId}-helper`}
              className="mt-1.5 text-xs text-muted-foreground"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {helperText}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = 'Input';

// Textarea component with similar styling
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    Omit<VariantProps<typeof inputVariants>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      variant,
      label,
      helperText,
      error,
      id,
      placeholder,
      value,
      onChange,
      onFocus,
      onBlur,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const [isFocused, setIsFocused] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState(value || '');
    const textareaId = id || generatedId;

    const hasValue = Boolean(value || internalValue);
    const hasError = Boolean(error);

    React.useEffect(() => {
      setInternalValue(value || '');
    }, [value]);

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInternalValue(e.target.value);
      onChange?.(e);
    };

    return (
      <div className="relative w-full">
        {/* Floating Label */}
        {label && (
          <motion.label
            htmlFor={textareaId}
            className={cn(
              'absolute left-3 transition-all duration-200 pointer-events-none z-10',
              'text-muted-foreground',
              {
                'text-xs -top-2 px-1 bg-background': isFocused || hasValue || placeholder,
                'text-sm top-2.5': !isFocused && !hasValue && !placeholder,
                'text-destructive': hasError,
                'text-primary-600 dark:text-primary-400': isFocused && !hasError,
              }
            )}
            initial={false}
            animate={{
              y: isFocused || hasValue || placeholder ? -10 : 0,
              scale: isFocused || hasValue || placeholder ? 0.85 : 1,
              x: isFocused || hasValue || placeholder ? -4 : 0,
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            {label}
          </motion.label>
        )}

        {/* Textarea */}
        <textarea
          className={cn(
            inputVariants({ variant, size: 'md', hasError }),
            'min-h-[80px] py-2 resize-y',
            className
          )}
          ref={ref}
          id={textareaId}
          value={internalValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={
            hasError ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined
          }
          {...props}
        />

        {/* Helper Text / Error Message */}
        <AnimatePresence mode="wait">
          {error ? (
            <motion.p
              key="error"
              id={`${textareaId}-error`}
              className="mt-1.5 text-xs text-destructive"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {error}
            </motion.p>
          ) : helperText ? (
            <motion.p
              key="helper"
              id={`${textareaId}-helper`}
              className="mt-1.5 text-xs text-muted-foreground"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {helperText}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Input, Textarea };