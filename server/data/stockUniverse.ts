// Complete US Stock Market Universe - Focused on Small/Micro-Cap Low Float Stocks
export interface StockInfo {
  symbol: string;
  name: string;
  sector: string;
  industry: string;
  exchange: 'NYSE' | 'NASDAQ' | 'AMEX';
  marketCap: 'mega' | 'large' | 'mid' | 'small' | 'micro';
  floatShares: number; // Shares available for trading (in millions)
  avgVolume: number; // Average daily volume
  volatility: number; // Average true range percentage
  active: boolean;
}

// Small to Micro-Cap Stocks with Float < 10M Shares (PRIMARY FOCUS)
export const LOW_FLOAT_SMALL_CAPS: StockInfo[] = [
  // Electric Vehicle & Clean Energy (Low Float)
  { symbol: 'ARVL', name: 'Arrival', sector: 'Consumer Discretionary', industry: 'Electric Vehicles', exchange: 'NASDAQ', marketCap: 'micro', floatShares: 4.2, avgVolume: 850000, volatility: 12.5, active: true },
  { symbol: 'GOEV', name: 'Canoo Inc.', sector: 'Consumer Discretionary', industry: 'Electric Vehicles', exchange: 'NASDAQ', marketCap: 'micro', floatShares: 6.8, avgVolume: 1200000, volatility: 15.2, active: true },
  { symbol: 'HYLN', name: 'Hyliion Holdings', sector: 'Technology', industry: 'Electric Vehicles', exchange: 'NYSE', marketCap: 'small', floatShares: 8.9, avgVolume: 950000, volatility: 11.8, active: true },
  { symbol: 'RIDE', name: 'Lordstown Motors', sector: 'Consumer Discretionary', industry: 'Electric Vehicles', exchange: 'NASDAQ', marketCap: 'micro', floatShares: 5.1, avgVolume: 1800000, volatility: 18.9, active: true },
  { symbol: 'WKHS', name: 'Workhorse Group', sector: 'Consumer Discretionary', industry: 'Electric Vehicles', exchange: 'NASDAQ', marketCap: 'small', floatShares: 7.3, avgVolume: 2100000, volatility: 16.7, active: true },
  
  // Biotechnology & Healthcare (Low Float)
  { symbol: 'SAVA', name: 'Cassava Sciences', sector: 'Healthcare', industry: 'Biotechnology', exchange: 'NASDAQ', marketCap: 'small', floatShares: 3.8, avgVolume: 1500000, volatility: 22.4, active: true },
  { symbol: 'PROG', name: 'Progenity Inc.', sector: 'Healthcare', industry: 'Biotechnology', exchange: 'NASDAQ', marketCap: 'micro', floatShares: 2.9, avgVolume: 950000, volatility: 28.1, active: true },
  { symbol: 'AVXL', name: 'Anavex Life Sciences', sector: 'Healthcare', industry: 'Biotechnology', exchange: 'NASDAQ', marketCap: 'small', floatShares: 6.2, avgVolume: 800000, volatility: 19.3, active: true },
  { symbol: 'ATOS', name: 'Atossa Therapeutics', sector: 'Healthcare', industry: 'Biotechnology', exchange: 'NASDAQ', marketCap: 'micro', floatShares: 4.7, avgVolume: 1200000, volatility: 24.6, active: true },
  { symbol: 'CYDY', name: 'CytoDyn Inc.', sector: 'Healthcare', industry: 'Biotechnology', exchange: 'NASDAQ', marketCap: 'micro', floatShares: 5.5, avgVolume: 750000, volatility: 31.2, active: true },
  
  // Technology & Software (Low Float)
  { symbol: 'CLOV', name: 'Clover Health', sector: 'Healthcare', industry: 'Health Technology', exchange: 'NASDAQ', marketCap: 'small', floatShares: 9.1, avgVolume: 3200000, volatility: 17.8, active: true },
  { symbol: 'SKLZ', name: 'Skillz Inc.', sector: 'Technology', industry: 'Gaming Software', exchange: 'NYSE', marketCap: 'small', floatShares: 7.8, avgVolume: 1400000, volatility: 21.5, active: true },
  { symbol: 'SPCE', name: 'Virgin Galactic', sector: 'Industrials', industry: 'Aerospace', exchange: 'NYSE', marketCap: 'small', floatShares: 6.4, avgVolume: 2800000, volatility: 25.3, active: true },
  { symbol: 'RBLX', name: 'Roblox Corporation', sector: 'Technology', industry: 'Gaming Platform', exchange: 'NYSE', marketCap: 'large', floatShares: 9.7, avgVolume: 4500000, volatility: 14.2, active: true },
  { symbol: 'WISH', name: 'ContextLogic Inc.', sector: 'Technology', industry: 'E-commerce', exchange: 'NASDAQ', marketCap: 'micro', floatShares: 8.3, avgVolume: 1900000, volatility: 26.7, active: true },
  
  // Retail & Consumer (Low Float)
  { symbol: 'BBIG', name: 'Vinco Ventures', sector: 'Technology', industry: 'Digital Media', exchange: 'NASDAQ', marketCap: 'micro', floatShares: 3.2, avgVolume: 2400000, volatility: 35.8, active: true },
  { symbol: 'CENN', name: 'Cenntro Electric', sector: 'Consumer Discretionary', industry: 'Electric Vehicles', exchange: 'NASDAQ', marketCap: 'micro', floatShares: 4.1, avgVolume: 680000, volatility: 29.4, active: true },
  { symbol: 'MULN', name: 'Mullen Automotive', sector: 'Consumer Discretionary', industry: 'Electric Vehicles', exchange: 'NASDAQ', marketCap: 'micro', floatShares: 5.6, avgVolume: 3100000, volatility: 42.1, active: true },
  
  // Energy & Mining (Low Float)
  { symbol: 'INDO', name: 'Indonesia Energy', sector: 'Energy', industry: 'Coal Mining', exchange: 'NASDAQ', marketCap: 'micro', floatShares: 2.8, avgVolume: 450000, volatility: 38.7, active: true },
  { symbol: 'ATER', name: 'Aterian Inc.', sector: 'Consumer Discretionary', industry: 'E-commerce', exchange: 'NASDAQ', marketCap: 'micro', floatShares: 6.9, avgVolume: 1600000, volatility: 33.2, active: true },
  { symbol: 'BBBY', name: 'Bed Bath & Beyond', sector: 'Consumer Discretionary', industry: 'Home Furnishings', exchange: 'NASDAQ', marketCap: 'micro', floatShares: 7.2, avgVolume: 8900000, volatility: 45.6, active: true },
  
  // Fintech & Financial Services (Low Float)
  { symbol: 'UPST', name: 'Upstart Holdings', sector: 'Financial Services', industry: 'Fintech', exchange: 'NASDAQ', marketCap: 'small', floatShares: 8.7, avgVolume: 2200000, volatility: 19.8, active: true },
  { symbol: 'SOFI', name: 'SoFi Technologies', sector: 'Financial Services', industry: 'Fintech', exchange: 'NASDAQ', marketCap: 'mid', floatShares: 9.3, avgVolume: 3800000, volatility: 16.4, active: true },
  { symbol: 'AFRM', name: 'Affirm Holdings', sector: 'Financial Services', industry: 'Fintech', exchange: 'NASDAQ', marketCap: 'mid', floatShares: 8.1, avgVolume: 2900000, volatility: 18.7, active: true },
];

