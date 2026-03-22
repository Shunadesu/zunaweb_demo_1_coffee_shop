import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for local storage caching
 * @param {string} key - Storage key
 * @param {*} initialValue - Initial value if key doesn't exist
 * @param {object} options - Configuration options
 * @returns {Array} - [storedValue, setValue, removeValue]
 */
export const useLocalStorage = (key, initialValue, options = {}) => {
  const {
    enableExpiration = false,
    expirationTime = 1000 * 60 * 60, // 1 hour default
  } = options;

  // Get initial value from localStorage
  const getStoredValue = useCallback(() => {
    try {
      const item = window.localStorage.getItem(key);
      
      if (!item) return initialValue;
      
      const parsed = JSON.parse(item);
      
      // Check expiration if enabled
      if (enableExpiration && parsed.expiration) {
        if (Date.now() > parsed.expiration) {
          window.localStorage.removeItem(key);
          return initialValue;
        }
        return parsed.value;
      }
      
      return parsed.value ?? parsed;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue, enableExpiration]);

  const [storedValue, setStoredValue] = useState(getStoredValue);

  // Set value
  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      let item;
      if (enableExpiration) {
        item = JSON.stringify({
          value: valueToStore,
          expiration: Date.now() + expirationTime,
        });
      } else {
        item = JSON.stringify(valueToStore);
      }
      
      window.localStorage.setItem(key, item);
      setStoredValue(valueToStore);
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue, enableExpiration, expirationTime]);

  // Remove value
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Sync with other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        setStoredValue(JSON.parse(e.newValue).value);
      } else if (e.key === key && e.newValue === null) {
        setStoredValue(initialValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};

/**
 * Simple cache hook without expiration
 */
export const useLocalCache = (key, data, ttl = 3600000) => {
  const [cachedData, setCachedData] = useLocalStorage(`cache_${key}`, data, {
    enableExpiration: true,
    expirationTime: ttl,
  });

  useEffect(() => {
    if (data !== undefined && data !== cachedData) {
      setCachedData(data);
    }
  }, [data]);

  return cachedData;
};

export default useLocalStorage;
