import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, MessageSquare, Hash, AlertTriangle, CheckCircle } from "lucide-react";

interface Alert {
  id: string;
  type: 'signal' | 'price' | 'volume' | 'news';
  symbol: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  sent: boolean;
}

export function AlertCenter() {
  const { data: alerts = [], isLoading } = useQuery<Alert[]>({
    queryKey: ['/api/alerts'],
    refetchInterval: 5000 // Refresh every 5 seconds
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-600';
      case 'medium': return 'bg-yellow-600';
      default: return 'bg-blue-600';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <Bell className="h-4 w-4" />;
      case 'medium': return <MessageSquare className="h-4 w-4" />;
      default: return <Hash className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'signal': return '🎯';
      case 'price': return '💰';
      case 'volume': return '📊';
      case 'news': return '📰';
      default: return '📋';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const criticalAlerts = alerts.filter(alert => alert.priority === 'critical');
  const highAlerts = alerts.filter(alert => alert.priority === 'high');
  const recentAlerts = alerts.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[var(--trading-slate)] border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Alerts</p>
                <p className="text-2xl font-bold text-white">{alerts.length}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--trading-slate)] border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Critical</p>
                <p className="text-2xl font-bold text-red-400">{criticalAlerts.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--trading-slate)] border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">High Priority</p>
                <p className="text-2xl font-bold text-orange-400">{highAlerts.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--trading-slate)] border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Success Rate</p>
                <p className="text-2xl font-bold text-green-400">94%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      <Card className="bg-[var(--trading-slate)] border-gray-700">
        <CardHeader className="border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Alert Center</h2>
              <p className="text-gray-400 text-sm mt-1">Live trading alerts and notifications</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-400">Live</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse bg-gray-800 rounded-lg p-4 h-20"></div>
              ))}
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-500" />
              <p className="text-gray-400 mb-4">No alerts yet</p>
              <p className="text-gray-500 text-sm">Alerts will appear here when trading signals are generated</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="bg-gray-800 rounded-lg p-4 border-l-4 border-blue-500">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">{getTypeIcon(alert.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={`${getPriorityColor(alert.priority)} text-white text-xs flex items-center space-x-1`}>
                            {getPriorityIcon(alert.priority)}
                            <span>{alert.priority.toUpperCase()}</span>
                          </Badge>
                          <span className="text-white font-semibold">{alert.symbol}</span>
                          <Badge variant="outline" className="text-gray-400 border-gray-600">
                            {alert.type}
                          </Badge>
                        </div>
                        <p className="text-gray-300 text-sm whitespace-pre-line">
                          {alert.message}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500 text-xs">{formatTimeAgo(alert.timestamp)}</p>
                      {alert.sent && (
                        <div className="flex items-center space-x-1 mt-1">
                          <CheckCircle className="h-3 w-3 text-green-400" />
                          <span className="text-green-400 text-xs">Sent</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}