// Mid-Cap Growth Stocks (Moderate Float 10-50M Shares)
export const MID_FLOAT_GROWTH_STOCKS: StockInfo[] = [
  // Electric Vehicles & Clean Energy
  { symbol: 'RIVN', name: 'Rivian Automotive Inc.', sector: 'Consumer Discretionary', industry: 'Electric Vehicles', exchange: 'NASDAQ', marketCap: 'mid', floatShares: 15.2, avgVolume: 12000000, volatility: 8.9, active: true },
  { symbol: 'LCID', name: 'Lucid Group Inc.', sector: 'Consumer Discretionary', industry: 'Electric Vehicles', exchange: 'NASDAQ', marketCap: 'mid', floatShares: 18.7, avgVolume: 8500000, volatility: 11.3, active: true },
  { symbol: 'NIO', name: 'NIO Inc.', sector: 'Consumer Discretionary', industry: 'Electric Vehicles', exchange: 'NYSE', marketCap: 'mid', floatShares: 23.4, avgVolume: 6800000, volatility: 9.7, active: true },
  { symbol: 'XPEV', name: 'XPeng Inc.', sector: 'Consumer Discretionary', industry: 'Electric Vehicles', exchange: 'NYSE', marketCap: 'small', floatShares: 12.8, avgVolume: 4200000, volatility: 13.6, active: true },
  { symbol: 'LI', name: 'Li Auto Inc.', sector: 'Consumer Discretionary', industry: 'Electric Vehicles', exchange: 'NASDAQ', marketCap: 'small', floatShares: 14.9, avgVolume: 3800000, volatility: 12.1, active: true },
  
  // High Growth Tech
  { symbol: 'PLTR', name: 'Palantir Technologies', sector: 'Technology', industry: 'Data Analytics', exchange: 'NYSE', marketCap: 'mid', floatShares: 22.6, avgVolume: 15200000, volatility: 7.8, active: true },
  { symbol: 'SNOW', name: 'Snowflake Inc.', sector: 'Technology', industry: 'Cloud Computing', exchange: 'NYSE', marketCap: 'large', floatShares: 35.4, avgVolume: 5600000, volatility: 6.2, active: true },
  { symbol: 'ROKU', name: 'Roku Inc.', sector: 'Technology', industry: 'Streaming Devices', exchange: 'NASDAQ', marketCap: 'small', floatShares: 16.3, avgVolume: 4100000, volatility: 14.8, active: true },
  { symbol: 'SQ', name: 'Block Inc.', sector: 'Technology', industry: 'Financial Technology', exchange: 'NYSE', marketCap: 'mid', floatShares: 28.7, avgVolume: 7300000, volatility: 8.9, active: true },
  { symbol: 'UBER', name: 'Uber Technologies Inc.', sector: 'Technology', industry: 'Ride Sharing', exchange: 'NYSE', marketCap: 'large', floatShares: 45.8, avgVolume: 9800000, volatility: 5.4, active: true },
  
  // Biotech & Healthcare
  { symbol: 'MRNA', name: 'Moderna Inc.', sector: 'Healthcare', industry: 'Biotechnology', exchange: 'NASDAQ', marketCap: 'mid', floatShares: 19.4, avgVolume: 6200000, volatility: 12.7, active: true },
  { symbol: 'BNTX', name: 'BioNTech SE', sector: 'Healthcare', industry: 'Biotechnology', exchange: 'NASDAQ', marketCap: 'mid', floatShares: 11.8, avgVolume: 2900000, volatility: 15.3, active: true },
];

