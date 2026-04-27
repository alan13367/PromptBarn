import type { ButtonHTMLAttributes } from 'react';
import type { ReactElement } from 'react';
import { cn } from '../../utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md' | 'icon';
}

export function Button({ className, variant = 'secondary', size = 'md', ...props }: ButtonProps): ReactElement {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md border text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' && 'border-primary bg-primary text-primary-foreground hover:opacity-90',
        variant === 'secondary' && 'border-border bg-card text-foreground hover:bg-muted',
        variant === 'ghost' && 'border-transparent bg-transparent hover:bg-muted',
        variant === 'destructive' && 'border-destructive bg-destructive text-destructive-foreground hover:opacity-90',
        size === 'sm' && 'h-8 px-3',
        size === 'md' && 'h-10 px-4',
        size === 'icon' && 'h-9 w-9 p-0',
        className
      )}
      {...props}
    />
  );
}
