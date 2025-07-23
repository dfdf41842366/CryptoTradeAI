import React from 'react';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';

interface OptionsFlowIndicatorProps {
  hasOptions: boolean;
  analysisBy: string[];
  confidence: number;
  isAuthentic?: boolean;
}

export const OptionsFlowIndicator: React.FC<OptionsFlowIndicatorProps> = ({
  hasOptions,
  analysisBy,
  confidence,
  isAuthentic = false
}) => {
  const isOptionsFlow = analysisBy.some(analyst => 
    analyst.includes('OPTIONS FLOW') || analyst.includes('Options Oracle')
  );

  const getIndicatorColor = () => {
    if (isOptionsFlow && isAuthentic) {
      return 'bg-gradient-to-r from-emerald-500 to-green-600 text-white';
    } else if (isOptionsFlow) {
      return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
    } else {
      return 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white';
    }
  };

  const getIndicatorText = () => {
    if (isOptionsFlow && isAuthentic) {
      return '🔥 AUTHENTIC OPTIONS FLOW';
    } else if (isOptionsFlow) {
      return '📊 OPTIONS FLOW';
    } else {
      return '🧠 CLAUDE MULTI-BRAIN';
    }
  };

  const getDataSourceBadge = () => {
    if (isOptionsFlow && isAuthentic) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300">
          Real Options Data
        </Badge>
      );
    } else if (isOptionsFlow) {
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-300">
          Options Analysis
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-300">
          AI Analysis
        </Badge>
      );
    }
  };

  return (
    <Card className="border-l-4 border-l-emerald-500">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Primary Indicator */}
          <div className={`px-3 py-2 rounded-lg text-sm font-semibold ${getIndicatorColor()}`}>
            {getIndicatorText()}
          </div>
          
          {/* Analysis Details */}
          <div className="flex items-center justify-between">
            <div className="space-x-2">
              {getDataSourceBadge()}
              <Badge variant="outline" className="text-xs">
                {confidence}% Confidence
              </Badge>
            </div>
            
            {hasOptions && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-300">
                Options Available
              </Badge>
            )}
          </div>
          
          {/* Analysis Team */}
          <div className="text-xs text-gray-600">
            <span className="font-medium">Analysis by:</span>{' '}
            {analysisBy.join(', ')}
          </div>
          
          {/* Data Source Explanation */}
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            {isOptionsFlow && isAuthentic ? (
              <span>
                <strong>Authentic Options Flow:</strong> Targets and stop loss calculated from real-time 
                call/put volume, strike analysis, and implied volatility from live options chains.
              </span>
            ) : isOptionsFlow ? (
              <span>
                <strong>Options Flow Analysis:</strong> Based on options trading patterns and 
                technical analysis for optionable stocks.
              </span>
            ) : (
              <span>
                <strong>Claude Multi-Brain Analysis:</strong> Advanced AI analysis using 8 specialized 
                experts for non-optionable stocks.
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OptionsFlowIndicator;