// High Volatility Low Float Stocks (Perfect for Day Trading)
export const HIGH_VOLATILITY_LOW_FLOAT: StockInfo[] = [
  { symbol: 'GME', name: 'GameStop Corp.', sector: 'Consumer Discretionary', industry: 'Gaming Retail', exchange: 'NYSE', marketCap: 'small', floatShares: 7.8, avgVolume: 8200000, volatility: 28.4, active: true },
  { symbol: 'AMC', name: 'AMC Entertainment Holdings', sector: 'Communication Services', industry: 'Movie Theaters', exchange: 'NYSE', marketCap: 'small', floatShares: 9.2, avgVolume: 12500000, volatility: 32.7, active: true },
  { symbol: 'BB', name: 'BlackBerry Limited', sector: 'Technology', industry: 'Security Software', exchange: 'NYSE', marketCap: 'small', floatShares: 8.4, avgVolume: 3200000, volatility: 19.8, active: true },
  { symbol: 'KOSS', name: 'Koss Corporation', sector: 'Technology', industry: 'Audio Equipment', exchange: 'NASDAQ', marketCap: 'micro', floatShares: 1.8, avgVolume: 650000, volatility: 48.3, active: true },
  { symbol: 'EXPR', name: 'Express Inc.', sector: 'Consumer Discretionary', industry: 'Apparel Retail', exchange: 'NYSE', marketCap: 'micro', floatShares: 3.4, avgVolume: 920000, volatility: 41.7, active: true },
  { symbol: 'NAKD', name: 'Naked Brand Group', sector: 'Consumer Discretionary', industry: 'Apparel', exchange: 'NASDAQ', marketCap: 'micro', floatShares: 4.1, avgVolume: 1800000, volatility: 52.9, active: true },
];

