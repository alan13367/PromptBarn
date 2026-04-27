import { useEffect, useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { Button } from './components/ui/Button';
import { PromptEditor } from './features/prompts/PromptEditor';
import { PromptList } from './features/prompts/PromptList';
import { useLibraryStore } from './store/libraryStore';
import type { PromptInput, ThemePreference } from '../shared/types';

const THEME_KEY = 'promptbarn.theme';

export function App(): ReactElement {
  const store = useLibraryStore();
  const [theme, setTheme] = useState<ThemePreference>(() => {
    return (localStorage.getItem(THEME_KEY) as ThemePreference | null) ?? 'dark';
  });
  const selectedPrompt = useMemo(
    () => store.prompts.find((prompt) => prompt.id === store.selectedPromptId) ?? null,
    [store.prompts, store.selectedPromptId]
  );

  useEffect(() => {
    void store.load();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const savePrompt = async (id: string | null, input: PromptInput): Promise<void> => {
    await store.savePrompt(id, input);
  };

  const createCategory = async (): Promise<void> => {
    const name = window.prompt('Category name');
    if (name) await store.createCategory(name);
  };

  const renameCategory = async (id: string, currentName: string): Promise<void> => {
    const name = window.prompt('Rename category', currentName);
    if (name && name !== currentName) await store.renameCategory(id, name);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar
        categories={store.categories}
        tags={store.tags}
        filters={store.filters}
        onFilters={(filters) => void store.setFilters(filters)}
        onNewCategory={() => void createCategory()}
        onRenameCategory={(id, currentName) => void renameCategory(id, currentName)}
        onDeleteCategory={(id) => void store.deleteCategory(id)}
        onDeleteTag={(id) => void store.deleteTag(id)}
      />
      <main className="flex min-w-0 flex-1 flex-col">
        <TopBar
          search={store.filters.search ?? ''}
          theme={theme}
          onSearch={(search) => void store.setFilters({ search })}
          onNewPrompt={() => store.selectPrompt(null)}
          onExport={() => void store.exportJson()}
          onImport={() => void store.importJson()}
          onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
        />

        {(store.error || store.notice) && (
          <div className="flex items-center justify-between border-b border-border bg-accent px-4 py-2 text-sm text-accent-foreground">
            <div className="flex items-center gap-2">
              {store.error ? <AlertCircle className="h-4 w-4" /> : null}
              {store.error ?? store.notice}
            </div>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={store.clearNotice}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="grid min-h-0 flex-1 grid-cols-[360px_1fr]">
          <PromptList
            prompts={store.prompts}
            selectedId={store.selectedPromptId}
            loading={store.loading}
            onSelect={store.selectPrompt}
          />
          <PromptEditor
            prompt={selectedPrompt}
            categories={store.categories}
            onSave={savePrompt}
            onDuplicate={(id) => store.duplicatePrompt(id)}
            onDelete={(id) => store.deletePrompt(id)}
            onFavorite={(id, favorite) => store.setFavorite(id, favorite)}
            onNotice={(notice) => useLibraryStore.setState({ notice })}
          />
        </div>
      </main>
    </div>
  );
}
