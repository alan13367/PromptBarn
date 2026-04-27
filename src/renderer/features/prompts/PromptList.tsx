import { Star } from 'lucide-react';
import type { ReactElement } from 'react';
import type { Prompt } from '../../../shared/types';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../utils/cn';

interface PromptListProps {
  prompts: Prompt[];
  selectedId: string | null;
  loading: boolean;
  onSelect: (id: string) => void;
}

export function PromptList({ prompts, selectedId, loading, onSelect }: PromptListProps): ReactElement {
  if (loading) {
    return <div className="p-4 text-sm text-muted-foreground">Loading library...</div>;
  }

  if (prompts.length === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        No prompts match this view. Create one or loosen the filters.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 overflow-y-auto p-3">
      {prompts.map((prompt) => (
        <button
          key={prompt.id}
          className={cn(
            'rounded-md border p-3 text-left transition hover:bg-muted',
            selectedId === prompt.id ? 'border-primary bg-accent' : 'border-border bg-card'
          )}
          onClick={() => onSelect(prompt.id)}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{prompt.title}</div>
              <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {prompt.description || prompt.body}
              </div>
            </div>
            {prompt.favorite ? <Star className="h-4 w-4 shrink-0 fill-primary text-primary" /> : null}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge>{prompt.category_name}</Badge>
            {prompt.tags.slice(0, 3).map((tag) => (
              <Badge key={tag.id}>{tag.name}</Badge>
            ))}
          </div>
        </button>
      ))}
    </div>
  );
}
