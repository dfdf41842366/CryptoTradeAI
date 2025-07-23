import React from 'react';

// Emoji-Based Trading Sentiment Indicators Component
export interface SentimentData {
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  confidence?: number;
  trend?: 'bullish' | 'bearish' | 'neutral';
  volatility?: 'high' | 'medium' | 'low';
  momentum?: 'strong' | 'moderate' | 'weak';
}

interface EmojiSentimentProps {
  data: SentimentData;
  size?: 'sm' | 'md' | 'lg';
  showAll?: boolean;
  className?: string;
}

// Sentiment calculation logic
export function calculateSentiment(data: SentimentData) {
  const { changePercent, volume, confidence, trend, volatility, momentum } = data || {};
  
  // Price movement sentiment
  let priceEmoji = '';
  if (changePercent >= 10) priceEmoji = '🚀'; // Moon shot
  else if (changePercent >= 5) priceEmoji = '📈'; // Strong up
  else if (changePercent >= 2) priceEmoji = '⬆️'; // Up
  else if (changePercent >= 0.5) priceEmoji = '↗️'; // Slight up
  else if (changePercent >= -0.5) priceEmoji = '➡️'; // Flat
  else if (changePercent >= -2) priceEmoji = '↘️'; // Slight down
  else if (changePercent >= -5) priceEmoji = '⬇️'; // Down
  else if (changePercent >= -10) priceEmoji = '📉'; // Strong down
  else priceEmoji = '💥'; // Crash
  
  // Volume sentiment
  let volumeEmoji = '';
  if (volume) {
    const volumeRatio = volume / 1000000; // Convert to millions
    if (volumeRatio >= 50) volumeEmoji = '🌊'; // Tsunami volume
    else if (volumeRatio >= 20) volumeEmoji = '🔥'; // Hot volume
    else if (volumeRatio >= 10) volumeEmoji = '💪'; // Strong volume
    else if (volumeRatio >= 5) volumeEmoji = '👀'; // Watching volume
    else volumeEmoji = '😴'; // Sleepy volume
  }
  
  // Confidence sentiment
  let confidenceEmoji = '';
  if (confidence) {
    if (confidence >= 90) confidenceEmoji = '💎'; // Diamond hands
    else if (confidence >= 80) confidenceEmoji = '🎯'; // On target
    else if (confidence >= 70) confidenceEmoji = '👍'; // Good
    else if (confidence >= 60) confidenceEmoji = '🤔'; // Thinking
    else if (confidence >= 50) confidenceEmoji = '😐'; // Neutral
    else confidenceEmoji = '⚠️'; // Warning
  }
  
  // Trend sentiment
  let trendEmoji = '';
  if (trend === 'bullish') trendEmoji = '🐂'; // Bull
  else if (trend === 'bearish') trendEmoji = '🐻'; // Bear
  else trendEmoji = '🦘'; // Kangaroo (sideways)
  
  // Volatility sentiment
  let volatilityEmoji = '';
  if (volatility === 'high') volatilityEmoji = '⚡'; // Lightning
  else if (volatility === 'medium') volatilityEmoji = '🌪️'; // Tornado
  else volatilityEmoji = '🌊'; // Calm waves
  
  // Momentum sentiment
  let momentumEmoji = '';
  if (momentum === 'strong') momentumEmoji = '💨'; // Fast
  else if (momentum === 'moderate') momentumEmoji = '🏃'; // Running
  else momentumEmoji = '🚶'; // Walking
  
  // Overall sentiment based on change percentage
  let overallEmoji = '';
  if (changePercent >= 5) overallEmoji = '😍'; // Love it
  else if (changePercent >= 2) overallEmoji = '😊'; // Happy
  else if (changePercent >= 0.5) overallEmoji = '🙂'; // Slight smile
  else if (changePercent >= -0.5) overallEmoji = '😐'; // Neutral
  else if (changePercent >= -2) overallEmoji = '😕'; // Slight frown
  else if (changePercent >= -5) overallEmoji = '😟'; // Worried
  else overallEmoji = '😱'; // Scared
  
  return {
    price: priceEmoji,
    volume: volumeEmoji,
    confidence: confidenceEmoji,
    trend: trendEmoji,
    volatility: volatilityEmoji,
    momentum: momentumEmoji,
    overall: overallEmoji
  };
}

