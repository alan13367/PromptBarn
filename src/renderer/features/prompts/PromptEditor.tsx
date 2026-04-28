import { useEffect, useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import { CopyPlus, Save, Star, Trash2, Edit2, X, Copy, FilePlus2, MousePointer2 } from 'lucide-react';
import type { Category, Prompt, PromptInput } from '../../../shared/types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Badge } from '../../components/ui/Badge';
import { VariablePanel } from '../variables/VariablePanel';
import { detectVariables } from '../../utils/variables';

interface PromptEditorProps {
  prompt: Prompt | null;
  categories: Category[];
  isCreating: boolean;
  hasPrompts: boolean;
  onCreate: () => void;
  onCreateCategory: () => Promise<Category | null>;
  onSave: (id: string | null, input: PromptInput) => Promise<void>;
  onDuplicate: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onFavorite: (id: string, favorite: boolean) => Promise<void>;
  onNotice: (message: string) => void;
}

const emptyPrompt = (categoryId: string): PromptInput => ({
  title: '',
  description: '',
  body: '',
  category_id: categoryId,
  favorite: false,
  tag_names: []
});

const NEW_CATEGORY_VALUE = '__new_category__';

export function PromptEditor({
  prompt,
  categories,
  isCreating,
  hasPrompts,
  onCreate,
  onCreateCategory,
  onSave,
  onDuplicate,
  onDelete,
  onFavorite,
  onNotice
}: PromptEditorProps): ReactElement {
  const defaultCategory = categories[0]?.id ?? 'uncategorized';
  const [draft, setDraft] = useState<PromptInput>(emptyPrompt(defaultCategory));
  const [isEditing, setIsEditing] = useState(isCreating || !prompt);
  const selectedId = prompt?.id ?? null;
  const variableCount = useMemo(() => detectVariables(prompt?.body ?? draft.body).length, [draft.body, prompt?.body]);

  useEffect(() => {
    setDraft(
      prompt
        ? {
            title: prompt.title,
            description: prompt.description,
            body: prompt.body,
            category_id: prompt.category_id,
            favorite: prompt.favorite,
            tag_names: prompt.tags.map((tag) => tag.name)
          }
        : emptyPrompt(defaultCategory)
    );
    setIsEditing(isCreating || !prompt);
  }, [prompt, defaultCategory, isCreating]);

  const tagText = useMemo(() => draft.tag_names.join(', '), [draft.tag_names]);

  const update = <K extends keyof PromptInput>(key: K, value: PromptInput[K]): void => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const handleCopy = () => {
    if (prompt) {
      void navigator.clipboard.writeText(prompt.body);
      onNotice('Prompt copied to clipboard');
    }
  };

  const handleSave = async () => {
    await onSave(selectedId, draft);
    setIsEditing(false);
  };

  const handleCategoryChange = async (value: string): Promise<void> => {
    if (value !== NEW_CATEGORY_VALUE) {
      update('category_id', value);
      return;
    }

    const category = await onCreateCategory();
    if (category) update('category_id', category.id);
  };

  const handleCancel = () => {
    if (!prompt) return;
    setDraft({
      title: prompt.title,
      description: prompt.description,
      body: prompt.body,
      category_id: prompt.category_id,
      favorite: prompt.favorite,
      tag_names: prompt.tags.map((tag) => tag.name)
    });
    setIsEditing(false);
  };

  if (!prompt && !isCreating) {
    return (
      <section className="panel flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex shrink-0 items-center justify-between border-b border-border/70 bg-card/80 px-5 py-4">
          <div>
            <div className="text-base font-semibold">Prompt Details</div>
            <div className="text-xs text-muted-foreground">Select a prompt to inspect, copy, or edit it.</div>
          </div>
          <Button variant="primary" onClick={onCreate}>
            <FilePlus2 className="h-4 w-4" />
            New Prompt
          </Button>
        </div>
        <div className="flex flex-1 items-center justify-center p-8 text-center">
          <div className="max-w-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
              {hasPrompts ? <MousePointer2 className="h-5 w-5" /> : <FilePlus2 className="h-5 w-5" />}
            </div>
            <div className="mt-4 text-lg font-semibold">{hasPrompts ? 'No prompt selected' : 'No prompts yet'}</div>
            <div className="mt-2 text-sm leading-6 text-muted-foreground">
              {hasPrompts
                ? 'Choose a prompt from the library to view its details, variables, and final preview.'
                : 'Create your first reusable prompt and keep it stored locally on this computer.'}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="panel flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center justify-between border-b border-border/70 bg-card/80 px-5 py-4">
        <div className="min-w-0">
          <div className="truncate text-base font-semibold">
            {!prompt ? 'New Prompt' : isEditing ? 'Edit Prompt' : prompt.title}
          </div>
          <div className="text-xs text-muted-foreground">
            {prompt ? `Updated ${formatUpdatedAt(prompt.updated_at)}` : 'Stored locally on this computer'}
          </div>
        </div>
        <div className="flex gap-2">
          {prompt && !isEditing && (
            <>
              <Button size="icon" title="Copy prompt body" aria-label="Copy prompt body" onClick={handleCopy}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                title={prompt.favorite ? 'Remove from favorites' : 'Add to favorites'}
                aria-label={prompt.favorite ? 'Remove from favorites' : 'Add to favorites'}
                onClick={() => void onFavorite(prompt.id, !prompt.favorite)}
              >
                <Star className={prompt.favorite ? 'h-4 w-4 fill-primary text-primary' : 'h-4 w-4'} />
              </Button>
              <Button size="icon" title="Edit prompt" aria-label="Edit prompt" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button size="icon" title="Duplicate prompt" aria-label="Duplicate prompt" onClick={() => void onDuplicate(prompt.id)}>
                <CopyPlus className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="destructive"
                title="Delete prompt"
                aria-label="Delete prompt"
                onClick={() => void onDelete(prompt.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
          {isEditing && (
            <>
              {prompt && (
                <Button variant="ghost" onClick={handleCancel}>
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              )}
              <Button variant="primary" onClick={() => void handleSave()}>
                <Save className="h-4 w-4" />
                Save
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {!isEditing && prompt ? (
          <div className="flex min-h-full flex-col gap-5 p-5">
            <section className="shrink-0">
              <SectionLabel>Header</SectionLabel>
              <h1 className="mt-2 text-2xl font-bold text-foreground">{prompt.title}</h1>
              <div className="mt-1 text-sm text-muted-foreground">Updated {formatUpdatedAt(prompt.updated_at)}</div>
            </section>

            <section className="shrink-0">
              <SectionLabel>Description</SectionLabel>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {prompt.description || 'No description provided.'}
              </p>
            </section>

            <section className="shrink-0">
              <SectionLabel>Category & Tags</SectionLabel>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge className="border-primary/20 bg-primary/10 text-primary">
                  {categories.find((c) => c.id === prompt.category_id)?.name}
                </Badge>
                {prompt.tags.map((tag) => (
                  <Badge key={tag.id}>{tag.name}</Badge>
                ))}
                {prompt.tags.length === 0 ? <span className="text-sm text-muted-foreground">No tags</span> : null}
              </div>
            </section>

            <section className="flex min-h-[280px] flex-1 flex-col">
              <div className="mb-2 flex items-center justify-between gap-3">
                <SectionLabel>Prompt Body</SectionLabel>
                {variableCount > 0 ? (
                  <span className="text-xs text-muted-foreground">
                    {variableCount === 1 ? '1 variable detected' : `${variableCount} variables detected`}
                  </span>
                ) : null}
              </div>
              <div className="flex-1 overflow-auto rounded-lg border border-border bg-background/55 p-5 shadow-inner">
                <pre className="break-words whitespace-pre-wrap font-mono text-sm leading-7 text-foreground">{prompt.body}</pre>
              </div>
            </section>

            {variableCount > 0 ? (
              <section className="shrink-0">
                <VariablePanel body={prompt.body} onNotice={onNotice} />
              </section>
            ) : null}
          </div>
        ) : (
          <>
            <div className="grid shrink-0 grid-cols-2 gap-4 p-5 pb-4">
              <label className="col-span-2 text-xs font-medium text-muted-foreground">
                Title
                <Input className="mt-1" value={draft.title} onChange={(event) => update('title', event.target.value)} />
              </label>
              <label className="text-xs font-medium text-muted-foreground">
                Category
                <select
                  className="mt-1 h-10 w-full rounded-md border border-input bg-background/80 px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  value={draft.category_id}
                  onChange={(event) => void handleCategoryChange(event.target.value)}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                  <option value={NEW_CATEGORY_VALUE}>New...</option>
                </select>
              </label>
              <label className="text-xs font-medium text-muted-foreground">
                Tags
                <Input
                  className="mt-1"
                  value={tagText}
                  placeholder="writing, marketing, reusable"
                  onChange={(event) =>
                    update(
                      'tag_names',
                      event.target.value
                        .split(',')
                        .map((tag) => tag.trim())
                        .filter(Boolean)
                    )
                  }
                />
              </label>
              <label className="col-span-2 text-xs font-medium text-muted-foreground">
                Description
                <Input
                  className="mt-1"
                  value={draft.description}
                  onChange={(event) => update('description', event.target.value)}
                />
              </label>
            </div>
            <div className="flex min-h-[300px] flex-1 flex-col px-5 pb-5">
              <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Prompt Body</div>
              <Textarea
                value={draft.body}
                onChange={(event) => update('body', event.target.value)}
                placeholder="Write a reusable prompt. Variables like {{topic}} are detected automatically."
                className="h-full min-h-[300px] flex-1 font-mono text-sm leading-6"
              />
            </div>
            <div className="shrink-0 px-5 pb-5">
              <VariablePanel body={draft.body} onNotice={onNotice} />
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function SectionLabel({ children }: { children: string }): ReactElement {
  return <div className="text-xs font-semibold uppercase text-muted-foreground">{children}</div>;
}

function formatUpdatedAt(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(value));
}
