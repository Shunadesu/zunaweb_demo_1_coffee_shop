import { useCallback, useEffect, useState, useRef } from 'react';
import { queryClient } from '../lib/queryClient';

/**
 * Hook for data fetching with caching
 */
export const useQuery = (options) => {
  const { queryKey, queryFn, enabled = true, ...rest } = options;
  
  const queryObs = useRef(null);
  const [state, setState] = useState({
    data: undefined,
    error: null,
    isLoading: true,
    isFetching: false,
  });

  useEffect(() => {
    if (!enabled) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const observer = new queryClient.queryCache.subscribe((query) => {
      if (query.queryKey === queryKey) {
        setState({
          data: query.state.data,
          error: query.state.error,
          isLoading: query.state.isLoading,
          isFetching: query.state.isFetching,
        });
      }
    });

    // Fetch immediately
    queryClient.prefetchQuery({ queryKey, queryFn, ...rest });

    return () => {
      queryClient.queryCache.unsubscribe(observer);
    };
  }, [queryKey, queryFn, enabled]);

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [queryKey]);

  return { ...state, refetch };
};

/**
 * Hook for mutations
 */
export const useMutation = (options) => {
  const { mutationFn, onSuccess, onError, onSettled } = options;
  const [state, setState] = useState({
    data: undefined,
    error: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
  });

  const mutate = useCallback(async (variables) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const data = await mutationFn(variables);
      setState({
        data,
        error: null,
        isLoading: false,
        isSuccess: true,
        isError: false,
      });
      
      if (onSuccess) {
        onSuccess(data, variables);
      }
      
      return data;
    } catch (error) {
      setState({
        data: null,
        error,
        isLoading: false,
        isSuccess: false,
        isError: true,
      });
      
      if (onError) {
        onError(error, variables);
      }
      
      throw error;
    } finally {
      if (onSettled) {
        onSettled(data, error);
      }
    }
  }, [mutationFn, onSuccess, onError, onSettled]);

  const reset = useCallback(() => {
    setState({
      data: undefined,
      error: null,
      isLoading: false,
      isSuccess: false,
      isError: false,
    });
  }, []);

  return { ...state, mutate, mutateAsync: mutate, reset };
};

export default useQuery;
