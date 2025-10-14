import { useCallback, useEffect, useState } from 'react';
import { listCategories } from '../../../lib/tauri/commands';
import { useCategoryStore } from '../store/categoryStore';

export const useCategories = () => {
  const { categories, setCategories } = useCategoryStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listCategories();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, [setCategories]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, error, refetch: fetchCategories };
};
