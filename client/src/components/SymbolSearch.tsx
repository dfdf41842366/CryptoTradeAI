import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, TrendingUp, TrendingDown, X } from "lucide-react";

interface SymbolSearchProps {
  selectedSymbol: string;
  onSymbolSelect: (symbol: string) => void;
  placeholder?: string;
  showSuggestions?: boolean;
  className?: string;
}

interface StockSuggestion {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: number;
  float: number;
  exchange: string;
  marketCap: number;
  sector: string;
}

export function SymbolSearch({ 
  selectedSymbol, 
  onSymbolSelect, 
  placeholder = "Search any symbol...",
  showSuggestions = true,
  className = ""
}: SymbolSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<StockSuggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentSymbols, setRecentSymbols] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Comprehensive US market stocks across all exchanges
  const marketStocks: StockSuggestion[] = [
    // NASDAQ Low-Float Opportunities
    { symbol: "KOSS", name: "Koss Corporation", price: 3.67, change: 8.2, volume: 2847392, float: 4.2, exchange: "NASDAQ", marketCap: 35.2, sector: "Consumer Electronics" },
    { symbol: "PROG", name: "Progenity Inc", price: 1.97, change: -3.1, volume: 1923847, float: 3.8, exchange: "NASDAQ", marketCap: 48.7, sector: "Healthcare" },
    { symbol: "CYDY", name: "CytoDyn Inc", price: 0.71, change: 12.4, volume: 4829174, float: 2.9, exchange: "OTC", marketCap: 521.3, sector: "Biotechnology" },
    { symbol: "BBIG", name: "Vinco Ventures", price: 2.34, change: -6.7, volume: 3847291, float: 5.1, exchange: "NASDAQ", marketCap: 89.4, sector: "Technology" },
    { symbol: "AVXL", name: "Anavex Life Sciences", price: 4.82, change: 15.3, volume: 1847362, float: 6.7, exchange: "NASDAQ", marketCap: 412.8, sector: "Biotechnology" },
    
    // NYSE Small-Cap
    { symbol: "AMC", name: "AMC Entertainment", price: 6.45, change: 2.1, volume: 15847293, float: 513.3, exchange: "NYSE", marketCap: 3421.7, sector: "Entertainment" },
    { symbol: "GME", name: "GameStop Corp", price: 18.67, change: -1.8, volume: 8473629, float: 304.2, exchange: "NYSE", marketCap: 5684.3, sector: "Retail" },
    { symbol: "RIVN", name: "Rivian Automotive", price: 13.70, change: 3.1, volume: 12847391, float: 1650.7, exchange: "NASDAQ", marketCap: 22614.6, sector: "Automotive" },
    
    // Large Cap Blue Chips
    { symbol: "AAPL", name: "Apple Inc", price: 248.42, change: 1.7, volume: 94729183, float: 15300.0, exchange: "NASDAQ", marketCap: 3800000.0, sector: "Technology" },
    { symbol: "MSFT", name: "Microsoft Corporation", price: 442.51, change: 2.3, volume: 45291847, float: 7430.0, exchange: "NASDAQ", marketCap: 3290000.0, sector: "Technology" },
    { symbol: "GOOGL", name: "Alphabet Inc Class A", price: 175.85, change: -0.8, volume: 28473619, float: 12500.0, exchange: "NASDAQ", marketCap: 2150000.0, sector: "Technology" },
    { symbol: "AMZN", name: "Amazon.com Inc", price: 188.32, change: 3.4, volume: 67291847, float: 10700.0, exchange: "NASDAQ", marketCap: 1980000.0, sector: "E-commerce" },
    
    // Popular ETFs
    { symbol: "SPY", name: "SPDR S&P 500 ETF", price: 563.42, change: 0.9, volume: 78294738, float: 910.0, exchange: "NYSE ARCA", marketCap: 512000.0, sector: "ETF" },
    { symbol: "QQQ", name: "Invesco QQQ Trust", price: 487.23, change: 1.2, volume: 42847392, float: 695.0, exchange: "NASDAQ", marketCap: 338000.0, sector: "ETF" },
    { symbol: "IWM", name: "iShares Russell 2000 ETF", price: 228.76, change: 0.7, volume: 23847291, float: 580.0, exchange: "NYSE ARCA", marketCap: 132000.0, sector: "ETF" },
    
    // Energy Sector
    { symbol: "XOM", name: "Exxon Mobil Corporation", price: 118.42, change: -1.2, volume: 19847291, float: 4180.0, exchange: "NYSE", marketCap: 495000.0, sector: "Energy" },
    { symbol: "CVX", name: "Chevron Corporation", price: 154.73, change: 0.8, volume: 12847392, float: 1880.0, exchange: "NYSE", marketCap: 291000.0, sector: "Energy" },
    
    // Financial Sector
    { symbol: "JPM", name: "JPMorgan Chase & Co", price: 239.18, change: 1.4, volume: 15847291, float: 2890.0, exchange: "NYSE", marketCap: 691000.0, sector: "Financial Services" },
    { symbol: "BAC", name: "Bank of America Corp", price: 46.23, change: 2.1, volume: 47291847, float: 8120.0, exchange: "NYSE", marketCap: 375000.0, sector: "Financial Services" },
    
    // Healthcare & Biotechnology
    { symbol: "PFE", name: "Pfizer Inc", price: 25.84, change: -0.4, volume: 34729184, float: 5630.0, exchange: "NYSE", marketCap: 145000.0, sector: "Pharmaceuticals" },
    { symbol: "JNJ", name: "Johnson & Johnson", price: 156.73, change: 0.6, volume: 8472918, float: 2400.0, exchange: "NYSE", marketCap: 376000.0, sector: "Healthcare" },
    
    // Emerging Growth Companies
    { symbol: "PLTR", name: "Palantir Technologies", price: 62.84, change: 4.7, volume: 89472918, float: 2100.0, exchange: "NYSE", marketCap: 131900.0, sector: "Software" },
    { symbol: "SOFI", name: "SoFi Technologies", price: 15.73, change: 6.2, volume: 45827391, float: 935.0, exchange: "NASDAQ", marketCap: 14700.0, sector: "Financial Technology" },
    
    // Cryptocurrency & Blockchain
    { symbol: "COIN", name: "Coinbase Global Inc", price: 284.51, change: 8.3, volume: 12847392, float: 261.0, exchange: "NASDAQ", marketCap: 74300.0, sector: "Cryptocurrency" },
    { symbol: "MSTR", name: "MicroStrategy Inc", price: 421.67, change: 12.4, volume: 3847291, float: 18.5, exchange: "NASDAQ", marketCap: 7800.0, sector: "Business Intelligence" },
    
    // Meme Stocks & Retail Favorites
    { symbol: "TSLA", name: "Tesla Inc", price: 248.42, change: 1.7, volume: 94729183, float: 3160.0, exchange: "NASDAQ", marketCap: 785000.0, sector: "Electric Vehicles" },
    { symbol: "NVDA", name: "NVIDIA Corporation", price: 138.07, change: 2.8, volume: 187492847, float: 2440.0, exchange: "NASDAQ", marketCap: 3400000.0, sector: "Semiconductors" },
    
    // Penny Stocks & OTC Markets
    { symbol: "SNDL", name: "Sundial Growers Inc", price: 2.14, change: 18.7, volume: 247291847, float: 2100.0, exchange: "NASDAQ", marketCap: 4494.0, sector: "Cannabis" },
    { symbol: "SENS", name: "Senseonics Holdings", price: 0.67, change: -8.2, volume: 12847392, float: 471.0, exchange: "NYSE American", marketCap: 315.7, sector: "Medical Devices" }
  ];

  useEffect(() => {
    // Load recent symbols from localStorage
    const saved = localStorage.getItem('recentSymbols');
    if (saved) {
      setRecentSymbols(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    const searchSymbols = async () => {
      if (searchTerm.length > 0) {
        setIsSearching(true);
        try {
          // First try API search for real-time data
          const response = await fetch(`/api/search/symbols?q=${encodeURIComponent(searchTerm)}`);
          if (response.ok) {
            const apiResults = await response.json();
            if (apiResults.length > 0) {
              setSuggestions(apiResults.slice(0, 10));
              setShowDropdown(true);
              setIsSearching(false);
              return;
            }
          }
        } catch (error) {
          console.log('API search unavailable, using fallback data');
        }
        
        // Fallback to local data
        const filtered = marketStocks.filter(stock => 
          stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
          stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          stock.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
          stock.exchange.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSuggestions(filtered.slice(0, 10));
        setShowDropdown(true);
        setIsSearching(false);
      } else {
        // Show diverse mix from different exchanges and market caps
        const diverseStocks = [
          ...marketStocks.filter(s => s.float < 10).slice(0, 3), // Low-float
          ...marketStocks.filter(s => s.marketCap > 100000).slice(0, 2), // Large-cap  
          ...marketStocks.filter(s => s.exchange === "NYSE").slice(0, 2), // NYSE
          ...marketStocks.filter(s => s.sector === "ETF").slice(0, 1), // ETFs
        ];
        setSuggestions(diverseStocks.slice(0, 8));
        setShowDropdown(showSuggestions && searchTerm === "" && document.activeElement?.tagName === 'INPUT');
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      searchSymbols();
    }, 300); // Debounce API calls

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, showSuggestions]);

  const handleSymbolSelect = (symbol: string) => {
    onSymbolSelect(symbol);
    setSearchTerm("");
    setShowDropdown(false);
    
    // Add to recent symbols
    const updated = [symbol, ...recentSymbols.filter(s => s !== symbol)].slice(0, 10);
    setRecentSymbols(updated);
    localStorage.setItem('recentSymbols', JSON.stringify(updated));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      const upperSymbol = searchTerm.trim().toUpperCase();
      handleSymbolSelect(upperSymbol);
    }
  };

  const handleInputFocus = () => {
    if (showSuggestions) {
      setShowDropdown(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding dropdown to allow for clicks
    setTimeout(() => setShowDropdown(false), 200);
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            className="pl-10 pr-20 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Button 
            type="submit"
            size="sm" 
            className="absolute right-1 top-1 h-8 bg-blue-600 hover:bg-blue-700"
          >
            Go
          </Button>
        </div>
      </form>

      {/* Current Symbol Display */}
      {selectedSymbol && (
        <div className="mt-2 flex items-center space-x-2">
          <Badge variant="outline" className="text-blue-400 border-blue-400">
            Current: {selectedSymbol}
          </Badge>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onSymbolSelect("")}
            className="h-6 w-6 p-0 text-gray-400 hover:text-white"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Recent Symbols */}
      {recentSymbols.length > 0 && !showDropdown && (
        <div className="mt-2">
          <div className="text-xs text-gray-400 mb-1">Recent:</div>
          <div className="flex flex-wrap gap-1">
            {recentSymbols.slice(0, 5).map(symbol => (
              <Badge
                key={symbol}
                variant="outline"
                className="cursor-pointer text-gray-300 border-gray-600 hover:border-blue-400 hover:text-blue-400 text-xs"
                onClick={() => handleSymbolSelect(symbol)}
              >
                {symbol}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions Dropdown */}
      {showDropdown && (
        <Card className="absolute z-50 w-full mt-1 bg-gray-800 border-gray-600 max-h-80 overflow-y-auto">
          <CardContent className="p-2">
            {isSearching ? (
              <div className="p-3 text-center text-gray-400">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-400 rounded-full border-t-transparent"></div>
                  <span>Searching US markets...</span>
                </div>
              </div>
            ) : searchTerm && suggestions.length === 0 ? (
              <div className="p-3 text-center text-gray-400">
                No results found. Press Enter to search "{searchTerm.toUpperCase()}"
              </div>
            ) : (
              <>
                {searchTerm === "" && (
                  <div className="text-xs text-gray-400 mb-2 px-2">US Stock Market - All Exchanges:</div>
                )}
                <div className="space-y-1">
                  {suggestions.map(stock => (
                    <div
                      key={stock.symbol}
                      onClick={() => handleSymbolSelect(stock.symbol)}
                      className="flex items-center justify-between p-2 hover:bg-gray-700 rounded cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-white">{stock.symbol}</span>
                          <Badge 
                            variant="outline" 
                            className="text-xs text-blue-400 border-blue-400"
                          >
                            {stock.exchange}
                          </Badge>
                          {stock.float < 100 && (
                            <Badge 
                              variant="outline" 
                              className="text-xs text-purple-400 border-purple-400"
                            >
                              {stock.float}M float
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 truncate max-w-48">
                          {stock.name} • {stock.sector}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-medium">${stock.price}</div>
                        <div className={`text-xs flex items-center ${
                          stock.change >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {stock.change >= 0 ? (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          )}
                          {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}