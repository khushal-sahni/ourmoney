export type DataMode = 'mock' | 'live';

export const DATA_MODE_STORAGE_KEY = 'ourmoney-data-mode';

export function readStoredDataMode(): DataMode | undefined {
  try {
    const raw = localStorage.getItem(DATA_MODE_STORAGE_KEY);
    if (raw === 'mock' || raw === 'live') return raw;
  } catch {
    // Ignore storage access errors (private mode, etc.).
  }
  return undefined;
}

export function resolveInitialDataMode(): DataMode {
  return readStoredDataMode() ?? 'mock';
}

export function applyDataMode(mode: DataMode): void {
  document.documentElement.dataset.dataMode = mode;
}

export function persistDataMode(mode: DataMode): void {
  try {
    localStorage.setItem(DATA_MODE_STORAGE_KEY, mode);
  } catch {
    // Ignore storage access errors.
  }
}
