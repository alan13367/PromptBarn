import type { TextareaHTMLAttributes } from 'react';
import type { ReactElement } from 'react';
import { cn } from '../../utils/cn';

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>): ReactElement {
  return (
    <textarea
      className={cn(
        'w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-ring',
        className
      )}
      {...props}
    />
  );
}
