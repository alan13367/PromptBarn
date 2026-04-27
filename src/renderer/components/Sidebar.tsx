import { Folder, Heart, Inbox, Pencil, Tag as TagIcon, Trash2 } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactElement } from 'react';
import type { Category, PromptFilters, Tag } from '../../shared/types';
import { Button } from './ui/Button';
import { cn } from '../utils/cn';
import appIcon from '../assets/PromptBarn.png';

interface SidebarProps {
  categories: Category[];
  tags: Tag[];
  filters: PromptFilters;
  onFilters: (filters: Partial<PromptFilters>) => void;
  onNewCategory: () => void;
  onRenameCategory: (id: string, currentName: string) => void;
  onDeleteCategory: (id: string) => void;
  onDeleteTag: (id: string) => void;
}

export function Sidebar({
  categories,
  tags,
  filters,
  onFilters,
  onNewCategory,
  onRenameCategory,
  onDeleteCategory,
  onDeleteTag
}: SidebarProps): ReactElement {
  const activeAll = !filters.favoritesOnly && !filters.categoryId && (!filters.tagIds || filters.tagIds.length === 0);
  const activeTags = filters.tagIds ?? [];

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border/70 bg-card/90 backdrop-blur">
      <div className="border-b border-border/70 px-4 py-4">
        <div className="flex items-center gap-3">
          <img src={appIcon} alt="" className="h-10 w-10 rounded-lg" />
          <div className="min-w-0">
            <div className="text-lg font-bold tracking-normal">PromptBarn</div>
            <div className="text-xs text-muted-foreground">Offline prompt library</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-3">
        <NavButton active={activeAll} onClick={() => onFilters({ favoritesOnly: false, categoryId: null, tagIds: [] })}>
          <Inbox className="h-4 w-4" />
          All prompts
        </NavButton>
        <NavButton
          active={Boolean(filters.favoritesOnly)}
          onClick={() => onFilters({ favoritesOnly: true, categoryId: null, tagIds: [] })}
        >
          <Heart className="h-4 w-4" />
          Favorites
        </NavButton>

        <div className="mt-6 flex items-center justify-between px-2 text-xs font-semibold uppercase text-muted-foreground">
          Categories
          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={onNewCategory}>
            New
          </Button>
        </div>
        <div className="mt-2 space-y-1">
          {categories.map((category) => (
            <div key={category.id} className="group flex items-center gap-1">
              <NavButton
                className="flex-1"
                active={filters.categoryId === category.id}
                onClick={() => onFilters({ categoryId: category.id, favoritesOnly: false, tagIds: [] })}
              >
                <Folder className="h-4 w-4" />
                <span className="min-w-0 flex-1 truncate">{category.name}</span>
                <span className="text-xs text-muted-foreground">{category.prompt_count}</span>
              </NavButton>
              {category.id !== 'uncategorized' ? (
                <>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100"
                    onClick={() => onRenameCategory(category.id, category.name)}
                    title="Rename category"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100"
                    onClick={() => onDeleteCategory(category.id)}
                    title="Delete category"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              ) : null}
            </div>
          ))}
        </div>

        <div className="mt-6 px-2 text-xs font-semibold uppercase text-muted-foreground">Tags</div>
        <div className="mt-2 space-y-1">
          {tags.map((tag) => (
            <div key={tag.id} className="group flex items-center gap-1">
              <NavButton
                className="flex-1"
                active={activeTags.includes(tag.id)}
                onClick={() => {
                  const next = activeTags.includes(tag.id)
                    ? activeTags.filter((tagId) => tagId !== tag.id)
                    : [...activeTags, tag.id];
                  onFilters({ tagIds: next, favoritesOnly: false, categoryId: null });
                }}
              >
                <TagIcon className="h-4 w-4" />
                <span className="min-w-0 flex-1 truncate">{tag.name}</span>
                <span className="text-xs text-muted-foreground">{tag.prompt_count}</span>
              </NavButton>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 opacity-0 group-hover:opacity-100"
                onClick={() => onDeleteTag(tag.id)}
                title="Delete tag"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </nav>
    </aside>
  );
}

function NavButton({
  className,
  active,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active: boolean }): ReactElement {
  return (
    <button
      className={cn(
        'flex h-9 w-full items-center gap-2 rounded-md px-2 text-left text-sm transition hover:bg-muted/80',
        active && 'bg-accent text-accent-foreground shadow-sm shadow-cyan-950/20',
        className
      )}
      {...props}
    />
  );
}
