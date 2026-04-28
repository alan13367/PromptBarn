import { Inbox, SearchX, Star } from 'lucide-react';
import type { ReactElement } from 'react';
import type { Prompt } from '../../../shared/types';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../utils/cn';

interface PromptListProps {
  prompts: Prompt[];
  selectedId: string | null;
  loading: boolean;
  emptyKind: 'library' | 'search';
  search: string;
  onSelect: (id: string) => void;
}

export function PromptList({ prompts, selectedId, loading, emptyKind, search, onSelect }: PromptListProps): ReactElement {
  if (loading) {
    return (
      <section className="panel flex min-h-0 flex-col overflow-hidden">
        <div className="border-b border-border/70 px-4 py-4">
          <div className="h-4 w-28 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-3 w-40 animate-pulse rounded bg-muted/70" />
        </div>
        <div className="space-y-3 p-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="rounded-lg border border-border/70 bg-card/70 p-4">
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              <div className="mt-3 h-3 w-full animate-pulse rounded bg-muted/70" />
              <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-muted/70" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (prompts.length === 0) {
    const isSearchEmpty = emptyKind === 'search';

    return (
      <section className="panel flex min-h-0 flex-col overflow-hidden">
        <PromptListHeader count={0} />
        <div className="flex flex-1 items-center justify-center p-8 text-center">
          <div className="max-w-72">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
              {isSearchEmpty ? <SearchX className="h-5 w-5" /> : <Inbox className="h-5 w-5" />}
            </div>
            <div className="mt-4 text-sm font-semibold">
              {isSearchEmpty ? 'No search results' : 'No prompts yet'}
            </div>
            <div className="mt-2 text-sm leading-6 text-muted-foreground">
              {isSearchEmpty
                ? `Nothing matched "${search.trim()}". Try a shorter search or clear filters.`
                : 'Create your first prompt to start building a local reusable library.'}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="panel flex min-h-0 flex-col overflow-hidden">
      <PromptListHeader count={prompts.length} />
      <div className="flex flex-col gap-2 overflow-y-auto p-3">
        {prompts.map((prompt) => (
          <button
            key={prompt.id}
            className={cn(
              'rounded-lg border p-3 text-left transition hover:border-primary/60 hover:bg-muted/70',
              selectedId === prompt.id
                ? 'border-primary bg-accent shadow-lg shadow-cyan-950/15'
                : 'border-border/70 bg-card/70'
            )}
            onClick={() => onSelect(prompt.id)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{prompt.title}</div>
                <div className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
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
              {prompt.tags.length > 3 ? <Badge>+{prompt.tags.length - 3}</Badge> : null}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function PromptListHeader({ count }: { count: number }): ReactElement {
  return (
    <div className="border-b border-border/70 px-4 py-4">
      <div className="text-sm font-semibold">Library</div>
      <div className="mt-1 text-xs text-muted-foreground">
        {count === 1 ? '1 local prompt' : `${count} local prompts`}
      </div>
    </div>
  );
}