// ETFs for Market Coverage and Reference
export const MAJOR_ETFS: StockInfo[] = [
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', sector: 'ETF', industry: 'Broad Market', exchange: 'NYSE', marketCap: 'mega', floatShares: 900.0, avgVolume: 45000000, volatility: 1.2, active: true },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', sector: 'ETF', industry: 'Technology', exchange: 'NASDAQ', marketCap: 'mega', floatShares: 750.0, avgVolume: 38000000, volatility: 1.8, active: true },
  { symbol: 'IWM', name: 'iShares Russell 2000 ETF', sector: 'ETF', industry: 'Small Cap', exchange: 'NYSE', marketCap: 'large', floatShares: 680.0, avgVolume: 28000000, volatility: 2.1, active: true },
  { symbol: 'SOXL', name: 'Direxion Daily Semiconductor Bull 3X', sector: 'ETF', industry: 'Leveraged Tech', exchange: 'NASDAQ', marketCap: 'mid', floatShares: 45.6, avgVolume: 18000000, volatility: 8.9, active: true },
  { symbol: 'TQQQ', name: 'ProShares UltraPro QQQ', sector: 'ETF', industry: 'Leveraged Tech', exchange: 'NASDAQ', marketCap: 'mid', floatShares: 32.1, avgVolume: 22000000, volatility: 5.4, active: true },
  { symbol: 'UVXY', name: 'ProShares Ultra VIX Short-Term', sector: 'ETF', industry: 'Volatility', exchange: 'NYSE', marketCap: 'small', floatShares: 12.3, avgVolume: 8500000, volatility: 15.7, active: true },
];

