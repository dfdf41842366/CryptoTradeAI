import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { CheckCircle, Target, TrendingUp, Clock } from 'lucide-react';

interface ProfitTarget {
  target: number;
  probability: number;
  expectedDate: string;
  gainPercentage: number;
  holdTime: string;
  exitStrategy: string;
  reasoning: string;
}

interface TargetTrackerProps {
  symbol: string;
  currentPrice: number;
  targets: ProfitTarget[];
  isAuthentic?: boolean;
}

interface TargetStatus {
  targetIndex: number;
  isReached: boolean;
  reachedAt?: string;
  actualGain?: number;
}

export const TargetTracker: React.FC<TargetTrackerProps> = ({
  symbol,
  currentPrice,
  targets,
  isAuthentic = false
}) => {
  const [targetStatuses, setTargetStatuses] = useState<TargetStatus[]>([]);

  // Check which targets have been reached based on current price
  useEffect(() => {
    const statuses = targets.map((target, index) => {
      const isReached = currentPrice >= target.target;
      const actualGain = isReached ? 
        ((currentPrice - target.target) / target.target * 100) : 
        undefined;

      return {
        targetIndex: index,
        isReached,
        reachedAt: isReached ? new Date().toISOString() : undefined,
        actualGain
      };
    });

    setTargetStatuses(statuses);
  }, [currentPrice, targets]);

  const getTargetStatusColor = (status: TargetStatus, target: ProfitTarget) => {
    if (status.isReached) {
      return 'bg-green-100 border-green-300 text-green-800';
    } else if (currentPrice >= target.target * 0.98) { // Within 2% of target
      return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    } else {
      return 'bg-gray-100 border-gray-300 text-gray-600';
    }
  };

  const getTargetIcon = (status: TargetStatus, target: ProfitTarget) => {
    if (status.isReached) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    } else if (currentPrice >= target.target * 0.98) {
      return <TrendingUp className="h-4 w-4 text-yellow-600" />;
    } else {
      return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  const reachedTargets = targetStatuses.filter(s => s.isReached).length;
  const totalTargets = targets.length;

  return (
    <Card className="border-t-4 border-t-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Target Tracker - {symbol}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {isAuthentic && (
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                Real-Time Tracking
              </Badge>
            )}
            <Badge variant="outline">
              {reachedTargets}/{totalTargets} Reached
            </Badge>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          Current Price: <span className="font-semibold text-blue-600">${currentPrice.toFixed(2)}</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {targets.map((target, index) => {
          const status = targetStatuses[index];
          
          return (
            <div 
              key={index}
              className={`p-3 rounded-lg border ${getTargetStatusColor(status, target)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getTargetIcon(status, target)}
                  <span className="font-semibold">
                    Target {index + 1}: ${target.target.toFixed(2)}
                  </span>
                  {status.isReached && (
                    <Badge className="bg-green-600 text-white">REACHED</Badge>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    +{target.gainPercentage.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {target.probability}% probability
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-500">Expected Date:</span>
                  <div className="font-medium">{target.expectedDate}</div>
                </div>
                <div>
                  <span className="text-gray-500">Hold Time:</span>
                  <div className="font-medium">{target.holdTime}</div>
                </div>
              </div>
              
              <div className="mt-2 text-xs">
                <span className="text-gray-500">Exit Strategy:</span>
                <div className="text-gray-700">{target.exitStrategy}</div>
              </div>
              
              {status.isReached && (
                <div className="mt-2 pt-2 border-t border-green-200">
                  <div className="flex items-center space-x-4 text-xs">
                    <div>
                      <Clock className="h-3 w-3 inline mr-1" />
                      Reached: {new Date(status.reachedAt!).toLocaleString()}
                    </div>
                    {status.actualGain && (
                      <div className="text-green-600 font-medium">
                        Actual Gain: +{status.actualGain.toFixed(1)}%
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        
        {isAuthentic && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-xs text-blue-700">
              <strong>Real-Time Tracking:</strong> Target status updates automatically 
              based on live price data. Reached targets are marked with timestamp 
              and actual performance metrics.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TargetTracker;