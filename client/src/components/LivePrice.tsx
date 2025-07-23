import { useQuery } from '@tanstack/react-query';
import { memo } from 'react';

interface LivePriceProps {
  symbol: string;
  className?: string;
  showLabel?: boolean;
  refreshInterval?: number;
}

export const LivePrice = memo(({ symbol, className = '', showLabel = true, refreshInterval = 30000 }: LivePriceProps) => {
  const { data: marketData, isLoading, error } = useQuery({
    queryKey: [`/api/market-data/${symbol}`],
    refetchInterval: refreshInterval,
    staleTime: 15000, // Consider data stale after 15 seconds
    retry: 2,
  });

  if (isLoading) {
    return (
      <div className={`text-gray-400 ${className}`}>
        {showLabel && <span className="text-xs">LIVE: </span>}
        <span>Loading...</span>
      </div>
    );
  }

  if (error || !marketData) {
    return (
      <div className={`text-red-400 ${className}`}>
        {showLabel && <span className="text-xs">LIVE: </span>}
        <span>Error</span>
      </div>
    );
  }

  const price = marketData.price || 0;
  const change = marketData.change || 0;
  const changePercent = marketData.changePercent || 0;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showLabel && <span className="text-xs text-blue-400">LIVE:</span>}
      <span className="font-semibold text-white">${price.toFixed(2)}</span>
      <span className={`text-xs ${
        change >= 0 ? 'text-green-400' : 'text-red-400'
      }`}>
        {change >= 0 ? '+' : ''}${change.toFixed(2)} ({changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%)
      </span>
    </div>
  );
});

LivePrice.displayName = 'LivePrice';