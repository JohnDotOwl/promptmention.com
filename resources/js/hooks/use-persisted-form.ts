import { useForm as useInertiaForm, InertiaFormProps } from '@inertiajs/react';
import { useCallback, useEffect, useRef } from 'react';

interface PersistedFormOptions {
  /**
   * Unique key for storing form data
   */
  key: string;
  /**
   * Auto-save interval in milliseconds
   * @default 2000
   */
  autoSaveInterval?: number;
  /**
   * Whether to clear saved data on successful submission
   * @default true
   */
  clearOnSuccess?: boolean;
  /**
   * Whether to save data on page unload
   * @default true
   */
  saveOnUnload?: boolean;
  /**
   * Maximum age for saved data in minutes
   * @default 60
   */
  maxAge?: number;
  /**
   * Fields to exclude from persistence
   */
  excludeFields?: string[];
  /**
   * Custom validation before saving
   */
  validateBeforeSave?: (data: Record<string, unknown>) => boolean;
  /**
   * Callback when data is loaded from storage
   */
  onDataLoaded?: (data: Record<string, unknown>) => void;
  /**
   * Callback when data is saved to storage
   */
  onDataSaved?: (data: Record<string, unknown>) => void;
}

interface SavedFormData {
  data: Record<string, unknown>;
  timestamp: number;
  url: string;
}

/**
 * Generate storage key for form data
 */
function getStorageKey(key: string, url?: string): string {
  const currentUrl = url || window.location.pathname + window.location.search;
  return `persisted_form_${key}_${btoa(currentUrl).replace(/[/+=]/g, '')}`;
}

/**
 * Load form data from localStorage
 */
function loadFormData(key: string, maxAge: number, url?: string): Record<string, unknown> | null {
  try {
    const storageKey = getStorageKey(key, url);
    const stored = localStorage.getItem(storageKey);
    
    if (!stored) return null;
    
    const parsed: SavedFormData = JSON.parse(stored);
    const now = Date.now();
    
    // Check if data is too old
    if (parsed.timestamp && now - parsed.timestamp > maxAge * 60 * 1000) {
      localStorage.removeItem(storageKey);
      return null;
    }
    
    return parsed.data;
  } catch (error) {
    console.warn('Failed to load persisted form data:', error);
    return null;
  }
}

/**
 * Save form data to localStorage
 */
function saveFormData(key: string, data: Record<string, unknown>, excludeFields: string[] = [], url?: string): void {
  try {
    const storageKey = getStorageKey(key, url);
    
    // Filter out excluded fields
    const filteredData = { ...data };
    excludeFields.forEach(field => {
      delete filteredData[field];
    });
    
    const saveData: SavedFormData = {
      data: filteredData,
      timestamp: Date.now(),
      url: url || window.location.pathname + window.location.search
    };
    
    localStorage.setItem(storageKey, JSON.stringify(saveData));
  } catch (error) {
    console.warn('Failed to save persisted form data:', error);
  }
}

/**
 * Clear saved form data
 */
function clearFormData(key: string, url?: string): void {
  try {
    const storageKey = getStorageKey(key, url);
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.warn('Failed to clear persisted form data:', error);
  }
}

/**
 * Hook that extends Inertia's useForm with persistence capabilities
 */
