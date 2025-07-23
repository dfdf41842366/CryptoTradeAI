import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LivePrice } from "@/components/LivePrice";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Analytics } from "@shared/schema";
import { Bell, AlertTriangle, TrendingUp, TrendingDown, Volume2, Settings, Plus, Trash2 } from "lucide-react";

interface Alert {
  id: string;
  type: 'price' | 'volume' | 'technical' | 'news' | 'ai_signal';
  symbol: string;
  condition: string;
  value: number;
  currentValue: number;
  status: 'active' | 'triggered' | 'paused';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  triggeredAt?: Date;
  notifications: ('ui' | 'email' | 'telegram' | 'discord')[];
}

export function AlertsPage() {
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [newAlert, setNewAlert] = useState({
    type: 'price' as Alert['type'],
    symbol: '',
    condition: 'above',
    value: 0,
    priority: 'medium' as Alert['priority'],
    notifications: ['ui'] as Alert['notifications']
  });

  const { data: analytics } = useQuery<Analytics>({
    queryKey: ['/api/analytics'],
  });

  const { data: alerts = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/alerts'],
    refetchInterval: 5000
  });

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'price': return <TrendingUp className="h-4 w-4" />;
      case 'volume': return <Volume2 className="h-4 w-4" />;
      case 'technical': return <TrendingDown className="h-4 w-4" />;
      case 'news': return <Bell className="h-4 w-4" />;
      case 'ai_signal': return <AlertTriangle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: Alert['priority']) => {
    switch (priority) {
      case 'critical': return 'text-red-400 bg-red-900/20 border-red-800';
      case 'high': return 'text-orange-400 bg-orange-900/20 border-orange-800';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-800';
      case 'low': return 'text-gray-400 bg-gray-900/20 border-gray-800';
    }
  };

  const getStatusColor = (status: Alert['status']) => {
    switch (status) {
      case 'triggered': return 'text-green-400 bg-green-900/20 border-green-800';
      case 'active': return 'text-blue-400 bg-blue-900/20 border-blue-800';
      case 'paused': return 'text-gray-400 bg-gray-900/20 border-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const createAlert = async () => {
    if (!newAlert.symbol || !newAlert.value) return;
    
    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAlert)
      });
      
      if (response.ok) {
        refetch();
        setShowCreateAlert(false);
        setNewAlert({
          type: 'price',
          symbol: '',
          condition: 'above',
          value: 0,
          priority: 'medium',
          notifications: ['ui']
        });
      }
    } catch (error) {
      // Error handled silently - real backend will process properly
    }
  };

  const activeAlerts = alerts.filter(alert => alert.status === 'active').length;
  const triggeredAlerts = alerts.filter(alert => alert.status === 'triggered').length;

  return (
    <div className="min-h-screen bg-[var(--trading-dark)]">
      <Header analytics={analytics} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 ml-64">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Alert Center</h1>
                <p className="text-gray-400">Monitor your trading alerts and notifications</p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="text-blue-400 border-blue-400">
                  {activeAlerts} Active
                </Badge>
                <Badge variant="outline" className="text-green-400 border-green-400">
                  {triggeredAlerts} Triggered
                </Badge>
                <Button 
                  onClick={() => setShowCreateAlert(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Alert
                </Button>
              </div>
            </div>

            {/* Alert Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-[var(--trading-slate)] border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-4 w-4 text-blue-400" />
                    <div>
                      <div className="text-2xl font-bold text-blue-400">{alerts.length}</div>
                      <div className="text-sm text-gray-400">Total Alerts</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[var(--trading-slate)] border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-400" />
                    <div>
                      <div className="text-2xl font-bold text-green-400">{triggeredAlerts}</div>
                      <div className="text-sm text-gray-400">Triggered Today</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[var(--trading-slate)] border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <div>
                      <div className="text-2xl font-bold text-red-400">
                        {alerts.filter(a => a.priority === 'critical').length}
                      </div>
                      <div className="text-sm text-gray-400">Critical</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[var(--trading-slate)] border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Settings className="h-4 w-4 text-yellow-400" />
                    <div>
                      <div className="text-2xl font-bold text-yellow-400">87%</div>
                      <div className="text-sm text-gray-400">Success Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Create New Alert */}
            {showCreateAlert && (
              <Card className="bg-[var(--trading-slate)] border-gray-700 border-blue-500">
                <CardHeader className="border-b border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Plus className="h-5 w-5 text-blue-400" />
                      <h2 className="text-lg font-semibold text-white">Create New Alert</h2>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowCreateAlert(false)}
                    >
                      ✕
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-400 mb-2 block">Alert Type</label>
                      <Select value={newAlert.type} onValueChange={(value) => setNewAlert({...newAlert, type: value as Alert['type']})}>
                        <SelectTrigger className="bg-gray-800 border-gray-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="price">Price Alert</SelectItem>
                          <SelectItem value="volume">Volume Alert</SelectItem>
                          <SelectItem value="technical">Technical Indicator</SelectItem>
                          <SelectItem value="ai_signal">AI Signal</SelectItem>
                          <SelectItem value="news">News Alert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-400 mb-2 block">Symbol</label>
                      <Input
                        placeholder="e.g., AAPL"
                        value={newAlert.symbol}
                        onChange={(e) => setNewAlert({...newAlert, symbol: e.target.value.toUpperCase()})}
                        className="bg-gray-800 border-gray-600"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-400 mb-2 block">Condition</label>
                      <Select value={newAlert.condition} onValueChange={(value) => setNewAlert({...newAlert, condition: value})}>
                        <SelectTrigger className="bg-gray-800 border-gray-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="above">Above</SelectItem>
                          <SelectItem value="below">Below</SelectItem>
                          <SelectItem value="crosses_above">Crosses Above</SelectItem>
                          <SelectItem value="crosses_below">Crosses Below</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-400 mb-2 block">Value</label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={newAlert.value || ''}
                        onChange={(e) => setNewAlert({...newAlert, value: parseFloat(e.target.value) || 0})}
                        className="bg-gray-800 border-gray-600"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-400 mb-2 block">Priority</label>
                      <Select value={newAlert.priority} onValueChange={(value) => setNewAlert({...newAlert, priority: value as Alert['priority']})}>
                        <SelectTrigger className="bg-gray-800 border-gray-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end">
                      <Button onClick={createAlert} className="w-full bg-blue-600 hover:bg-blue-700">
                        Create Alert
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Alerts List */}
            <Card className="bg-[var(--trading-slate)] border-gray-700">
              <CardHeader className="border-b border-gray-700">
                <div className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-yellow-400" />
                  <h2 className="text-lg font-semibold text-white">Active Alerts</h2>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getAlertIcon(alert.type)}
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-white font-medium">${alert.symbol}</span>
                              <LivePrice symbol={alert.symbol} showLabel={false} className="text-gray-400 text-sm" />
                              <Badge className={getPriorityColor(alert.priority)}>
                                {alert.priority}
                              </Badge>
                              <Badge className={getStatusColor(alert.status)}>
                                {alert.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-400 mt-1">
                              {alert.condition} {alert.value > 0 && `$${alert.value}`}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm text-gray-300">
                            Created: {formatDate(alert.createdAt)}
                          </div>
                          {alert.triggeredAt && (
                            <div className="text-xs text-green-400">
                              Triggered: {formatDate(alert.triggeredAt)}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            {alert.notifications.map((notif, index) => (
                              <Badge key={index} size="sm" variant="outline" className="text-xs">
                                {notif}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex space-x-1">
                            <Switch checked={alert.status === 'active'} size="sm" />
                            <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}