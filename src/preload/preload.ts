import { contextBridge, ipcRenderer } from 'electron';
import { channels } from '../main/ipc/channels';
import type { PromptBarnApi } from './types';

const api: PromptBarnApi = {
  listLibrary: (filters) => ipcRenderer.invoke(channels.libraryList, filters ?? {}),
  createPrompt: (input) => ipcRenderer.invoke(channels.promptCreate, input),
  updatePrompt: (id, input) => ipcRenderer.invoke(channels.promptUpdate, { id, input }),
  duplicatePrompt: (id) => ipcRenderer.invoke(channels.promptDuplicate, { id }),
  deletePrompt: (id) => ipcRenderer.invoke(channels.promptDelete, { id }),
  setPromptFavorite: (id, favorite) => ipcRenderer.invoke(channels.promptFavorite, { id, favorite }),
  createCategory: (name) => ipcRenderer.invoke(channels.categoryCreate, { name }),
  renameCategory: (id, name) => ipcRenderer.invoke(channels.categoryRename, { id, name }),
  deleteCategory: (id) => ipcRenderer.invoke(channels.categoryDelete, { id }),
  deleteTag: (id) => ipcRenderer.invoke(channels.tagDelete, { id }),
  exportJson: () => ipcRenderer.invoke(channels.exportJson),
  importJson: () => ipcRenderer.invoke(channels.importJson)
};

contextBridge.exposeInMainWorld('promptBarn', api);
