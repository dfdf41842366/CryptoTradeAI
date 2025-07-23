/**
 * Universal Stock Search Component - Works with entire US market
 */
import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUniversalStockAccess } from '@/hooks/useUniversalStockAccess';

interface UniversalStockSearchProps {
  onSymbolSelect?: (symbol: string, data?: any) => void;
  placeholder?: string;
  showExchangeFilter?: boolean;
  showSectorFilter?: boolean;
  limit?: number;
}

export function UniversalStockSearch({
  onSymbolSelect,
  placeholder = "Search any US stock symbol or company...",
  showExchangeFilter = true,
  showSectorFilter = true,
  limit = 20
}: UniversalStockSearchProps) {
  const [query, setQuery] = useState('');
  const [selectedExchange, setSelectedExchange] = useState<string>('ALL');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  
  const { useStockSearch, useMarketStats } = useUniversalStockAccess();
  
  // Debounced search query
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);
  
  const { data: searchResults, isLoading: searchLoading } = useStockSearch(debouncedQuery, limit);
  const { data: marketStats } = useMarketStats();
  
  // Filter results by exchange and sector
  const filteredResults = searchResults?.results?.filter(stock => {
    const exchangeMatch = selectedExchange === 'ALL' || stock.exchange === selectedExchange;
    const sectorMatch = selectedSector === 'ALL' || stock.sector === selectedSector;
    return exchangeMatch && sectorMatch;
  }) || [];
  
  const exchanges = marketStats?.marketStats?.exchanges || [];
  const sectors = ['Technology', 'Healthcare', 'Financials', 'Energy', 'Industrial', 'Consumer Discretionary', 'Communication', 'ETF', 'OTC'];
  
  const handleStockSelect = (stock: any) => {
    if (onSymbolSelect) {
      onSymbolSelect(stock.symbol, stock);
    }
    setQuery(''); // Clear search after selection
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };
  
  const formatChange = (change: number, changePercent: number) => {
    const isPositive = change >= 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const color = isPositive ? 'text-green-500' : 'text-red-500';
    
    return (
      <div className={`flex items-center gap-1 ${color}`}>
        <Icon className="w-4 h-4" />
        <span className="font-medium">
          {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
        </span>
      </div>
    );
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Universal Stock Search
          <Badge variant="secondary">Complete US Market</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Filters */}
        {(showExchangeFilter || showSectorFilter) && (
          <div className="flex gap-4 flex-wrap">
            {showExchangeFilter && (
              <div className="flex-1 min-w-[150px]">
                <label className="text-sm font-medium mb-1 block">Exchange</label>
                <select
                  value={selectedExchange}
                  onChange={(e) => setSelectedExchange(e.target.value)}
                  className="w-full p-2 border rounded-md bg-background"
                >
                  <option value="ALL">All Exchanges</option>
                  {exchanges.map(exchange => (
                    <option key={exchange.exchange} value={exchange.exchange}>
                      {exchange.exchange} ({exchange.count})
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {showSectorFilter && (
              <div className="flex-1 min-w-[150px]">
                <label className="text-sm font-medium mb-1 block">Sector</label>
                <select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="w-full p-2 border rounded-md bg-background"
                >
                  <option value="ALL">All Sectors</option>
                  {sectors.map(sector => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
        
        {/* Search Results */}
        {debouncedQuery.length > 0 && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {searchLoading ? (
              <div className="text-center py-4">
                <Activity className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Searching complete US market...</p>
              </div>
            ) : filteredResults.length > 0 ? (
              <>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    Found {filteredResults.length} results for "{debouncedQuery}"
                  </p>
                  <Badge variant="outline">{searchResults?.count || 0} total matches</Badge>
                </div>
                
                <div className="space-y-2">
                  {filteredResults.map((stock) => (
                    <Card
                      key={stock.symbol}
                      className="p-3 cursor-pointer hover:bg-accent/50 transition-colors border-l-4 border-l-blue-500"
                      onClick={() => handleStockSelect(stock)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-lg">{stock.symbol}</h4>
                            <Badge variant="secondary">{stock.exchange}</Badge>
                            {stock.sector && <Badge variant="outline">{stock.sector}</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{stock.company}</p>
                          
                          <div className="flex items-center gap-4 text-sm">
                            <div className="font-semibold text-lg">
                              {formatPrice(stock.price)}
                            </div>
                            {formatChange(stock.change, stock.changePercent)}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">
                            Volume: {stock.volume.toLocaleString()}
                          </div>
                          {stock.marketCap && (
                            <div className="text-sm text-muted-foreground">
                              Market Cap: ${(stock.marketCap / 1e9).toFixed(1)}B
                            </div>
                          )}
                          {stock.float && (
                            <div className="text-sm text-muted-foreground">
                              Float: {(stock.float / 1e6).toFixed(1)}M
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            ) : debouncedQuery.length > 0 ? (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No stocks found for "{debouncedQuery}"</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try searching by symbol, company name, or sector
                </p>
              </div>
            ) : null}
          </div>
        )}
        
        {/* Market Statistics */}
        {!query && marketStats && (
          <div className="space-y-2">
            <h4 className="font-medium">Market Coverage</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <Card className="p-2">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {marketStats.marketStats.totalStocks}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Stocks</div>
                </div>
              </Card>
              
              {exchanges.slice(0, 5).map(exchange => (
                <Card key={exchange.exchange} className="p-2">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {exchange.count}
                    </div>
                    <div className="text-xs text-muted-foreground">{exchange.exchange}</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default UniversalStockSearch;