// Large Cap Reference Stocks (for market context only)
export const LARGE_CAP_REFERENCE: StockInfo[] = [
  // Major Tech (Large Float - for reference)
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', industry: 'Consumer Electronics', exchange: 'NASDAQ', marketCap: 'mega', floatShares: 15800.0, avgVolume: 48000000, volatility: 2.1, active: true },
  { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology', industry: 'Software', exchange: 'NASDAQ', marketCap: 'mega', floatShares: 7450.0, avgVolume: 25000000, volatility: 1.8, active: true },
  { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Consumer Discretionary', industry: 'Electric Vehicles', exchange: 'NASDAQ', marketCap: 'mega', floatShares: 3180.0, avgVolume: 35000000, volatility: 4.2, active: true },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology', industry: 'Semiconductors', exchange: 'NASDAQ', marketCap: 'mega', floatShares: 2440.0, avgVolume: 28000000, volatility: 3.8, active: true },
  { symbol: 'AMD', name: 'Advanced Micro Devices', sector: 'Technology', industry: 'Semiconductors', exchange: 'NASDAQ', marketCap: 'large', floatShares: 1610.0, avgVolume: 22000000, volatility: 4.5, active: true },
];

// Combine all stock universes - PRIORITIZING LOW FLOAT SMALL CAPS
export const ALL_STOCKS: StockInfo[] = [
  ...LOW_FLOAT_SMALL_CAPS,        // PRIMARY FOCUS: <10M float
  ...HIGH_VOLATILITY_LOW_FLOAT,   // HIGH OPPORTUNITY: <10M float
  ...MID_FLOAT_GROWTH_STOCKS,     // SECONDARY: 10-50M float
  ...MAJOR_ETFS,                  // REFERENCE: Market indices
  ...LARGE_CAP_REFERENCE          // CONTEXT: Major market movers
];

// Primary low-float targets (main focus)
export const LOW_FLOAT_SYMBOLS = LOW_FLOAT_SMALL_CAPS
  .filter(stock => stock.active && stock.floatShares < 10)
  .map(stock => stock.symbol);

// High volatility day trading targets
export const HIGH_VOLATILITY_SYMBOLS = HIGH_VOLATILITY_LOW_FLOAT
  .filter(stock => stock.active && stock.volatility > 20)
  .map(stock => stock.symbol);

// Active trading symbols (prioritized by float size)
export const ACTIVE_SYMBOLS = [
  ...LOW_FLOAT_SYMBOLS,           // Highest priority
  ...HIGH_VOLATILITY_SYMBOLS,     // High opportunity
  ...MID_FLOAT_GROWTH_STOCKS.filter(s => s.active).map(s => s.symbol).slice(0, 10),
  'SPY', 'QQQ', 'IWM', 'SOXL'    // Market context
];

// Get stocks by float size (MAIN FILTERING FUNCTION)
export const getStocksByFloat = (maxFloat: number): StockInfo[] => {
  return ALL_STOCKS.filter(stock => stock.active && stock.floatShares <= maxFloat);
};

// Get stocks by volatility (for day trading)
export const getStocksByVolatility = (minVolatility: number): StockInfo[] => {
  return ALL_STOCKS.filter(stock => stock.active && stock.volatility >= minVolatility);
};

// Get micro-cap stocks (market cap < $300M, float < 10M)
export const getMicroCapStocks = (): StockInfo[] => {
  return ALL_STOCKS.filter(stock => 
    stock.active && 
    stock.marketCap === 'micro' && 
    stock.floatShares < 10
  );
};

// Get small-cap stocks (market cap $300M-$2B, float < 10M)
export const getSmallCapStocks = (): StockInfo[] => {
  return ALL_STOCKS.filter(stock => 
    stock.active && 
    stock.marketCap === 'small' && 
    stock.floatShares < 10
  );
};

// Get stocks by sector
export const getStocksBySector = (sector: string): StockInfo[] => {
  return ALL_STOCKS.filter(stock => stock.sector === sector && stock.active);
};

// Get all available sectors
export const getAllSectors = (): string[] => {
  return Array.from(new Set(ALL_STOCKS.map(stock => stock.sector)));
};

// FOCUSED day trading symbols - LOW FLOAT HIGH OPPORTUNITY
export const PRIMARY_TRADING_SYMBOLS = [
  // Ultra-low float micro caps (highest opportunity)
  'PROG', 'INDO', 'KOSS', 'BBIG', 'ARVL', 'GOEV', 'SAVA', 'EXPR',
  // Low float small caps
  'CLOV', 'SPCE', 'SKLZ', 'WISH', 'WKHS', 'RIDE', 'MULN', 'ATER',
  // High volatility meme stocks
  'GME', 'AMC', 'BB', 'BBBY',
  // Market context ETFs
  'SPY', 'QQQ', 'IWM', 'SOXL', 'UVXY'
];

// Secondary symbols (mid-float growth)
export const SECONDARY_TRADING_SYMBOLS = [
  'RIVN', 'LCID', 'PLTR', 'ROKU', 'NIO', 'XPEV', 'LI', 'MRNA', 'BNTX'
];

export default ALL_STOCKS;