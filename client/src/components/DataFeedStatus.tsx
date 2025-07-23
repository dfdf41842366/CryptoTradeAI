import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, XCircle, Wifi, WifiOff } from "lucide-react";

interface DataFeedHealth {
  status: string;
  sources: {
    yahoo: boolean;
    finnhub?: boolean;
    alphavantage?: boolean;
  };
  lastCheck: number;
}

export function DataFeedStatus() {
  const { data: health, isLoading, error } = useQuery<DataFeedHealth>({
    queryKey: ["/api/market-data/health"],
    refetchInterval: 30000, // Check every 30 seconds
    staleTime: 10000,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-600';
      case 'degraded': return 'bg-yellow-600';
      case 'error': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4" />;
      case 'error': return <XCircle className="h-4 w-4" />;
      default: return <WifiOff className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-[var(--trading-slate)] border-gray-700">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Wifi className="h-4 w-4 animate-pulse" />
            <span className="text-sm font-medium">Data Feed</span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Badge variant="outline" className="text-xs">
            Checking...
          </Badge>
        </CardContent>
      </Card>
    );
  }

  if (error || !health) {
    return (
      <Card className="bg-[var(--trading-slate)] border-gray-700">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium">Data Feed</span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Badge className="bg-red-600 text-xs">
            Connection Error
          </Badge>
        </CardContent>
      </Card>
    );
  }

  const lastCheckTime = new Date(health.lastCheck).toLocaleTimeString();

  return (
    <Card className="bg-[var(--trading-slate)] border-gray-700">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          {getStatusIcon(health.status)}
          <span className="text-sm font-medium">Data Feed</span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <Badge className={`${getStatusColor(health.status)} text-xs`}>
            {health.status.toUpperCase()}
          </Badge>
          
          <div className="space-y-1">
            {Object.entries(health.sources).map(([source, isActive]) => (
              <div key={source} className="flex items-center justify-between text-xs">
                <span className="capitalize text-gray-400">{source}:</span>
                <div className="flex items-center gap-1">
                  {isActive ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-500" />
                  )}
                  <span className={isActive ? 'text-green-400' : 'text-red-400'}>
                    {isActive ? 'Live' : 'Down'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-xs text-gray-500">
            Last check: {lastCheckTime}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}