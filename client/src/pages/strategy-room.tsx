import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { EmojiSentiment, QuickSentiment, SentimentTrend, RiskSentiment, type SentimentData } from '@/components/EmojiSentiment';
import { LivePrice } from '@/components/LivePrice';
import { 
  Target,
  TrendingUp,
  Brain,
  Clock,
  DollarSign,
  TrendingDown,
  Activity,
  Calendar,
  BarChart3,
  Shield,
  Eye,
  Zap,
  Plus,
  MessageSquare,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Analysis List Item Component
interface AnalysisListItemProps {
  analysis: StrategyAnalysis;
  livePrice: number | null;
  priceChange: number;
  targetStatuses: boolean[];
}

function AnalysisListItem({ analysis, livePrice, priceChange, targetStatuses }: AnalysisListItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getRiskRewardColor = (ratio: number) => {
    if (ratio >= 3) return 'text-green-400';    // Excellent: 3:1 or better
    if (ratio >= 2) return 'text-blue-400';     // Qualified: 2:1 or better  
    return 'text-red-400';                      // High Risk: Below 2:1
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-400';
    if (confidence >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-600/50 overflow-hidden">
      {/* Analysis Header - Always Visible */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-700/30 transition-colors duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <h5 className="font-semibold text-white text-lg">{analysis.symbol}</h5>
              <span className={`text-xs px-2 py-1 rounded-full ${
                analysis.hasOptions 
                  ? 'bg-green-700 text-green-200' 
                  : 'bg-blue-700 text-blue-200'
              }`}>
                {analysis.hasOptions ? 'Options' : 'Multi-Brain'}
              </span>
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <span className="text-gray-400 text-xs">Entry</span>
                <div className="text-white font-medium">${analysis.currentPrice}</div>
              </div>
              
              <div className="text-center">
                <span className="text-gray-400 text-xs">Live Price</span>
                <div className={`font-medium ${livePrice ? (priceChange >= 0 ? 'text-green-400' : 'text-red-400') : 'text-gray-400'}`}>
                  ${livePrice?.toFixed(2) || 'Loading...'}
                </div>
                {livePrice && (
                  <QuickSentiment
                    data={{
                      price: livePrice,
                      change: priceChange,
                      changePercent: priceChange,
                      confidence: analysis.confidence
                    }}
                    className="mt-1"
                  />
                )}
              </div>
              
              <div className="text-center">
                <span className="text-gray-400 text-xs">R:R</span>
                <div className={`font-medium ${getRiskRewardColor(analysis.riskReward)}`}>
                  {analysis.riskReward.toFixed(1)}:1
                </div>
                <RiskSentiment 
                  riskReward={analysis.riskReward} 
                  confidence={analysis.confidence}
                />
              </div>

              <div className="text-center">
                <span className="text-gray-400 text-xs">Confidence</span>
                <div className={`font-medium ${getConfidenceColor(analysis.confidence)}`}>
                  {analysis.confidence}%
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">
              {analysis.targets.length} targets
            </span>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-gray-600/50 p-4 bg-gray-800/30">
          <div className="space-y-6">
            
            {/* Overview Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-900/20 rounded-lg border border-green-500/30">
                <DollarSign className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <p className="text-sm text-emerald-200">Entry Price</p>
                <p className="text-xl font-bold text-white">${analysis.currentPrice}</p>
              </div>
              
              <div className="text-center p-4 bg-red-900/20 rounded-lg border border-red-500/30">
                <Shield className="w-6 h-6 text-red-400 mx-auto mb-2" />
                <p className="text-sm text-rose-200">Stop Loss</p>
                <p className="text-xl font-bold text-white">${analysis.stopLoss.price}</p>
                <p className="text-sm text-red-400">-{analysis.stopLoss.percentage}%</p>
              </div>
              
              <div className="text-center p-4 bg-purple-900/20 rounded-lg border border-purple-500/30">
                <BarChart3 className={`w-6 h-6 mx-auto mb-2 ${getRiskRewardColor(analysis.riskReward)}`} />
                <p className="text-sm text-amber-200">Risk/Reward</p>
                <p className={`text-xl font-bold ${getRiskRewardColor(analysis.riskReward)}`}>
                  {analysis.riskReward.toFixed(1)}:1
                </p>
                {analysis.riskReward >= 1.8 ? (
                  <p className="text-xs text-green-400">✓ Qualified</p>
                ) : (
                  <p className="text-xs text-red-400">⚠ High Risk</p>
                )}
              </div>
            </div>

            {/* Options Flow (if available) */}
            {analysis.hasOptions && analysis.optionsFlow && (
              <div className="space-y-3">
                <h6 className="text-sm font-medium text-blue-300 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Options Flow Analysis
                </h6>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-green-900/20 rounded-lg border border-green-500/30">
                    <p className="text-sm text-emerald-200">Call Volume</p>
                    <p className="text-lg font-bold text-green-400">{analysis.optionsFlow.callVolume.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-3 bg-red-900/20 rounded-lg border border-red-500/30">
                    <p className="text-sm text-rose-200">Put Volume</p>
                    <p className="text-lg font-bold text-red-400">{analysis.optionsFlow.putVolume.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-3 bg-purple-900/20 rounded-lg border border-purple-500/30">
                    <p className="text-sm text-violet-200">Implied Volatility</p>
                    <p className="text-lg font-bold text-purple-400">{analysis.optionsFlow.impliedVolatility}%</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
                    <p className="text-sm text-amber-200">Unusual Activity</p>
                    <p className="text-lg font-bold text-yellow-400">
                      {analysis.optionsFlow.unusualActivity ? 'YES' : 'NO'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Profit Targets */}
            <div className="space-y-3">
              <h6 className="text-sm font-medium text-green-300 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Profit Targets & Probabilities
              </h6>
              <div className="space-y-2">
                {analysis.targets.map((target, index) => (
                  <div key={index} className="p-3 bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-lg border border-green-500/30">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-sm">
                      <div className="text-center">
                        <span className="text-gray-400 text-xs block">Target {index + 1}</span>
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-green-400 font-medium">${target.target}</span>
                          {targetStatuses[index] ? (
                            <span className="text-green-400 text-xs">✓</span>
                          ) : (
                            <span className="text-gray-500 text-xs">○</span>
                          )}
                        </div>
                        <EmojiSentiment
                          data={{
                            price: target.target,
                            change: target.gainPercentage,
                            changePercent: target.gainPercentage,
                            confidence: target.probability
                          }}
                          size="sm"
                          className="mt-1"
                        />
                      </div>
                      <div className="text-center">
                        <span className="text-gray-400 text-xs block">Probability</span>
                        <span className="text-white font-medium">{target.probability}%</span>
                      </div>
                      <div className="text-center">
                        <span className="text-gray-400 text-xs block">Gain</span>
                        <span className="text-green-400 font-medium">+{target.gainPercentage}%</span>
                      </div>
                      <div className="text-center">
                        <span className="text-gray-400 text-xs block">Expected Date</span>
                        <span className="text-orange-100 text-xs">{target.expectedDate}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-gray-400 text-xs block">Hold Time</span>
                        <span className="text-purple-100 text-xs">{target.holdTime}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-gray-400 text-xs block">Strategy</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          targetStatuses[index] 
                            ? 'bg-green-600/30 text-green-200' 
                            : 'bg-blue-600/20 text-blue-300'
                        }`}>
                          {targetStatuses[index] ? '✓ HIT' : target.exitStrategy}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-300 mt-2">{target.reasoning}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Stop Loss Section */}
            <div className="space-y-3">
              <h6 className="text-sm font-medium text-red-300 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Risk Management
              </h6>
              <div className={`p-3 bg-gradient-to-r rounded-lg border ${
                livePrice && livePrice <= analysis.stopLoss.price 
                  ? 'from-red-900/40 to-orange-900/40 border-red-400/50 ring-2 ring-red-500/50' 
                  : 'from-red-900/20 to-orange-900/20 border-red-500/30'
              }`}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="text-center">
                    <span className="text-gray-400 text-xs block">Stop Loss</span>
                    <span className="text-red-400 font-medium text-lg">${analysis.stopLoss.price}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-gray-400 text-xs block">Risk %</span>
                    <span className="text-red-400 font-medium">-{analysis.stopLoss.percentage}%</span>
                  </div>
                  <div className="text-center">
                    <span className="text-gray-400 text-xs block">Distance</span>
                    <span className="text-red-300">-${(analysis.currentPrice - analysis.stopLoss.price).toFixed(2)}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-gray-400 text-xs block">Status</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      livePrice && livePrice <= analysis.stopLoss.price
                        ? 'bg-red-600/50 text-red-200 ring-2 ring-red-500/50'
                        : 'bg-red-600/20 text-red-300'
                    }`}>
                      {livePrice && livePrice <= analysis.stopLoss.price ? '⚠ STOP HIT' : 'Active'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-300 mt-2">{analysis.stopLoss.reasoning}</p>
              </div>
            </div>

            {/* Strategy & Team Analysis */}
            <div className="space-y-3">
              <h6 className="text-sm font-medium text-purple-300 flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Strategy & Team Analysis
              </h6>
              <div className="p-3 bg-purple-900/20 rounded-lg border border-purple-500/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400 text-xs block">Strategy</span>
                    <span className="text-white">{analysis.strategy}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs block">Team Consensus</span>
                    <span className="text-purple-200">{analysis.teamConsensus}</span>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-gray-400 text-xs block">Detailed Analysis</span>
                  <p className="text-white text-sm">{analysis.explanation}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-gray-600/30 flex gap-2">
              <button className="text-green-400 hover:text-green-300 text-sm px-3 py-1 rounded bg-green-400/10 hover:bg-green-400/20 transition-colors">
                Add to Auto-Trading
              </button>
              <button className="text-blue-400 hover:text-blue-300 text-sm px-3 py-1 rounded bg-blue-400/10 hover:bg-blue-400/20 transition-colors">
                View Chart
              </button>
              <button className="text-yellow-400 hover:text-yellow-300 text-sm px-3 py-1 rounded bg-yellow-400/10 hover:bg-yellow-400/20 transition-colors">
                Modify Analysis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Scan Result List Item Component
interface ScanResultListItemProps {
  symbol: string;
  isSelected: boolean;
  onAnalyze: (symbol: string) => void;
}

function ScanResultListItem({ symbol, isSelected, onAnalyze }: ScanResultListItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [marketData, setMarketData] = useState<any>(null);
  
  // Fetch market data for this symbol when expanded
  useEffect(() => {
    if (isExpanded && !marketData) {
      fetch(`/api/market-data/${symbol}`)
        .then(res => res.json())
        .then(data => setMarketData(data))
        .catch(err => console.error('Failed to fetch market data:', err));
    }
  }, [isExpanded, symbol, marketData]);

  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-600/50 overflow-hidden">
      {/* Symbol Header - Always Visible */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-700/30 transition-colors duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <h5 className="font-semibold text-white text-lg">{symbol}</h5>
              {isSelected && (
                <span className="text-xs px-2 py-1 rounded-full bg-purple-700 text-purple-200">
                  Selected
                </span>
              )}
            </div>
            
            {marketData && (
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <span className="text-gray-400 text-xs">Price</span>
                  <div className="text-white font-medium">${marketData.price?.toFixed(2) || 'N/A'}</div>
                </div>
                
                <div className="text-center">
                  <span className="text-gray-400 text-xs">Change</span>
                  <div className={`font-medium ${marketData.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {marketData.changePercent >= 0 ? '+' : ''}{marketData.changePercent?.toFixed(2) || 'N/A'}%
                  </div>
                  <SentimentTrend 
                    data={{
                      price: marketData.price,
                      change: marketData.changePercent,
                      changePercent: marketData.changePercent,
                      volume: marketData.volume,
                      trend: marketData.changePercent >= 2 ? 'bullish' : marketData.changePercent <= -2 ? 'bearish' : 'neutral'
                    }}
                    className="mt-1"
                  />
                </div>
                
                <div className="text-center">
                  <span className="text-gray-400 text-xs">Volume</span>
                  <div className="text-blue-400 font-medium">
                    {marketData.volume ? (marketData.volume / 1000000).toFixed(1) + 'M' : 'N/A'}
                  </div>
                  {marketData.volume && (
                    <EmojiSentiment
                      data={{
                        price: marketData.price,
                        change: marketData.changePercent,
                        changePercent: marketData.changePercent,
                        volume: marketData.volume
                      }}
                      size="sm"
                      className="mt-1"
                    />
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onAnalyze(symbol);
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2"
            >
              Analyze
            </Button>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-gray-600/50 p-4 bg-gray-800/30">
          {marketData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
                <p className="text-sm text-blue-200">Current Price</p>
                <p className="text-lg font-bold text-white">${marketData.price?.toFixed(2) || 'N/A'}</p>
              </div>
              <div className="text-center p-3 bg-green-900/20 rounded-lg border border-green-500/30">
                <p className="text-sm text-emerald-200">Day Change</p>
                <p className={`text-lg font-bold ${marketData.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {marketData.changePercent >= 0 ? '+' : ''}{marketData.changePercent?.toFixed(2) || 'N/A'}%
                </p>
              </div>
              <div className="text-center p-3 bg-purple-900/20 rounded-lg border border-purple-500/30">
                <p className="text-sm text-violet-200">Volume</p>
                <p className="text-lg font-bold text-purple-400">
                  {marketData.volume ? (marketData.volume / 1000000).toFixed(1) + 'M' : 'N/A'}
                </p>
              </div>
              <div className="text-center p-3 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
                <p className="text-sm text-amber-200">Market Cap</p>
                <p className="text-lg font-bold text-yellow-400">
                  {marketData.marketCap ? '$' + (marketData.marketCap / 1000000000).toFixed(1) + 'B' : 'N/A'}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-gray-400 text-sm">Loading market data...</p>
            </div>
          )}
          
          <div className="mt-4 pt-3 border-t border-gray-600/30 flex gap-2">
            <Button
              size="sm"
              onClick={() => onAnalyze(symbol)}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Full Analysis
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-blue-400 border-blue-400/50 hover:bg-blue-400/10"
            >
              View Chart
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-green-400 border-green-400/50 hover:bg-green-400/10"
            >
              Quick Add
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Trade List Item Component
interface TradeListItemProps {
  trade: any;
}

function TradeListItem({ trade }: TradeListItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'completed': return 'text-blue-400';
      case 'stopped': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getRiskRewardColor = (ratio: number) => {
    if (ratio >= 3) return 'text-green-400';
    if (ratio >= 2) return 'text-blue-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-600/50 overflow-hidden">
      {/* Trade Header - Always Visible */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-700/30 transition-colors duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <h5 className="font-semibold text-white text-lg">{trade.symbol}</h5>
              <span className={`text-xs px-2 py-1 rounded-full bg-gray-700 ${getStatusColor('active')}`}>
                Active
              </span>
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <span className="text-gray-400 text-xs">Entry</span>
                <div className="text-white font-medium">${trade.entryPrice?.toFixed(2) || 'N/A'}</div>
              </div>
              
              <div className="text-center">
                <span className="text-gray-400 text-xs">Live Price</span>
                <div className={`font-medium ${trade.livePrice ? (trade.priceChange >= 0 ? 'text-green-400' : 'text-red-400') : 'text-gray-400'}`}>
                  ${trade.livePrice?.toFixed(2) || 'Loading...'}
                </div>
                {trade.livePrice && (
                  <div className={`text-xs ${trade.priceChange >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                    {trade.priceChange >= 0 ? '+' : ''}{trade.priceChange.toFixed(2)}%
                  </div>
                )}
              </div>
              
              <div className="text-center">
                <span className="text-gray-400 text-xs">Target</span>
                <div className="text-yellow-400 font-medium">
                  ${trade.targets?.[trade.currentTargetIndex || 0]?.toFixed(2) || 'N/A'}
                </div>
              </div>
              
              <div className="text-center">
                <span className="text-gray-400 text-xs">R:R</span>
                <div className={`font-medium ${getRiskRewardColor(trade.riskReward || 0)}`}>
                  {(trade.riskReward || 0).toFixed(1)}:1
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">
              {trade.currentTargetIndex || 0}/{trade.targets?.length || 0} targets
            </span>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-gray-600/50 p-4 bg-gray-800/30">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Entry Details */}
            <div className="space-y-3">
              <h6 className="text-sm font-medium text-blue-300 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Entry Details
              </h6>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Entry Price:</span>
                  <span className="text-white">${trade.entryPrice?.toFixed(2) || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Entry Time:</span>
                  <span className="text-white">{trade.entryTime || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Position Size:</span>
                  <span className="text-white">{trade.positionSize || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Targets */}
            <div className="space-y-3">
              <h6 className="text-sm font-medium text-yellow-300 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Profit Targets
              </h6>
              <div className="space-y-2 text-sm">
                {trade.targets?.map((target: number, index: number) => (
                  <div key={index} className="flex justify-between">
                    <span className={`${index <= (trade.currentTargetIndex || 0) ? 'text-green-400' : 'text-gray-400'}`}>
                      Target {index + 1}:
                    </span>
                    <span className={`${index <= (trade.currentTargetIndex || 0) ? 'text-green-400' : 'text-white'}`}>
                      ${target.toFixed(2)}
                    </span>
                  </div>
                )) || <span className="text-gray-400">No targets set</span>}
              </div>
            </div>

            {/* Risk Management */}
            <div className="space-y-3">
              <h6 className="text-sm font-medium text-red-300 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Risk Management
              </h6>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Stop Loss:</span>
                  <span className="text-red-400">${trade.stopLoss?.toFixed(2) || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Risk Amount:</span>
                  <span className="text-red-400">{trade.riskPercentage?.toFixed(1) || 'N/A'}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Max Reward:</span>
                  <span className="text-green-400">{trade.maxRewardPercentage?.toFixed(1) || 'N/A'}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 pt-3 border-t border-gray-600/30 flex gap-2">
            <button className="text-blue-400 hover:text-blue-300 text-sm px-3 py-1 rounded bg-blue-400/10 hover:bg-blue-400/20 transition-colors">
              View Chart
            </button>
            <button className="text-yellow-400 hover:text-yellow-300 text-sm px-3 py-1 rounded bg-yellow-400/10 hover:bg-yellow-400/20 transition-colors">
              Modify Targets
            </button>
            <button className="text-red-400 hover:text-red-300 text-sm px-3 py-1 rounded bg-red-400/10 hover:bg-red-400/20 transition-colors">
              Close Trade
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface StrategyAnalysis {
  symbol: string;
  hasOptions: boolean;
  currentPrice: number;
  optionsFlow?: {
    callVolume: number;
    putVolume: number;
    impliedVolatility: number;
    unusualActivity: boolean;
    majorStrikes: Array<{
      strike: number;
      expiration: string;
      volume: number;
      openInterest: number;
    }>;
  };
  targets: Array<{
    target: number;
    probability: number;
    expectedDate: string;
    gainPercentage: number;
    holdTime: string;
    exitStrategy: string;
    reasoning: string;
  }>;
  stopLoss: {
    price: number;
    percentage: number;
    reasoning: string;
  };
  riskReward: number;
  analysisBy: string[];
  confidence: number;
  overallStrategy: string;
}

export default function StrategyRoomPage() {
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('custom');
  const [scanResults, setScanResults] = useState<string[]>([]);
  const [customStartDate, setCustomStartDate] = useState('2025-07-20T16:40');
  const [customEndDate, setCustomEndDate] = useState('2025-07-20T09:25');
  const [customScanResults, setCustomScanResults] = useState<string[]>([]);
  const [isCustomScanning, setIsCustomScanning] = useState(false);
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [targetStatuses, setTargetStatuses] = useState<{ [key: number]: boolean }>({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const queryClient = useQueryClient();

  const { data: analytics } = useQuery({
    queryKey: ['/api/analytics'],
    refetchInterval: 30000
  });

  const { data: preMarketScan } = useQuery({
    queryKey: ['/api/scanner/pre-market', selectedPeriod],
    enabled: selectedPeriod !== '' && selectedPeriod !== 'custom',
    refetchInterval: 60000
  });

  // Custom historical scan mutation
  const customScanMutation = useMutation({
    mutationFn: async () => {
      const [startDate, startTime] = customStartDate.split('T');
      const [endDate, endTime] = customEndDate.split('T');
      
      const response = await fetch('/api/scanner/pre-market/historical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          date: startDate, 
          time: startTime, 
          endDate: endDate,
          endTime: endTime,
          useRange: true
        }),
      });
      return response.json();
    },
    onMutate: () => setIsCustomScanning(true),
    onSettled: () => setIsCustomScanning(false),
    onSuccess: (data) => {
      setCustomScanResults(data.opportunities?.map((opp: any) => opp.symbol) || []);
    },
  });

  const strategyAnalysisMutation = useMutation({
    mutationFn: async (symbol: string) => {
      return apiRequest('POST', `/api/strategy/analyze/${symbol}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/strategy'] });
    }
  });

  // Auto-select top 2 trades mutation
  const autoSelectMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/auto-trading/auto-select', {});
    },
    onSuccess: (data) => {
      if (data.success) {
        // Show success message and refresh active trades
        queryClient.invalidateQueries({ queryKey: ['/api/auto-trading/active'] });
      }
    }
  });

  // Add trade to auto-trading mutation
  const addToAutoTradingMutation = useMutation({
    mutationFn: async (analysis: any) => {
      return apiRequest('POST', '/api/auto-trading/add-trade', { analysis });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auto-trading/active'] });
    }
  });

  // Strategy Room auto-signal generation mutation
  const autoGenerateMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/strategy-room/auto-generate', {});
    },
    onSuccess: (data) => {
      if (data.success) {
        // Refresh signals and analytics
        queryClient.invalidateQueries({ queryKey: ['/api/signals'] });
        queryClient.invalidateQueries({ queryKey: ['/api/analytics'] });
        setAutoSignalCount(prev => prev + 1);
      }
    }
  });

  const [autoSignalCount, setAutoSignalCount] = useState(0);

  // Get active auto-trades
  const { data: activeTrades } = useQuery({
    queryKey: ['/api/auto-trading/active'],
    refetchInterval: 10000 // Update every 10 seconds
  });

  const { data: currentAnalysis, isLoading: analysisLoading } = useQuery({
    queryKey: ['/api/strategy/analysis', selectedSymbol],
    enabled: selectedSymbol !== '',
    refetchInterval: 30000
  });

  // Live price tracking for selected symbol
  const { data: livePriceData } = useQuery({
    queryKey: ['/api/market-data', selectedSymbol],
    enabled: selectedSymbol !== '',
    refetchInterval: 5000, // Update every 5 seconds
    select: (data: any) => {
      if (data && Array.isArray(data) && data.length > 0) {
        const symbolData = data.find((item: any) => item.symbol === selectedSymbol);
        return symbolData ? {
          price: symbolData.price,
          change: symbolData.change,
          changePercent: symbolData.changePercent
        } : null;
      }
      return null;
    }
  });

  const handleAnalyzeSymbol = (symbol: string) => {
    setSelectedSymbol(symbol);
    setTargetStatuses({}); // Reset target statuses
    setLivePrice(null);
    setPriceChange(0);
    strategyAnalysisMutation.mutate(symbol);
  };

  const handleAutoSelect = () => {
    autoSelectMutation.mutate();
  };

  const handleAddToAutoTrading = () => {
    if (analysis) {
      addToAutoTradingMutation.mutate(analysis);
    }
  };

  const analysis = currentAnalysis as StrategyAnalysis | undefined;

  // Update live price and check target statuses
  useEffect(() => {
    if (livePriceData && analysis) {
      const newPrice = livePriceData.price;
      setLivePrice(newPrice);
      setPriceChange(livePriceData.changePercent || 0);
      
      // Check which targets have been cleared
      const newTargetStatuses: { [key: number]: boolean } = {};
      analysis.targets.forEach((target, index) => {
        newTargetStatuses[index] = newPrice >= target.target;
      });
      setTargetStatuses(newTargetStatuses);
    }
  }, [livePriceData, analysis]);

  return (
    <div className="min-h-screen bg-black text-gray-100">
      <Header analytics={analytics} />
      <div className="flex">
        <Sidebar 
          isCollapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
        <main className="flex-1 p-8 space-y-6" style={{background: 'linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #1a1a1a 100%)'}}>
          
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-purple-900/20 to-blue-900/20 p-6 rounded-lg border border-gray-800/50 backdrop-blur-md">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
                <Target className="w-8 h-8 text-purple-400" />
                Strategy Room - Trade Designer
              </h1>
              <p className="text-gray-300 mt-2">
                Design high-probability trades with minimum 2:1 risk-to-reward ratios for optimal capital efficiency
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge className="bg-green-600/30 text-green-200 border-green-500/50">
                <Shield className="w-4 h-4 mr-2" />
                2:1 Min R:R Enforced
              </Badge>
              <Badge className="bg-purple-600/20 text-purple-300 border-purple-500/30">
                <Brain className="w-4 h-4 mr-2" />
                Multi-AI Analysis
              </Badge>
              <Badge className="bg-blue-600/20 text-blue-300 border-blue-500/30">
                <Activity className="w-4 h-4 mr-2" />
                Options Flow
              </Badge>
            </div>
          </div>

          {/* Scanner Integration - Full Width */}
          <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Eye className="w-5 h-5 text-green-400" />
                Pre-Market Scanner Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-10">
              {/* Spacious custom date controls */}
              <div className="space-y-8">
                <div className="text-center pb-4 border-b border-blue-400/30">
                  <h3 className="text-2xl font-semibold text-blue-200 mb-3">Custom Time Range Scanner</h3>
                  <p className="text-lg text-cyan-100">Set your exact date and time range for historical analysis</p>
                </div>
                
                {/* Large Date Range Section */}
                <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-2xl border-2 border-blue-500/40 p-12">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <label className="text-xl font-medium text-emerald-200 flex items-center gap-3">
                        <Calendar className="w-6 h-6 text-emerald-400" />
                        Start Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        className="w-full bg-gray-800/90 border-2 border-blue-500/50 text-white text-xl rounded-2xl px-6 py-5 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all duration-200"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        step="300"
                      />
                      <p className="text-base text-gray-300 pl-3">When to start scanning from</p>
                    </div>
                    
                    <div className="space-y-6">
                      <label className="text-xl font-medium text-emerald-200 flex items-center gap-3">
                        <Calendar className="w-6 h-6 text-emerald-400" />
                        End Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        className="w-full bg-gray-800/90 border-2 border-blue-500/50 text-white text-xl rounded-2xl px-6 py-5 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all duration-200"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        step="300"
                      />
                      <p className="text-base text-gray-300 pl-3">When to stop scanning</p>
                    </div>
                  </div>
                </div>
                
                {/* Large Controls Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1 space-y-6">
                    <label className="text-xl font-medium text-amber-200 flex items-center gap-3">
                      <Clock className="w-6 h-6 text-amber-400" />
                      Quick Periods
                    </label>
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                      <SelectTrigger className="bg-gray-800/80 border-gray-600 text-white h-16 text-xl rounded-2xl">
                        <SelectValue placeholder="Choose a preset period" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="1h">Last 1 Hour</SelectItem>
                        <SelectItem value="4h">Last 4 Hours</SelectItem>
                        <SelectItem value="1d">Last 1 Day</SelectItem>
                        <SelectItem value="3d">Last 3 Days</SelectItem>
                        <SelectItem value="1w">Last 1 Week</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="lg:col-span-2 space-y-6">
                    <label className="text-xl font-medium text-violet-200 flex items-center gap-3">
                      <Zap className="w-6 h-6 text-violet-400" />
                      Execute Scan
                    </label>
                    <Button 
                      onClick={() => {
                        if (selectedPeriod === 'custom') {
                          customScanMutation.mutate();
                        } else {
                          setScanResults(preMarketScan?.symbols || []);
                        }
                      }}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white w-full h-16 text-xl font-semibold rounded-2xl transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/25"
                      disabled={!selectedPeriod || (selectedPeriod === 'custom' && isCustomScanning)}
                    >
                      {isCustomScanning ? 'Scanning Custom Range...' : selectedPeriod === 'custom' ? 'Scan Custom Range' : 'Scan Quick Period'}
                    </Button>
                  </div>
                </div>
              </div>
                
              {((selectedPeriod === 'custom' && customScanResults.length > 0) || (selectedPeriod !== 'custom' && preMarketScan?.symbols)) && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-sky-200">
                        Found {selectedPeriod === 'custom' ? customScanResults.length : preMarketScan?.symbols?.length || 0} opportunities • Period: {selectedPeriod === 'custom' ? `${customStartDate.split('T')[0]} ${customStartDate.split('T')[1]} to ${customEndDate.split('T')[0]} ${customEndDate.split('T')[1]}` : selectedPeriod}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-amber-300">
                          Click rows to expand • Click Analyze for full analysis
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/scanner/pre-market', selectedPeriod] })}
                          className="h-6 px-2 text-xs hover:bg-gray-700/50"
                        >
                          🔄 Refresh
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {(selectedPeriod === 'custom' ? customScanResults : preMarketScan.symbols).map((symbol: string) => (
                        <ScanResultListItem
                          key={symbol}
                          symbol={symbol}
                          isSelected={selectedSymbol === symbol}
                          onAnalyze={(sym) => {
                            setSelectedSymbol(sym);
                            handleAnalyzeSymbol(sym);
                          }}
                        />
                      ))}
                    </div>
                    
                    <div className="text-xs text-slate-300 text-center pt-2 border-t border-gray-600/30">
                      Last updated: {new Date().toLocaleTimeString()}
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Manual Symbol Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Input
                    placeholder="Enter symbol (e.g., AAPL, TSLA)"
                    value={selectedSymbol}
                    onChange={(e) => setSelectedSymbol(e.target.value.toUpperCase())}
                    className="flex-1 bg-gray-800/50 border-gray-700 text-white"
                  />
                  <Button 
                    onClick={() => selectedSymbol && handleAnalyzeSymbol(selectedSymbol)}
                    disabled={!selectedSymbol || strategyAnalysisMutation.isPending}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {strategyAnalysisMutation.isPending ? 'Analyzing...' : 'Analyze'}
                  </Button>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-indigo-200">
                    Enter any symbol for comprehensive strategy analysis with profit targets and risk assessment
                  </p>
                  <div className="flex flex-wrap gap-3 text-xs">
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-900/30 rounded border border-green-500/30">
                      <span className="text-green-300">⚡ Options:</span>
                      <span className="text-emerald-200">AAPL, TSLA, NVDA, SPY, QQQ</span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-900/30 rounded border border-blue-500/30">
                      <span className="text-blue-300">🧠 Multi-Brain:</span>
                      <span className="text-sky-200">MULN, PROG, RIDE, ATER</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Auto-Trading System */}
          <Card className="bg-gradient-to-r from-green-900/30 to-blue-900/30 border-green-500/40 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Zap className="w-6 h-6 text-green-400" />
                Auto-Trading System
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg text-cyan-100">
                Automatically analyze and select the top 2 opportunities ranked by Volume Sensitivity Score: (Change% × (1 + Gap%/100)) / (RVOL ^ 0.5)
              </p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    <Button 
                      className="bg-green-600/90 hover:bg-green-500 text-white px-8 py-4 text-lg font-medium rounded-xl transition-all duration-200 flex items-center gap-3"
                      onClick={handleAutoSelect}
                      disabled={autoSelectMutation.isPending}
                    >
                      {autoSelectMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Auto-Selecting...
                        </>
                      ) : (
                        <>
                          <Target className="w-5 h-5" />
                          Auto-Select Top 2 Trades
                        </>
                      )}
                    </Button>
                    
                    {analysis && analysis.riskReward >= 2.0 && (
                      <Button 
                        className="bg-purple-600/90 hover:bg-purple-500 text-white px-6 py-4 text-base font-medium rounded-xl transition-all duration-200 flex items-center gap-2"
                        onClick={handleAddToAutoTrading}
                        disabled={addToAutoTradingMutation.isPending}
                      >
                        {addToAutoTradingMutation.isPending ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                        Add to Auto-Trading
                      </Button>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-300">
                    <p className="font-medium mb-2">Selection Criteria:</p>
                    <div className="space-y-1">
                      <p>• Volume Sensitivity: (Change% × (1 + Gap%/100)) / (RVOL ^ 0.5)</p>
                      <p>• Minimum 2:1 Risk-Reward Ratio</p>
                      <p>• Pre-market scanner validated</p>
                      <p>• Price: $1-$20, Float: &lt;10M shares</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-900/20 rounded-xl border border-purple-500/30 p-6">
                  <h4 className="text-lg font-semibold text-purple-200 mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Discord Alerts Active
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-green-300">
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      Target Hit Notifications
                    </div>
                    <div className="flex items-center gap-2 text-blue-300">
                      <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                      Next Target Overviews
                    </div>
                    <div className="flex items-center gap-2 text-red-300">
                      <div className="w-2 h-2 rounded-full bg-red-400"></div>
                      Stop Loss Alerts
                    </div>
                    <div className="flex items-center gap-2 text-yellow-300">
                      <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                      Trade Entry Confirmations
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Trades Display */}
              {activeTrades && activeTrades.length > 0 && (
                <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-400" />
                    Active Auto-Trades ({activeTrades.length})
                  </h4>
                  <div className="space-y-3">
                    {activeTrades.map((trade: any) => (
                      <TradeListItem key={trade.symbol} trade={trade} />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analysis Results - List Format */}
          {analysis && (
            <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-6">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                Strategy Analysis Results
              </h4>
              <div className="space-y-3">
                <AnalysisListItem 
                  analysis={analysis} 
                  livePrice={livePrice} 
                  priceChange={priceChange} 
                  targetStatuses={targetStatuses} 
                />
              </div>
            </div>
          )}

          {/* Loading State */}
          {(analysisLoading || strategyAnalysisMutation.isPending) && (
            <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-md">
              <CardContent className="p-8 text-center">
                <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-white">Analyzing strategy for {selectedSymbol}...</p>
                <p className="text-sm text-white mt-2">
                  Determining analysis method (Options Flow vs Multi-Brain AI)...
                </p>
                <div className="flex justify-center gap-4 mt-4 text-xs">
                  <div className="flex items-center gap-1 text-green-300">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Options Check
                  </div>
                  <div className="flex items-center gap-1 text-blue-300">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    Market Data
                  </div>
                  <div className="flex items-center gap-1 text-purple-300">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    AI Analysis
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        </main>
      </div>
    </div>
  );
}
