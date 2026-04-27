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
import appIcon from './assets/PromptBarn.png';
import { InputDialog } from './components/ui/InputDialog';

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

  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    title: string;
    defaultValue: string;
    onClose: (value: string | null) => void;
  }>({
    isOpen: false,
    title: '',
    defaultValue: '',
    onClose: () => {}
  });

  const promptUser = (title: string, defaultValue: string = ''): Promise<string | null> => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        title,
        defaultValue,
        onClose: (value) => {
          setDialogState((prev) => ({ ...prev, isOpen: false }));
          resolve(value);
        }
      });
    });
  };

  const createCategory = async (): Promise<void> => {
    const name = await promptUser('Category name');
    if (name) await store.createCategory(name);
  };

  const renameCategory = async (id: string, currentName: string): Promise<void> => {
    const name = await promptUser('Rename category', currentName);
    if (name && name !== currentName) await store.renameCategory(id, name);
  };

  if (store.loading && store.prompts.length === 0 && store.categories.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center overflow-hidden bg-background text-foreground">
        <div className="flex flex-col items-center gap-5">
          <img src={appIcon} alt="" className="h-24 w-24 rounded-[22px] shadow-2xl shadow-cyan-950/40" />
          <div className="text-center">
            <div className="text-xl font-bold">PromptBarn</div>
            <div className="mt-1 h-1 w-40 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground app-shell">
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

        <div className="grid min-h-0 flex-1 grid-cols-[340px_minmax(0,1fr)] gap-4 p-4">
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
      <InputDialog {...dialogState} />
    </div>
  );
}
