import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MarketScannerProps {
  data: any[];
  isLoading: boolean;
}

export function MarketScanner({ data, isLoading }: MarketScannerProps) {
  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return 'bg-green-600';
    if (score >= 80) return 'bg-green-700';
    if (score >= 70) return 'bg-blue-600';
    return 'bg-gray-600';
  };

  const calculateScore = (item: any) => {
    // Simple scoring based on volume and percentage change
    const volumeValue = typeof item.volume === 'string' 
      ? parseFloat(item.volume.replace('M', '')) || 1
      : typeof item.volume === 'number' 
      ? item.volume / 1000000 // Convert to millions for consistency
      : 1;
    const changePercent = Math.abs(item.changePercent || 0);
    return Math.min(100, Math.floor(changePercent * 5 + volumeValue * 2));
  };

  return (
    <Card className="bg-[var(--trading-slate)] border-gray-700">
      <CardHeader className="border-b border-gray-700">
        <h2 className="text-xl font-semibold text-white">Live Market Scanner</h2>
        <p className="text-gray-400 text-sm mt-1">Real-time screening of top movers</p>
      </CardHeader>
      
      <CardContent className="p-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse flex space-x-4">
                <div className="h-4 bg-gray-700 rounded w-16"></div>
                <div className="h-4 bg-gray-700 rounded w-20"></div>
                <div className="h-4 bg-gray-700 rounded w-24"></div>
                <div className="h-4 bg-gray-700 rounded w-20"></div>
                <div className="h-4 bg-gray-700 rounded w-12"></div>
              </div>
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No market data available
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 text-gray-400 font-medium">Symbol</th>
                  <th className="text-left py-3 text-gray-400 font-medium">Price</th>
                  <th className="text-left py-3 text-gray-400 font-medium">Change</th>
                  <th className="text-left py-3 text-gray-400 font-medium">Volume</th>
                  <th className="text-left py-3 text-gray-400 font-medium">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {data.slice(0, 10).map((item, index) => {
                  const score = calculateScore(item);
                  return (
                    <tr key={index}>
                      <td className="py-3 text-white font-medium">{item.symbol}</td>
                      <td className="py-3 text-white">${item.price?.toFixed(2) || '0.00'}</td>
                      <td className="py-3">
                        <span className={`${
                          item.changePercent >= 0 ? 'text-[var(--profit-green)]' : 'text-[var(--loss-red)]'
                        }`}>
                          {item.change >= 0 ? '+' : ''}${item.change?.toFixed(2) || '0.00'} ({item.changePercent >= 0 ? '+' : ''}{item.changePercent?.toFixed(1) || '0.0'}%)
                        </span>
                      </td>
                      <td className="py-3 text-gray-300">{item.volume || 'N/A'}</td>
                      <td className="py-3">
                        <Badge className={`${getScoreBadgeColor(score)} text-white text-xs font-medium`}>
                          {score}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
