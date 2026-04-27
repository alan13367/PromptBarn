import { useState, useEffect } from 'react';
import type { ReactElement } from 'react';
import { Button } from './Button';
import { Input } from './Input';

interface InputDialogProps {
  isOpen: boolean;
  title: string;
  defaultValue?: string;
  onClose: (value: string | null) => void;
}

export function InputDialog({ isOpen, title, defaultValue = '', onClose }: InputDialogProps): ReactElement | null {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
    }
  }, [isOpen, defaultValue]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose(value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <h2 className="mb-4 text-lg font-semibold text-foreground">{title}</h2>
        <form onSubmit={handleSubmit}>
          <Input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="mb-6"
            placeholder="Type here..."
          />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => onClose(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Confirm
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
