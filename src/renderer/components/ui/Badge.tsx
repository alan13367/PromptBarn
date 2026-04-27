import type { HTMLAttributes } from 'react';
import type { ReactElement } from 'react';
import { cn } from '../../utils/cn';

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>): ReactElement {
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center rounded-md border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}
