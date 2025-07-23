import { useEffect, useRef, useState, useCallback } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Square, 
  Circle, 
  Triangle, 
  Pencil, 
  Type, 
  Crosshair, 
  Move, 
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Settings
} from 'lucide-react';

interface CandlestickData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface DrawingTool {
  type: 'trendline' | 'horizontal' | 'vertical' | 'rectangle' | 'circle' | 'triangle' | 'text';
  active: boolean;
}

interface TechnicalIndicator {
  name: string;
  color: string;
  enabled: boolean;
  values: number[];
}

interface CandlestickChartProps {
  data: CandlestickData[];
  width?: number;
  height?: number;
  showVolume?: boolean;
  showGrid?: boolean;
  symbol?: string;
  timeframe?: string;
}

export function CandlestickChart({ 
  data = [], 
  width = 1200, 
  height = 600, 
  showVolume = true, 
  showGrid = true,
  symbol = '',
  timeframe = '1D'
}: CandlestickChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawingTools, setDrawingTools] = useState<DrawingTool[]>([
    { type: 'trendline', active: false },
    { type: 'horizontal', active: false },
    { type: 'vertical', active: false },
    { type: 'rectangle', active: false },
    { type: 'circle', active: false },
    { type: 'triangle', active: false },
    { type: 'text', active: false }
  ]);
  
  const [indicators, setIndicators] = useState<TechnicalIndicator[]>([
    { name: 'SMA(20)', color: '#FFD700', enabled: true, values: [] },
    { name: 'EMA(50)', color: '#FF6B6B', enabled: true, values: [] },
    { name: 'RSI(14)', color: '#4ECDC4', enabled: false, values: [] },
    { name: 'MACD', color: '#45B7D1', enabled: false, values: [] }
  ]);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Calculate technical indicators
  const calculateSMA = useCallback((data: CandlestickData[], period: number): number[] => {
    const sma: number[] = [];
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        sma.push(NaN);
      } else {
        const sum = data.slice(i - period + 1, i + 1).reduce((acc, candle) => acc + candle.close, 0);
        sma.push(sum / period);
      }
    }
    return sma;
  }, []);

  const calculateEMA = useCallback((data: CandlestickData[], period: number): number[] => {
    const ema: number[] = [];
    const multiplier = 2 / (period + 1);
    
    for (let i = 0; i < data.length; i++) {
      if (i === 0) {
        ema.push(data[i].close);
      } else {
        ema.push((data[i].close - ema[i - 1]) * multiplier + ema[i - 1]);
      }
    }
    return ema;
  }, []);

  const activateDrawingTool = (toolType: string) => {
    setDrawingTools(prev => prev.map(tool => ({
      ...tool,
      active: tool.type === toolType ? !tool.active : false
    })));
  };

  useEffect(() => {
    if (!data || !Array.isArray(data) || data.length === 0 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size for high DPI
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas with dark background
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, width, height);

    // Calculate dimensions
    const chartHeight = showVolume ? height * 0.75 : height;
    const volumeHeight = showVolume ? height * 0.2 : 0;
    const padding = 60;
    const rightPadding = 80;
    const candleWidth = Math.max(1.5, (width - padding - rightPadding) / data.length * 0.7);
    const candleSpacing = (width - padding - rightPadding) / data.length;

    // Find price range with zoom
    const prices = data.flatMap(d => [d.open, d.high, d.low, d.close]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;
    const pricePadding = priceRange * 0.08;

    // Find volume range
    const volumes = data.map(d => d.volume);
    const maxVolume = Math.max(...volumes);

    // Helper functions with zoom and pan
    const priceToY = (price: number) => {
      return padding + (maxPrice + pricePadding - price) / (priceRange + pricePadding * 2) * (chartHeight - padding * 2) * zoom + pan.y;
    };

    const volumeToY = (volume: number) => {
      return chartHeight + 5 + (1 - volume / maxVolume) * volumeHeight;
    };

    // Draw professional grid
    if (showGrid) {
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 0.3;
      
      // Major horizontal grid lines
      for (let i = 0; i <= 8; i++) {
        const y = padding + (chartHeight - padding * 2) * i / 8;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - rightPadding, y);
        ctx.stroke();
      }
      
      // Major vertical grid lines
      const timeGridLines = Math.min(12, data.length);
      for (let i = 0; i <= timeGridLines; i++) {
        const x = padding + (width - padding - rightPadding) * i / timeGridLines;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, chartHeight - padding);
        ctx.stroke();
      }

      // Minor grid lines
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 0.1;
      for (let i = 0; i <= 16; i++) {
        const y = padding + (chartHeight - padding * 2) * i / 16;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - rightPadding, y);
        ctx.stroke();
      }
    }

    // Draw professional price scale
    ctx.fillStyle = '#64748B';
    ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'left';
    
    // Right-side price labels (TradingView style)
    for (let i = 0; i <= 8; i++) {
      const price = maxPrice + pricePadding - (priceRange + pricePadding * 2) * i / 8;
      const y = padding + (chartHeight - padding * 2) * i / 8;
      
      // Price background
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(width - rightPadding + 2, y - 8, rightPadding - 4, 16);
      
      // Price text
      ctx.fillStyle = '#94A3B8';
      ctx.fillText(price.toFixed(2), width - rightPadding + 8, y + 4);
    }

    // Time labels at bottom
    ctx.fillStyle = '#64748B';
    ctx.textAlign = 'center';
    for (let i = 0; i < data.length; i += Math.max(1, Math.floor(data.length / 8))) {
      const x = padding + i * candleSpacing + candleSpacing / 2;
      const time = new Date(data[i].timestamp).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      ctx.fillText(time, x, chartHeight - 5);
    }

    // Calculate technical indicators
    const sma20 = indicators.find(i => i.name === 'SMA(20)')?.enabled ? calculateSMA(data, 20) : [];
    const ema50 = indicators.find(i => i.name === 'EMA(50)')?.enabled ? calculateEMA(data, 50) : [];

    // Draw technical indicators first (behind candles)
    if (sma20.length > 0) {
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      sma20.forEach((value, index) => {
        if (!isNaN(value)) {
          const x = padding + index * candleSpacing + candleSpacing / 2;
          const y = priceToY(value);
          if (index === 0 || isNaN(sma20[index - 1])) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.stroke();
    }

    if (ema50.length > 0) {
      ctx.strokeStyle = '#FF6B6B';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ema50.forEach((value, index) => {
        if (!isNaN(value)) {
          const x = padding + index * candleSpacing + candleSpacing / 2;
          const y = priceToY(value);
          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.stroke();
    }

    // Draw professional candlesticks
    data.forEach((candle, index) => {
      const x = padding + index * candleSpacing + candleSpacing / 2;
      const openY = priceToY(candle.open);
      const highY = priceToY(candle.high);
      const lowY = priceToY(candle.low);
      const closeY = priceToY(candle.close);

      const isGreen = candle.close > candle.open;
      const greenColor = '#22C55E';
      const redColor = '#EF4444';
      const color = isGreen ? greenColor : redColor;
      
      // Draw wick (high-low line)
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Draw candle body
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.abs(closeY - openY) || 0.5;
      
      if (isGreen) {
        // Hollow green candle
        ctx.strokeStyle = greenColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
      } else {
        // Filled red candle
        ctx.fillStyle = redColor;
        ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
      }

      // Draw volume bars if enabled
      if (showVolume) {
        const volumeBarHeight = (candle.volume / maxVolume) * volumeHeight;
        const volumeY = chartHeight + 5 + volumeHeight - volumeBarHeight;
        
        ctx.fillStyle = isGreen ? greenColor + '40' : redColor + '40';
        ctx.fillRect(
          x - candleWidth / 2,
          volumeY,
          candleWidth,
          volumeBarHeight
        );
      }
    });

    // Draw current price line (TradingView style)
    if (data.length > 0) {
      const lastPrice = data[data.length - 1].close;
      const lastPriceY = priceToY(lastPrice);
      const prevPrice = data.length > 1 ? data[data.length - 2].close : lastPrice;
      const isUp = lastPrice > prevPrice;
      const priceColor = isUp ? '#22C55E' : '#EF4444';
      
      // Price line
      ctx.strokeStyle = priceColor;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 2]);
      ctx.beginPath();
      ctx.moveTo(padding, lastPriceY);
      ctx.lineTo(width - rightPadding, lastPriceY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Current price label (right side)
      ctx.fillStyle = priceColor;
      ctx.fillRect(width - rightPadding + 2, lastPriceY - 10, rightPadding - 4, 20);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(lastPrice.toFixed(2), width - rightPadding + 8, lastPriceY + 3);
    }

    // Draw volume scale if enabled
    if (showVolume) {
      ctx.fillStyle = '#64748B';
      ctx.font = '10px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'left';
      
      // Volume scale on right
      for (let i = 0; i <= 3; i++) {
        const volume = maxVolume * (i + 1) / 4;
        const y = chartHeight + 5 + volumeHeight - (volumeHeight * (i + 1) / 4);
        const volumeText = volume >= 1000000 ? `${(volume / 1000000).toFixed(1)}M` : 
                          volume >= 1000 ? `${(volume / 1000).toFixed(0)}K` : 
                          volume.toFixed(0);
        
        // Volume label background
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(width - rightPadding + 2, y - 6, rightPadding - 4, 12);
        
        ctx.fillStyle = '#94A3B8';
        ctx.fillText(volumeText, width - rightPadding + 8, y + 2);
      }

      // Volume separator line
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padding, chartHeight + 5);
      ctx.lineTo(width - rightPadding, chartHeight + 5);
      ctx.stroke();
    }

    // Draw chart borders
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(padding, padding, width - padding - rightPadding, chartHeight - padding * 2);
    
    if (showVolume) {
      ctx.strokeRect(padding, chartHeight + 5, width - padding - rightPadding, volumeHeight);
    }

  }, [data, width, height, showVolume, showGrid, zoom, pan, indicators, calculateSMA, calculateEMA]);

  return (
    <div className="relative w-full h-full bg-slate-900 rounded-lg overflow-hidden">
      {/* TradingView-style Toolbar */}
      <div className="absolute top-0 left-0 right-0 bg-slate-800 border-b border-slate-600 p-2 z-10">
        <div className="flex items-center justify-between">
          {/* Symbol and Timeframe */}
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-bold text-white">
              {symbol} · {timeframe}
            </h3>
            {data && Array.isArray(data) && data.length > 0 && (
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-400">Last:</span>
                <span className="text-green-400 font-semibold">
                  ${data[data.length - 1].close.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* Drawing Tools */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => activateDrawingTool('trendline')}
              className={`p-2 rounded ${drawingTools.find(t => t.type === 'trendline')?.active ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'} transition-colors`}
              title="Trend Line"
            >
              <TrendingUp className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={() => activateDrawingTool('horizontal')}
              className={`p-2 rounded ${drawingTools.find(t => t.type === 'horizontal')?.active ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'} transition-colors`}
              title="Horizontal Line"
            >
              <Minus className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={() => activateDrawingTool('rectangle')}
              className={`p-2 rounded ${drawingTools.find(t => t.type === 'rectangle')?.active ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'} transition-colors`}
              title="Rectangle"
            >
              <Square className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={() => activateDrawingTool('text')}
              className={`p-2 rounded ${drawingTools.find(t => t.type === 'text')?.active ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'} transition-colors`}
              title="Text"
            >
              <Type className="w-4 h-4 text-white" />
            </button>

            <div className="w-px h-6 bg-slate-600 mx-2"></div>

            {/* Zoom Controls */}
            <button
              onClick={() => setZoom(prev => Math.min(prev * 1.2, 5))}
              className="p-2 rounded bg-slate-700 hover:bg-slate-600 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={() => setZoom(prev => Math.max(prev / 1.2, 0.2))}
              className="p-2 rounded bg-slate-700 hover:bg-slate-600 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
              className="p-2 rounded bg-slate-700 hover:bg-slate-600 transition-colors"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4 text-white" />
            </button>

            <div className="w-px h-6 bg-slate-600 mx-2"></div>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded bg-slate-700 hover:bg-slate-600 transition-colors"
              title="Toggle Fullscreen"
            >
              <Maximize2 className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Indicators Panel */}
        <div className="flex items-center space-x-4 mt-2">
          {indicators.map((indicator, index) => (
            <button
              key={indicator.name}
              onClick={() => {
                const newIndicators = [...indicators];
                newIndicators[index].enabled = !newIndicators[index].enabled;
                setIndicators(newIndicators);
              }}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                indicator.enabled 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
              }`}
            >
              <span style={{ color: indicator.enabled ? '#ffffff' : indicator.color }}>
                ● {indicator.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="pt-20">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair"
          style={{ width: `${width}px`, height: `${height}px` }}
        />
      </div>

      {/* Status Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-600 p-2">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-4">
            <span>Data: {data && Array.isArray(data) ? data.length : 0} candles</span>
            <span>Zoom: {(zoom * 100).toFixed(0)}%</span>
            <span>Timeframe: {timeframe}</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Session: Market Closed</span>
            <span>Last Update: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}