export function EmojiSentiment({ data, size = 'md', showAll = false, className = '' }: EmojiSentimentProps) {
  if (!data) {
    return null;
  }
  
  const sentiment = calculateSentiment(data);
  
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };
  
  if (showAll) {
    return (
      <div className={`flex items-center gap-1 ${sizeClasses[size]} ${className}`}>
        <span title={`Price: ${data?.changePercent >= 0 ? '+' : ''}${data?.changePercent.toFixed(2)}%`}>
          {sentiment.price}
        </span>
        {data.volume && (
          <span title={`Volume: ${(data.volume / 1000000).toFixed(1)}M`}>
            {sentiment.volume}
          </span>
        )}
        {data.confidence && (
          <span title={`Confidence: ${data.confidence}%`}>
            {sentiment.confidence}
          </span>
        )}
        {data.trend && (
          <span title={`Trend: ${data.trend}`}>
            {sentiment.trend}
          </span>
        )}
        {data.volatility && (
          <span title={`Volatility: ${data.volatility}`}>
            {sentiment.volatility}
          </span>
        )}
        {data.momentum && (
          <span title={`Momentum: ${data.momentum}`}>
            {sentiment.momentum}
          </span>
        )}
      </div>
    );
  }
  
  // Default: show price movement and overall sentiment
  return (
    <div className={`flex items-center gap-1 ${sizeClasses[size]} ${className}`}>
      <span title={`Price: ${data.changePercent >= 0 ? '+' : ''}${data.changePercent.toFixed(2)}%`}>
        {sentiment.price}
      </span>
      <span title={`Overall sentiment`}>
        {sentiment.overall}
      </span>
    </div>
  );
}

// Quick sentiment indicator for compact spaces
export function QuickSentiment({ data, className = '' }: { data: SentimentData; className?: string }) {
  const sentiment = calculateSentiment(data);
  
  return (
    <span 
      className={`text-lg ${className}`}
      title={`${data.changePercent >= 0 ? '+' : ''}${data.changePercent.toFixed(2)}% - ${sentiment.overall === '😍' ? 'Excellent' : sentiment.overall === '😊' ? 'Good' : sentiment.overall === '🙂' ? 'Positive' : sentiment.overall === '😐' ? 'Neutral' : sentiment.overall === '😕' ? 'Concerning' : sentiment.overall === '😟' ? 'Worrying' : 'Critical'}`}
    >
      {sentiment.overall}
    </span>
  );
}

// Sentiment trend indicator
export function SentimentTrend({ data, className = '' }: { data: SentimentData; className?: string }) {
  const sentiment = calculateSentiment(data);
  
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className="text-lg" title={`Price movement: ${data.changePercent >= 0 ? '+' : ''}${data.changePercent.toFixed(2)}%`}>
        {sentiment.price}
      </span>
      <span className="text-lg" title={`Market trend: ${data.trend || 'neutral'}`}>
        {sentiment.trend}
      </span>
    </div>
  );
}

// Risk sentiment indicator
export function RiskSentiment({ riskReward, confidence }: { riskReward: number; confidence?: number }) {
  let riskEmoji = '';
  
  if (riskReward >= 3) riskEmoji = '💎'; // Diamond - excellent
  else if (riskReward >= 2.5) riskEmoji = '🟢'; // Green circle - very good
  else if (riskReward >= 2) riskEmoji = '✅'; // Check mark - qualified
  else if (riskReward >= 1.5) riskEmoji = '⚠️'; // Warning - moderate risk
  else if (riskReward >= 1) riskEmoji = '🔶'; // Orange diamond - high risk
  else riskEmoji = '🔴'; // Red circle - very high risk
  
  let confidenceEmoji = '';
  if (confidence) {
    if (confidence >= 90) confidenceEmoji = '🎯';
    else if (confidence >= 80) confidenceEmoji = '👍';
    else if (confidence >= 70) confidenceEmoji = '🤔';
    else if (confidence >= 60) confidenceEmoji = '😐';
    else confidenceEmoji = '⚠️';
  }
  
  return (
    <div className="flex items-center gap-1" title={`Risk/Reward: ${riskReward.toFixed(1)}:1${confidence ? ` | Confidence: ${confidence}%` : ''}`}>
      <span className="text-lg">{riskEmoji}</span>
      {confidence && <span className="text-sm">{confidenceEmoji}</span>}
    </div>
  );
}

export default EmojiSentiment;