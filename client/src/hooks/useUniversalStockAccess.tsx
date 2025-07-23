/**
 * Hook for Universal Stock Access - Complete US Market Coverage
 */
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export interface StockData {
  symbol: string;
  company: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  float?: number;
  sector?: string;
  exchange: string;
}

export interface SearchResult {
  success: boolean;
  query: string;
  count: number;
  results: StockData[];
}

export interface MarketStats {
  success: boolean;
  marketStats: {
    totalStocks: number;
    exchanges: Array<{
      exchange: string;
      count: number;
    }>;
  };
}

export function useUniversalStockAccess() {
  const queryClient = useQueryClient();

  // Search stocks across entire US market
  const useStockSearch = (query: string, limit = 50) => {
    return useQuery<SearchResult>({
      queryKey: ['stocks', 'search', query, limit],
      enabled: query.length >= 1,
      staleTime: 30000, // 30 seconds
      refetchInterval: 30000, // Refresh every 30 seconds
    });
  };

  // Get specific stock data
  const useStock = (symbol: string) => {
    return useQuery<{ success: boolean; stock: StockData }>({
      queryKey: ['stocks', 'detail', symbol],
      enabled: !!symbol,
      staleTime: 5000, // 5 seconds for live data
      refetchInterval: 5000, // Ultra-reactive updates
    });
  };

  // Get stocks by exchange
  const useStocksByExchange = (exchange: string, limit = 100) => {
    return useQuery<{ success: boolean; exchange: string; count: number; stocks: StockData[] }>({
      queryKey: ['stocks', 'exchange', exchange, limit],
      staleTime: 60000, // 1 minute
      refetchInterval: 30000,
    });
  };

  // Get market statistics
  const useMarketStats = () => {
    return useQuery<MarketStats>({
      queryKey: ['stocks', 'market', 'stats'],
      staleTime: 300000, // 5 minutes
      refetchInterval: 60000, // 1 minute
    });
  };

  // Get all available symbols
  const useAllSymbols = (limit = 1000) => {
    return useQuery<{ success: boolean; count: number; symbols: string[] }>({
      queryKey: ['stocks', 'symbols', 'all', limit],
      staleTime: 600000, // 10 minutes
    });
  };

  // Fast stock lookup mutation for instant results
  const stockLookup = useMutation({
    mutationFn: async (symbol: string) => {
      const response = await apiRequest(`/api/stocks/${symbol}`);
      return response;
    },
    onSuccess: (data, symbol) => {
      // Update the cache with new data
      queryClient.setQueryData(['stocks', 'detail', symbol], data);
    }
  });

  // Batch stock lookup for multiple symbols
  const batchStockLookup = useMutation({
    mutationFn: async (symbols: string[]) => {
      const promises = symbols.map(symbol => 
        apiRequest(`/api/stocks/${symbol}`).catch(() => null)
      );
      const results = await Promise.all(promises);
      return results.filter(Boolean);
    }
  });

  return {
    // Query hooks
    useStockSearch,
    useStock,
    useStocksByExchange,
    useMarketStats,
    useAllSymbols,
    
    // Mutation hooks
    stockLookup,
    batchStockLookup,
    
    // Helper functions
    searchStocks: (query: string, limit?: number) => {
      return queryClient.fetchQuery({
        queryKey: ['stocks', 'search', query, limit || 50],
        queryFn: () => apiRequest(`/api/stocks/search?q=${encodeURIComponent(query)}&limit=${limit || 50}`)
      });
    },
    
    getStock: (symbol: string) => {
      return queryClient.fetchQuery({
        queryKey: ['stocks', 'detail', symbol],
        queryFn: () => apiRequest(`/api/stocks/${symbol}`)
      });
    },
    
    // Cache utilities
    invalidateStock: (symbol: string) => {
      queryClient.invalidateQueries({ queryKey: ['stocks', 'detail', symbol] });
    },
    
    invalidateSearch: (query: string) => {
      queryClient.invalidateQueries({ queryKey: ['stocks', 'search', query] });
    },
    
    // Pre-load popular stocks
    preloadPopularStocks: () => {
      const popularSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA'];
      popularSymbols.forEach(symbol => {
        queryClient.prefetchQuery({
          queryKey: ['stocks', 'detail', symbol],
          queryFn: () => apiRequest(`/api/stocks/${symbol}`),
          staleTime: 30000
        });
      });
    }
  };
}

// Custom hook for real-time stock watching
export function useRealTimeStock(symbol: string) {
  const { useStock } = useUniversalStockAccess();
  
  return useStock(symbol);
}

// Custom hook for stock search with debouncing
export function useDebouncedStockSearch(query: string, delay = 300) {
  const { useStockSearch } = useUniversalStockAccess();
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [query, delay]);
  
  return useStockSearch(debouncedQuery);
}