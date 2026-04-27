import { useEffect, useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import { CopyPlus, Save, Star, Trash2, Edit2, X, Copy } from 'lucide-react';
import type { Category, Prompt, PromptInput } from '../../../shared/types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Badge } from '../../components/ui/Badge';
import { VariablePanel } from '../variables/VariablePanel';

interface PromptEditorProps {
  prompt: Prompt | null;
  categories: Category[];
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

export function PromptEditor({
  prompt,
  categories,
  onSave,
  onDuplicate,
  onDelete,
  onFavorite,
  onNotice
}: PromptEditorProps): ReactElement {
  const defaultCategory = categories[0]?.id ?? 'uncategorized';
  const [draft, setDraft] = useState<PromptInput>(emptyPrompt(defaultCategory));
  const [isEditing, setIsEditing] = useState(!prompt);
  const selectedId = prompt?.id ?? null;

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
    setIsEditing(!prompt);
  }, [prompt, defaultCategory]);

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

  return (
    <section className="panel flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center justify-between border-b border-border/70 bg-card/80 px-5 py-4">
        <div className="min-w-0">
          <div className="truncate text-base font-semibold">
            {!prompt ? 'New Prompt' : isEditing ? 'Edit Prompt' : prompt.title}
          </div>
          <div className="text-xs text-muted-foreground">
            {prompt ? `Updated ${new Date(prompt.updated_at).toLocaleString()}` : 'Stored locally on this computer'}
          </div>
        </div>
        <div className="flex gap-2">
          {prompt && !isEditing && (
            <>
              <Button size="icon" title="Copy text" onClick={handleCopy}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button size="icon" title="Favorite" onClick={() => void onFavorite(prompt.id, !prompt.favorite)}>
                <Star className={prompt.favorite ? 'h-4 w-4 fill-primary text-primary' : 'h-4 w-4'} />
              </Button>
              <Button size="icon" title="Edit" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button size="icon" title="Duplicate" onClick={() => void onDuplicate(prompt.id)}>
                <CopyPlus className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="destructive" title="Delete" onClick={() => void onDelete(prompt.id)}>
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
          <div className="flex flex-1 flex-col p-5">
            <div className="mb-6 shrink-0">
              <h1 className="text-xl font-bold text-foreground">{prompt.title}</h1>
              {prompt.description && <p className="mt-2 text-sm text-muted-foreground">{prompt.description}</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge className="border-primary/20 bg-primary/10 text-primary">
                  {categories.find((c) => c.id === prompt.category_id)?.name}
                </Badge>
                {prompt.tags.map((tag) => (
                  <Badge key={tag.id}>{tag.name}</Badge>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <pre className="break-words whitespace-pre-wrap font-mono text-sm leading-6 text-foreground">
                {prompt.body}
              </pre>
            </div>
            {prompt.body.includes('{{') && (
              <div className="mt-6 shrink-0">
                <VariablePanel body={prompt.body} onNotice={onNotice} />
              </div>
            )}
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
                  onChange={(event) => update('category_id', event.target.value)}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
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
            <div className="flex min-h-[220px] flex-1 flex-col px-5 pb-5">
              <Textarea
                value={draft.body}
                onChange={(event) => update('body', event.target.value)}
                placeholder="Write a reusable prompt. Variables like {{topic}} are detected automatically."
                className="h-full min-h-[220px] flex-1 font-mono text-sm leading-6"
              />
            </div>
            <div className="shrink-0">
              <VariablePanel body={draft.body} onNotice={onNotice} />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
