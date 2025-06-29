// ABOUTME: Versatile card component with glassmorphism and hover effects
// Supports header, body, footer sections with beautiful animations

import { cva, type VariantProps } from 'class-variance-authority';
import { motion, type HTMLMotionProps } from 'framer-motion';
import * as React from 'react';

import { cn } from '@/lib/utils/cn';

const cardVariants = cva(
  'rounded-xl border backdrop-blur-sm transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'bg-card border-border',
        glass: 'bg-white/5 border-white/10 backdrop-blur-md',
        elevated: 'bg-card border-transparent shadow-lg hover:shadow-xl',
        outline: 'bg-transparent border-border',
      },
      padding: {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
      interactive: {
        true: 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      interactive: false,
    },
  }
);

export interface CardProps
  extends HTMLMotionProps<'div'>,
    VariantProps<typeof cardVariants> {
  onClick?: () => void;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, interactive, onClick, children, ...props }, ref) => {
    const isClickable = Boolean(onClick) || interactive;

    return (
      <motion.div
        ref={ref}
        className={cn(cardVariants({ variant, padding, interactive: isClickable, className }))}
        onClick={onClick}
        whileHover={
          isClickable
            ? {
                y: -4,
                transition: { type: 'spring', stiffness: 400, damping: 25 },
              }
            : undefined
        }
        whileTap={
          isClickable
            ? {
                scale: 0.98,
                transition: { type: 'spring', stiffness: 400, damping: 25 },
              }
            : undefined
        }
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

// Card Header Component
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  separated?: boolean;
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, separated = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col space-y-1.5',
          separated && 'pb-6 border-b border-border',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

// Card Title Component
const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn('text-xl font-semibold leading-none tracking-tight', className)}
        {...props}
      >
        {children}
      </h3>
    );
  }
);

CardTitle.displayName = 'CardTitle';

// Card Description Component
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  return (
    <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props}>
      {children}
    </p>
  );
});

CardDescription.displayName = 'CardDescription';

// Card Content Component
const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('pt-6', className)} {...props}>
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

// Card Footer Component
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  separated?: boolean;
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, separated = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center pt-6',
          separated && 'border-t border-border',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

// Animated Card Stack Component for showcasing multiple cards
export interface CardStackProps extends React.HTMLAttributes<HTMLDivElement> {
  cards: React.ReactNode[];
  offset?: number;
}

const CardStack = React.forwardRef<HTMLDivElement, CardStackProps>(
  ({ className, cards, offset = 8, ...props }, ref) => {
    const [activeIndex, setActiveIndex] = React.useState(0);

    return (
      <div ref={ref} className={cn('relative', className)} {...props}>
        {cards.map((card, index) => {
          const isActive = index === activeIndex;
          const position = index - activeIndex;

          return (
            <motion.div
              key={index}
              className="absolute inset-0"
              initial={false}
              animate={{
                scale: 1 - Math.abs(position) * 0.04,
                y: position * offset,
                zIndex: cards.length - Math.abs(position),
                opacity: Math.abs(position) > 2 ? 0 : 1,
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
              }}
              onClick={() => setActiveIndex(index)}
              style={{ cursor: isActive ? 'default' : 'pointer' }}
            >
              {card}
            </motion.div>
          );
        })}
      </div>
    );
  }
);

CardStack.displayName = 'CardStack';

// Feature Card Component with icon
export interface FeatureCardProps extends CardProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
}

const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ icon, title, description, children, ...props }, ref) => {
    return (
      <Card ref={ref} {...props}>
        <CardHeader>
          <div className="flex items-center gap-4">
            {icon && (
              <motion.div
                className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                {icon}
              </motion.div>
            )}
            <div className="flex-1">
              <CardTitle>{title}</CardTitle>
              {description && <CardDescription>{description}</CardDescription>}
            </div>
          </div>
        </CardHeader>
        {children && <CardContent>{children}</CardContent>}
      </Card>
    );
  }
);

FeatureCard.displayName = 'FeatureCard';

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardStack,
  FeatureCard,
};