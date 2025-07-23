import { Signal } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EmojiSentiment, QuickSentiment, RiskSentiment } from '@/components/EmojiSentiment';
import { memo } from "react";

interface SignalCardProps {
  signal: Signal;
}

export const SignalCard = memo(({ signal }: SignalCardProps) => {
  const getGradeBadgeColor = (grade: string) => {
    if (['A+', 'A'].includes(grade)) return 'bg-green-600';
    if (['B+', 'B'].includes(grade)) return 'bg-green-700';
    if (['C+', 'C'].includes(grade)) return 'bg-blue-600';
    return 'bg-gray-600';
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'BUY': return 'bg-[var(--profit-green)]';
      case 'SELL': return 'bg-[var(--loss-red)]';
      default: return 'bg-blue-600';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-[var(--profit-green)]';
      case 'High': return 'text-[var(--loss-red)]';
      default: return 'text-[var(--warning-yellow)]';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60));
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-600 hover:border-blue-500 transition-colors cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center justify-center w-12 h-12 ${getGradeBadgeColor(signal.grade)} rounded-lg`}>
            <span className="text-white font-bold text-xl">{signal.grade}</span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-white font-semibold text-lg">{signal.symbol}</h3>
              <span className="text-gray-400 text-sm">{signal.company}</span>
              <Badge className={`${getActionBadgeColor(signal.action)} text-white text-xs`}>
                {signal.action}
              </Badge>
            </div>
            <div className="flex items-center space-x-4 mt-1">
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <span className="text-white font-semibold">${((signal as any).currentPrice || signal.price || 0).toFixed(2)}</span>
                  {(signal as any).currentPrice && (signal as any).currentPrice !== signal.price && (
                    <span className="text-xs text-blue-400">LIVE</span>
                  )}
                </div>
                {(signal as any).currentPrice && (signal as any).currentPrice !== signal.price && (
                  <span className="text-xs text-gray-500">Entry: ${(signal.price || 0).toFixed(2)}</span>
                )}
              </div>
              <span className={`text-sm ${
                signal.change && signal.change >= 0 ? 'text-[var(--profit-green)]' : 'text-[var(--loss-red)]'
              }`}>
                {signal.change && signal.changePercent
                  ? `${signal.change >= 0 ? '+' : ''}$${signal.change.toFixed(2)} (${signal.changePercent >= 0 ? '+' : ''}${signal.changePercent.toFixed(2)}%)`
                  : 'N/A'
                }
              </span>
              <span className="text-gray-400 text-sm">Vol: {signal.volume || 'N/A'}</span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-gray-400 text-sm">Confidence:</span>
            <div className="flex items-center">
              <div className="w-16">
                <Progress 
                  value={signal.confidence * 100} 
                  className="h-2"
                />
              </div>
              <span className="text-white text-sm font-semibold ml-2">
                {((signal.confidence || 0) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            {signal.target && (
              <div>
                <span className="text-gray-400">Target:</span>
                <span className="text-[var(--profit-green)] font-semibold ml-1">
                  ${(signal.target || 0).toFixed(2)}
                </span>
              </div>
            )}
            {signal.stop && (
              <div>
                <span className="text-gray-400">Stop:</span>
                <span className="text-[var(--loss-red)] font-semibold ml-1">
                  ${(signal.stop || 0).toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span className="text-gray-400">
              GPT Council: <span className="text-white">{signal.gptCouncilVotes}/{signal.gptCouncilTotal} Agree</span>
            </span>
            {signal.expectedGain && (
              <span className="text-gray-400">
                Expected Gain: <span className="text-[var(--profit-green)]">+{(signal.expectedGain || 0).toFixed(1)}%</span>
              </span>
            )}
            <span className="text-gray-400">
              Risk Level: <span className={getRiskColor(signal.riskLevel)}>{signal.riskLevel}</span>
            </span>
          </div>
          <span className="text-xs text-gray-500">
            Signal generated {formatTimeAgo(signal.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
});
