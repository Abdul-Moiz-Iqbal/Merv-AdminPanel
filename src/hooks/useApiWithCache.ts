import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

interface ApiOptions {
  immediate?: boolean; // Fetch immediately on mount
  dependencies?: any[]; // Re-fetch when dependencies change
}

class ApiCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl = this.defaultTTL): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

const apiCache = new ApiCache();

export function useApiWithCache<T>(
  url: string,
  options: ApiOptions & { cacheKey?: string; cacheTTL?: number } = {}
): ApiState<T> & { invalidateCache: () => void } {
  const cacheKey = options.cacheKey || url;
  const [data, setData] = useState<T | null>(() => apiCache.get<T>(cacheKey));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController>();

  const fetchData = useCallback(async (useCache = true) => {
    // Check cache first
    if (useCache) {
      const cachedData = apiCache.get<T>(cacheKey);
      if (cachedData) {
        setData(cachedData);
        return;
      }
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      
      // Cache the result
      apiCache.set(cacheKey, result, options.cacheTTL);
      
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Request was cancelled, don't update state
      }
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  }, [url, cacheKey, options.cacheTTL]);

  const invalidateCache = useCallback(() => {
    apiCache.invalidate(cacheKey);
    fetchData(false); // Refetch without using cache
  }, [cacheKey, fetchData]);

  useEffect(() => {
    if (options.immediate !== false) {
      fetchData();
    }

    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData, ...(options.dependencies || [])]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchData(false),
    invalidateCache
  };
}
