// ABOUTME: Premium button component with multiple variants and animations
// Features loading states, icon support, and beautiful micro-interactions

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary:
          'bg-primary-600 text-white hover:bg-primary-700 shadow-md hover:shadow-lg dark:bg-primary-500 dark:hover:bg-primary-600',
        secondary:
          'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700',
        outline:
          'border border-neutral-300 bg-transparent hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-100',
        ghost:
          'hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md hover:shadow-lg',
        link: 'text-primary-600 underline-offset-4 hover:underline dark:text-primary-400',
        glass:
          'backdrop-blur-md bg-white/10 border border-white/20 text-white hover:bg-white/20 shadow-glass hover:shadow-glass-lg dark:bg-black/10 dark:border-white/10 dark:hover:bg-black/20',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 py-2',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends Omit<HTMLMotionProps<'button'>, 'size'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : motion.button;
    const isDisabled = disabled || loading;

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={isDisabled}
        whileHover={!isDisabled ? { scale: 1.02 } : undefined}
        whileTap={!isDisabled ? { scale: 0.98 } : undefined}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 25,
        }}
        {...props}
      >
        {loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <Loader2 className="h-4 w-4 animate-spin" />
          </motion.div>
        )}
        {!loading && leftIcon && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            {leftIcon}
          </motion.span>
        )}
        {children}
        {!loading && rightIcon && (
          <motion.span
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            {rightIcon}
          </motion.span>
        )}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

// Additional button group component for grouped actions
export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'horizontal' | 'vertical';
}

export const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, direction = 'horizontal', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          {
            'flex-row -space-x-px': direction === 'horizontal',
            'flex-col -space-y-px': direction === 'vertical',
          },
          '[&>*:first-child]:rounded-r-none [&>*:last-child]:rounded-l-none [&>*:not(:first-child):not(:last-child)]:rounded-none',
          direction === 'vertical' &&
            '[&>*:first-child]:rounded-b-none [&>*:first-child]:rounded-r-lg [&>*:last-child]:rounded-t-none [&>*:last-child]:rounded-l-lg [&>*:not(:first-child):not(:last-child)]:rounded-none',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ButtonGroup.displayName = 'ButtonGroup';

export { Button, buttonVariants };