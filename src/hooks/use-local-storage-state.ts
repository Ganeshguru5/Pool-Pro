'use client';

import { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react';

type SetValue<T> = Dispatch<SetStateAction<T>>;

function useLocalStorageState<T>(key: string, defaultValue: T): [T, SetValue<T>] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return defaultValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setState(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
    }
  }, [key]);

  const setLocalStorageState = useCallback<SetValue<T>>(
    (newValue) => {
      if (typeof window !== 'undefined') {
        try {
          const valueToStore = newValue instanceof Function ? newValue(state) : newValue;
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          setState(valueToStore);
        } catch (error) {
          console.warn(`Error setting localStorage key “${key}”:`, error);
        }
      }
    },
    [key, state]
  );

  return [state, setLocalStorageState];
}

export default useLocalStorageState;
