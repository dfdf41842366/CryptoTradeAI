import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertTriangle, DollarSign, RefreshCw } from "lucide-react";

interface APIHealth {
  overallHealth: boolean;
  apis: Array<{
    name: string;
    key: string;
    required: boolean;
    cost: string;
    configured: boolean;
    status: string;
  }>;
  recommendations: string[];
}

export function APIStatus() {
  const { data: health, isLoading, refetch } = useQuery<APIHealth>({
    queryKey: ['/api/health'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const getStatusIcon = (configured: boolean, required: boolean) => {
    if (configured) return <CheckCircle className="h-4 w-4 text-green-400" />;
    if (required) return <XCircle className="h-4 w-4 text-red-400" />;
    return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
  };

  const getStatusColor = (configured: boolean, required: boolean) => {
    if (configured) return 'bg-green-600';
    if (required) return 'bg-red-600';
    return 'bg-yellow-600';
  };

  const getCostColor = (cost: string) => {
    if (cost.includes('Free')) return 'text-green-400';
    if (cost.includes('$')) return 'text-orange-400';
    return 'text-gray-400';
  };

  return (
    <Card className="bg-[var(--trading-slate)] border-gray-700">
      <CardHeader className="border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Market Data APIs</h2>
            <p className="text-gray-400 text-sm mt-1">Real-time data source configuration and health</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${health?.overallHealth ? 'bg-green-500' : 'bg-red-500'} ${health?.overallHealth ? 'animate-pulse' : ''}`}></div>
              <span className="text-sm text-gray-400">
                {isLoading ? 'Checking...' : health?.overallHealth ? 'Connected' : 'Offline'}
              </span>
            </div>
            <Button
              onClick={() => refetch()}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-gray-800 rounded-lg p-4 h-16"></div>
            ))}
          </div>
        ) : (
          <>
            {/* API Status Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              {health?.apis.map((api, index) => (
                <div key={index} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(api.configured, api.required)}
                      <span className="text-white font-medium">{api.name}</span>
                      {api.required && (
                        <Badge variant="outline" className="text-red-400 border-red-400 text-xs">
                          Required
                        </Badge>
                      )}
                    </div>
                    <Badge className={`${getStatusColor(api.configured, api.required)} text-white text-xs`}>
                      {api.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Cost:</span>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-3 w-3 text-gray-400" />
                      <span className={getCostColor(api.cost)}>{api.cost}</span>
                    </div>
                  </div>
                  
                  {!api.configured && api.required && (
                    <div className="mt-2 p-2 bg-red-900/20 border border-red-800 rounded text-xs text-red-300">
                      API key required for full functionality
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Recommendations */}
            {health?.recommendations && health.recommendations.length > 0 && (
              <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
                <h3 className="text-blue-300 font-medium mb-2">Recommendations</h3>
                <ul className="space-y-1 text-sm text-blue-200">
                  {health.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-1 h-1 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Data Quality Indicator */}
            <div className="mt-4 flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-white text-sm">Data Quality</span>
              </div>
              <div className="text-right">
                <div className="text-green-400 text-sm font-medium">
                  {health?.apis.filter(api => api.configured).length || 0}/{health?.apis.length || 0} Sources Active
                </div>
                <div className="text-gray-400 text-xs">
                  {health?.overallHealth ? 'Real-time data available' : 'Limited functionality'}
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}