export function usePersistedForm<TForm extends Record<string, unknown>>(
  initialData: TForm | (() => TForm),
  options: PersistedFormOptions
): ReturnType<typeof useInertiaForm<TForm>> & {
  clearSavedData: () => void;
  hasSavedData: boolean;
  lastSavedAt: Date | null;
} {
  const {
    key,
    autoSaveInterval = 2000,
    clearOnSuccess = true,
    saveOnUnload = true,
    maxAge = 60,
    excludeFields = [],
    validateBeforeSave,
    onDataLoaded,
    onDataSaved
  } = options;

  // Load initial data (either from props or saved data)
  const getInitialData = useCallback(() => {
    const baseData = typeof initialData === 'function' ? initialData() : initialData;
    const savedData = loadFormData(key, maxAge);
    
    if (savedData) {
      onDataLoaded?.(savedData);
      return { ...baseData, ...savedData };
    }
    
    return baseData;
  }, [initialData, key, maxAge, onDataLoaded]);

  // Initialize form with potentially restored data
  const form = useInertiaForm<TForm>(getInitialData());
  
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<Date | null>(null);
  const hasSavedDataRef = useRef<boolean>(false);

  // Check if we have saved data
  useEffect(() => {
    const savedData = loadFormData(key, maxAge);
    hasSavedDataRef.current = !!savedData;
  }, [key, maxAge]);

  // Auto-save functionality
  const saveData = useCallback(() => {
    if (validateBeforeSave && !validateBeforeSave(form.data)) {
      return;
    }
    
    saveFormData(key, form.data, excludeFields);
    lastSavedRef.current = new Date();
    onDataSaved?.(form.data);
  }, [form.data, key, excludeFields, validateBeforeSave, onDataSaved]);

  // Debounced auto-save
  const debouncedSave = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(saveData, autoSaveInterval);
  }, [saveData, autoSaveInterval]);

  // Save data when form data changes
  useEffect(() => {
    debouncedSave();
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [form.data, debouncedSave]);

  // Save on page unload
  useEffect(() => {
    if (!saveOnUnload) return;
    
    const handleBeforeUnload = () => {
      saveData();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveOnUnload, saveData]);

  // Clear saved data on successful submission
  useEffect(() => {
    if (clearOnSuccess && form.recentlySuccessful) {
      clearFormData(key);
      hasSavedDataRef.current = false;
      lastSavedRef.current = null;
    }
  }, [form.recentlySuccessful, clearOnSuccess, key]);

  // Manual clear function
  const clearSavedData = useCallback(() => {
    clearFormData(key);
    hasSavedDataRef.current = false;
    lastSavedRef.current = null;
    
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
  }, [key]);

  return {
    ...form,
    clearSavedData,
    hasSavedData: hasSavedDataRef.current,
    lastSavedAt: lastSavedRef.current
  };
}

/**
 * Hook for form draft management with multiple drafts
 */
export function useFormDrafts<TForm extends Record<string, any>>(
  baseKey: string,
  maxDrafts = 5
) {
  const getDraftKey = useCallback((draftId: string) => `${baseKey}_draft_${draftId}`, [baseKey]);
  
  const saveDraft = useCallback((draftId: string, data: TForm, name?: string) => {
    try {
      const draftKey = getDraftKey(draftId);
      const draft = {
        id: draftId,
        name: name || `Draft ${new Date().toLocaleString()}`,
        data,
        timestamp: Date.now()
      };
      
      localStorage.setItem(draftKey, JSON.stringify(draft));
      
      // Update drafts index
      const indexKey = `${baseKey}_drafts_index`;
      const existingIndex = JSON.parse(localStorage.getItem(indexKey) || '[]');
      const newIndex = [draftId, ...existingIndex.filter((id: string) => id !== draftId)].slice(0, maxDrafts);
      localStorage.setItem(indexKey, JSON.stringify(newIndex));
      
    } catch (error) {
      console.warn('Failed to save draft:', error);
    }
  }, [getDraftKey, baseKey, maxDrafts]);
  
  const loadDraft = useCallback((draftId: string): TForm | null => {
    try {
      const draftKey = getDraftKey(draftId);
      const stored = localStorage.getItem(draftKey);
      if (!stored) return null;
      
      const draft = JSON.parse(stored);
      return draft.data;
    } catch (error) {
      console.warn('Failed to load draft:', error);
      return null;
    }
  }, [getDraftKey]);
  
  const listDrafts = useCallback(() => {
    try {
      const indexKey = `${baseKey}_drafts_index`;
      const draftIds = JSON.parse(localStorage.getItem(indexKey) || '[]');
      
      return draftIds.map((id: string) => {
        const draftKey = getDraftKey(id);
        const stored = localStorage.getItem(draftKey);
        if (!stored) return null;
        
        const draft = JSON.parse(stored);
        return {
          id: draft.id,
          name: draft.name,
          timestamp: draft.timestamp
        };
      }).filter(Boolean);
    } catch (error) {
      console.warn('Failed to list drafts:', error);
      return [];
    }
  }, [baseKey, getDraftKey]);
  
  const deleteDraft = useCallback((draftId: string) => {
    try {
      const draftKey = getDraftKey(draftId);
      localStorage.removeItem(draftKey);
      
      // Update index
      const indexKey = `${baseKey}_drafts_index`;
      const existingIndex = JSON.parse(localStorage.getItem(indexKey) || '[]');
      const newIndex = existingIndex.filter((id: string) => id !== draftId);
      localStorage.setItem(indexKey, JSON.stringify(newIndex));
    } catch (error) {
      console.warn('Failed to delete draft:', error);
    }
  }, [getDraftKey, baseKey]);
  
  return {
    saveDraft,
    loadDraft,
    listDrafts,
    deleteDraft
  };
}