import { Download, Moon, Plus, Search, Sun, Upload } from 'lucide-react';
import type { ReactElement } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import type { ThemePreference } from '../../shared/types';

interface TopBarProps {
  search: string;
  theme: ThemePreference;
  onSearch: (search: string) => void;
  onNewPrompt: () => void;
  onExport: () => void;
  onImport: () => void;
  onToggleTheme: () => void;
}

export function TopBar({
  search,
  theme,
  onSearch,
  onNewPrompt,
  onExport,
  onImport,
  onToggleTheme
}: TopBarProps): ReactElement {
  return (
    <header className="flex h-16 items-center gap-3 border-b border-border/70 bg-background/80 px-4 backdrop-blur">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          value={search}
          placeholder="Search title, body, category, or tags"
          onChange={(event) => onSearch(event.target.value)}
        />
      </div>
      <Button onClick={onNewPrompt} variant="primary">
        <Plus className="h-4 w-4" />
        New Prompt
      </Button>
      <Button size="icon" title="Import JSON" onClick={onImport}>
        <Upload className="h-4 w-4" />
      </Button>
      <Button size="icon" title="Export JSON" onClick={onExport}>
        <Download className="h-4 w-4" />
      </Button>
      <Button size="icon" title="Toggle dark mode" onClick={onToggleTheme}>
        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
    </header>
  );
}
