import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle, Clock, Settings, Zap, TrendingUp, Database, Activity } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface APIConfig {
  name: string;
  key: string | null;
  endpoint: string;
  status: 'active' | 'inactive' | 'error' | 'rate_limited';
  priority: 'essential' | 'optional' | 'fallback';
  rateLimitPerMinute: number;
  rateLimitPerHour: number;
  currentMinuteUsage: number;
  currentHourUsage: number;
  lastUsed: number;
  errorCount: number;
  successCount: number;
  avgResponseTime: number;
  lastError?: string;
  description: string;
  category: 'market_data' | 'ai_analysis' | 'news' | 'notifications' | 'utilities';
}

interface APIManagementData {
  apis: Record<string, APIConfig[]>;
  health: {
    healthy: number;
    total: number;
    critical: string[];
  };
  stats: {
    totalAPIs: number;
    activeAPIs: number;
    totalCalls: number;
    successRate: number;
    avgResponseTime: number;
    cacheHitRate: number;
  };
}

export default function APIStatus() {
  const [selectedAPI, setSelectedAPI] = useState<APIConfig | null>(null);
  const [editingAPI, setEditingAPI] = useState<string | null>(null);
  const [newAPIKey, setNewAPIKey] = useState("");
  const [newEndpoint, setNewEndpoint] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: apiData, isLoading, refetch } = useQuery<APIManagementData>({
    queryKey: ['/api/api-management'],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const updateAPIMutation = useMutation({
    mutationFn: async ({ apiName, key, endpoint }: { apiName: string; key: string; endpoint: string }) => {
      return apiRequest('POST', `/api/api-management/${apiName}/update`, { 
        key, 
        endpoint 
      });
    },
    onSuccess: () => {
      toast({
        title: "API Updated",
        description: "API configuration has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/api-management'] });
      setEditingAPI(null);
      setNewAPIKey("");
      setNewEndpoint("");
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update API configuration.",
        variant: "destructive",
      });
    },
  });

  const testAPIMutation = useMutation({
    mutationFn: async ({ apiName, endpoint }: { apiName: string; endpoint: string }) => {
      return apiRequest('POST', '/api/api-management/test-call', { 
        apiName, 
        endpoint 
      });
    },
    onSuccess: async (response: Response) => {
      const result = await response.json();
      toast({
        title: result.success ? "✅ Test Successful" : "❌ Test Failed",
        description: result.success 
          ? `${result.apiName} responded in ${result.responseTime}ms with authentic data` 
          : result.error || "API test failed",
        variant: result.success ? "default" : "destructive",
      });
      // Refresh API data after test
      queryClient.invalidateQueries({ queryKey: ['/api/api-management'] });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Test Error",
        description: error.message || "Failed to test API",
        variant: "destructive",
      });
    },
  });

  const testAllAPIsMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/api-management/test-all', {});
    },
    onSuccess: async (response: Response) => {
      const result = await response.json();
      toast({
        title: "API Testing Complete",
        description: `${result.summary.successful}/${result.summary.total} APIs working with authentic data`,
        variant: result.summary.successful > 0 ? "default" : "destructive",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/api-management'] });
    },
    onError: (error: any) => {
      toast({
        title: "Test Failed",
        description: error.message || "Failed to test all APIs",
        variant: "destructive",
      });
    },
  });

  const fixAPIsMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/api-management/fix-issues', {});
    },
    onSuccess: async (response: Response) => {
      const result = await response.json();
      toast({
        title: "API Fix Complete",
        description: result.message || `Fixed ${result.fixed?.length || 0} APIs`,
        variant: result.success ? "default" : "destructive",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/api-management'] });
    },
    onError: (error: any) => {
      toast({
        title: "Fix Failed",
        description: error.message || "Failed to fix API issues",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      case 'rate_limited': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'inactive': return <Clock className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      case 'rate_limited': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'essential': return 'destructive';
      case 'optional': return 'secondary';
      case 'fallback': return 'outline';
      default: return 'secondary';
    }
  };

  const handleUpdateAPI = () => {
    if (!editingAPI || !newAPIKey.trim()) return;
    
    updateAPIMutation.mutate({
      apiName: editingAPI,
      key: newAPIKey.trim(),
      endpoint: newEndpoint.trim() || selectedAPI?.endpoint || ''
    });
  };

  const handleTestAPI = (api: APIConfig) => {
    testAPIMutation.mutate({
      apiName: api.name,
      endpoint: api.endpoint
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Activity className="w-6 h-6" />
          <h1 className="text-2xl font-bold">API Status & Management</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!apiData) {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Unable to Load API Data</h2>
          <p className="text-gray-600 mb-4">Failed to fetch API management information.</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Activity className="w-6 h-6" />
          <div>
            <h1 className="text-2xl font-bold">API Status & Management</h1>
            <p className="text-sm text-muted-foreground">Professional monitoring with authentic data only</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={() => testAllAPIsMutation.mutate()}
            disabled={testAllAPIsMutation.isPending}
            variant="outline"
            size="sm"
            className="mr-2"
          >
            {testAllAPIsMutation.isPending ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Testing All APIs...
              </>
            ) : (
              <>
                <Settings className="w-4 h-4 mr-2" />
                Test All APIs
              </>
            )}
          </Button>
          <Button 
            onClick={() => fixAPIsMutation.mutate()}
            disabled={fixAPIsMutation.isPending}
            variant="secondary"
            size="sm"
          >
            {fixAPIsMutation.isPending ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Fixing APIs...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Fix Issues
              </>
            )}
          </Button>
          <Badge variant={apiData?.health.critical.length === 0 ? "default" : "destructive"}>
            {apiData?.health.healthy || 0}/{apiData?.health.total || 0} Operational
          </Badge>
        </div>
      </div>

      {/* Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round((apiData.health.healthy / apiData.health.total) * 100)}%
            </div>
            <p className="text-xs text-gray-600">
              {apiData.health.healthy}/{apiData.health.total} APIs healthy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {apiData.stats.successRate.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-600">
              {apiData.stats.totalCalls} total calls
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(apiData.stats.avgResponseTime)}ms
            </div>
            <p className="text-xs text-gray-600">
              Across all APIs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active APIs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {apiData.stats.activeAPIs}
            </div>
            <p className="text-xs text-gray-600">
              Out of {apiData.stats.totalAPIs} total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Issues Alert */}
      {apiData.health.critical.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>Critical API Issues</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-2">
              The following essential APIs are experiencing issues:
            </p>
            <div className="space-y-1">
              {apiData.health.critical.map((apiName) => (
                <Badge key={apiName} variant="destructive">{apiName}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="market_data">Market Data</TabsTrigger>
          <TabsTrigger value="ai_analysis">AI Analysis</TabsTrigger>
          <TabsTrigger value="news">News & Social</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(apiData.apis).map(([category, apis]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="capitalize flex items-center space-x-2">
                    {category === 'market_data' && <Database className="w-5 h-5" />}
                    {category === 'ai_analysis' && <Zap className="w-5 h-5" />}
                    {category === 'news' && <TrendingUp className="w-5 h-5" />}
                    {category === 'notifications' && <Activity className="w-5 h-5" />}
                    <span>{category.replace('_', ' ')}</span>
                  </CardTitle>
                  <CardDescription>
                    {apis.length} API{apis.length !== 1 ? 's' : ''} in this category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {apis.map((api) => (
                      <div key={api.name} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(api.status)}`}></div>
                          <div>
                            <div className="font-medium">{api.name}</div>
                            <div className="text-sm text-gray-600">{api.description}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={getPriorityBadgeVariant(api.priority)}>
                            {api.priority}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedAPI(api)}
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {Object.entries(apiData.apis).map(([category, apis]) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {apis.map((api) => (
                <Card key={api.name} className="relative">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{api.name}</CardTitle>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(api.status)}
                        <Badge variant={getPriorityBadgeVariant(api.priority)}>
                          {api.priority}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription>{api.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Status:</span>
                        <div className={`inline-block ml-2 px-2 py-1 rounded text-white text-xs ${getStatusColor(api.status)}`}>
                          {api.status}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Response:</span>
                        <span className="ml-2">{Math.round(api.avgResponseTime)}ms</span>
                      </div>
                      <div>
                        <span className="font-medium">Success Rate:</span>
                        <span className="ml-2">
                          {api.successCount + api.errorCount > 0 
                            ? Math.round((api.successCount / (api.successCount + api.errorCount)) * 100)
                            : 0}%
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Calls:</span>
                        <span className="ml-2">{api.successCount + api.errorCount}</span>
                      </div>
                    </div>

                    {/* Rate Limit Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Rate Limit (Per Minute)</span>
                        <span>{api.currentMinuteUsage}/{api.rateLimitPerMinute}</span>
                      </div>
                      <Progress 
                        value={(api.currentMinuteUsage / api.rateLimitPerMinute) * 100} 
                        className="h-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Rate Limit (Per Hour)</span>
                        <span>{api.currentHourUsage}/{api.rateLimitPerHour}</span>
                      </div>
                      <Progress 
                        value={(api.currentHourUsage / api.rateLimitPerHour) * 100} 
                        className="h-2"
                      />
                    </div>

                    {api.lastError && (
                      <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        <span className="font-medium">Last Error:</span> {api.lastError}
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedAPI(api);
                          setEditingAPI(api.name);
                          setNewAPIKey(api.key || '');
                          setNewEndpoint(api.endpoint);
                        }}
                        className="flex-1"
                      >
                        <Settings className="w-4 h-4 mr-1" />
                        Configure
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTestAPI(api)}
                        disabled={testAPIMutation.isPending || api.status === 'inactive'}
                        className="flex-1"
                      >
                        <Zap className="w-4 h-4 mr-1" />
                        Test
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* API Configuration Modal */}
      {editingAPI && selectedAPI && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Configure {selectedAPI.name}</h3>
              <p className="text-sm text-gray-600 mt-1">Update API key and endpoint configuration</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <Label htmlFor="api-key" className="text-sm font-medium">API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  value={newAPIKey}
                  onChange={(e) => setNewAPIKey(e.target.value)}
                  placeholder="Enter API key..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="endpoint" className="text-sm font-medium">Endpoint (Optional)</Label>
                <Input
                  id="endpoint"
                  value={newEndpoint}
                  onChange={(e) => setNewEndpoint(e.target.value)}
                  placeholder="API endpoint URL..."
                  className="mt-1"
                />
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                <p className="font-medium text-blue-800">Priority: {selectedAPI.priority}</p>
                <p className="text-blue-600">{selectedAPI.description}</p>
              </div>
            </div>
            <div className="flex justify-end space-x-2 p-6 pt-0 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingAPI(null);
                  setSelectedAPI(null);
                  setNewAPIKey("");
                  setNewEndpoint("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateAPI}
                disabled={updateAPIMutation.isPending || !newAPIKey.trim()}
              >
                {updateAPIMutation.isPending ? "Updating..." : "Update"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}