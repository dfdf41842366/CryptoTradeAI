import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { LivePrice } from "@/components/LivePrice";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Analytics } from "@shared/schema";
import { Shield, AlertTriangle, TrendingDown, Target, Settings, BarChart3, DollarSign } from "lucide-react";

interface RiskSettings {
  maxPositionSize: number;
  maxPortfolioRisk: number;
  stopLossPercent: number;
  takeProfitPercent: number;
  maxDrawdown: number;
  riskPerTrade: number;
  enableStopLoss: boolean;
  enableTakeProfit: boolean;
  enablePositionSizing: boolean;
}

interface RiskMetric {
  name: string;
  value: number;
  threshold: number;
  status: 'safe' | 'warning' | 'danger';
  description: string;
}

export function RiskManagementPage() {
  const [riskSettings, setRiskSettings] = useState<RiskSettings>({
    maxPositionSize: 25,
    maxPortfolioRisk: 2,
    stopLossPercent: 5,
    takeProfitPercent: 10,
    maxDrawdown: 15,
    riskPerTrade: 1,
    enableStopLoss: true,
    enableTakeProfit: true,
    enablePositionSizing: true
  });

  const { data: analytics } = useQuery<Analytics>({
    queryKey: ['/api/analytics'],
  });

  const riskMetrics: RiskMetric[] = [
    {
      name: 'Portfolio Beta',
      value: 1.15,
      threshold: 1.5,
      status: 'safe',
      description: 'Market correlation risk - how your portfolio moves with the market'
    },
    {
      name: 'Value at Risk (VaR)',
      value: 2.8,
      threshold: 5.0,
      status: 'safe',
      description: 'Maximum expected loss over 1 day with 95% confidence'
    },
    {
      name: 'Current Drawdown',
      value: 3.2,
      threshold: 10.0,
      status: 'safe',
      description: 'Current peak-to-trough decline from portfolio high'
    },
    {
      name: 'Concentration Risk',
      value: 45.2,
      threshold: 30.0,
      status: 'warning',
      description: 'Percentage of portfolio in top 3 positions'
    },
    {
      name: 'Sector Concentration',
      value: 67.8,
      threshold: 50.0,
      status: 'danger',
      description: 'Percentage of portfolio in single sector (Technology)'
    },
    {
      name: 'Correlation Risk',
      value: 0.74,
      threshold: 0.8,
      status: 'warning',
      description: 'Average correlation between portfolio positions'
    }
  ];

  const getStatusColor = (status: RiskMetric['status']) => {
    switch (status) {
      case 'safe': return 'text-green-400 bg-green-900/20 border-green-800';
      case 'warning': return 'text-yellow-400 bg-yellow-900/20 border-yellow-800';
      case 'danger': return 'text-red-400 bg-red-900/20 border-red-800';
    }
  };

  const getStatusIcon = (status: RiskMetric['status']) => {
    switch (status) {
      case 'safe': return <Shield className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'danger': return <TrendingDown className="h-4 w-4" />;
    }
  };

  const updateSetting = <K extends keyof RiskSettings>(key: K, value: RiskSettings[K]) => {
    setRiskSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveRiskSettings = () => {
    // Here you would typically make an API call to save the settings
    console.log('Saving risk settings:', riskSettings);
  };

  const resetToDefaults = () => {
    setRiskSettings({
      maxPositionSize: 25,
      maxPortfolioRisk: 2,
      stopLossPercent: 5,
      takeProfitPercent: 10,
      maxDrawdown: 15,
      riskPerTrade: 1,
      enableStopLoss: true,
      enableTakeProfit: true,
      enablePositionSizing: true
    });
  };

  return (
    <div className="min-h-screen bg-[var(--trading-dark)]">
      <Header analytics={analytics} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 ml-64">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Risk Management</h1>
                <p className="text-gray-400">Configure risk controls and monitor portfolio risk metrics</p>
              </div>
              <div className="flex space-x-2">
                <Button onClick={resetToDefaults} variant="outline" size="sm">
                  Reset Defaults
                </Button>
                <Button onClick={saveRiskSettings} className="bg-blue-600 hover:bg-blue-700">
                  Save Settings
                </Button>
              </div>
            </div>

            {/* Risk Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-[var(--trading-slate)] border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-green-400" />
                    <div>
                      <div className="text-2xl font-bold text-green-400">
                        {riskMetrics.filter(m => m.status === 'safe').length}
                      </div>
                      <div className="text-sm text-gray-400">Safe Metrics</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[var(--trading-slate)] border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-400" />
                    <div>
                      <div className="text-2xl font-bold text-yellow-400">
                        {riskMetrics.filter(m => m.status === 'warning').length}
                      </div>
                      <div className="text-sm text-gray-400">Warnings</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[var(--trading-slate)] border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingDown className="h-4 w-4 text-red-400" />
                    <div>
                      <div className="text-2xl font-bold text-red-400">
                        {riskMetrics.filter(m => m.status === 'danger').length}
                      </div>
                      <div className="text-sm text-gray-400">Critical</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[var(--trading-slate)] border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4 text-blue-400" />
                    <div>
                      <div className="text-2xl font-bold text-blue-400">8.2</div>
                      <div className="text-sm text-gray-400">Risk Score</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Risk Settings */}
              <Card className="bg-[var(--trading-slate)] border-gray-700">
                <CardHeader className="border-b border-gray-700">
                  <div className="flex items-center space-x-2">
                    <Settings className="h-5 w-5 text-blue-400" />
                    <h2 className="text-lg font-semibold text-white">Risk Controls</h2>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-400">Enable Stop Loss</label>
                      <Switch 
                        checked={riskSettings.enableStopLoss}
                        onCheckedChange={(checked) => updateSetting('enableStopLoss', checked)}
                      />
                    </div>
                    
                    {riskSettings.enableStopLoss && (
                      <div className="ml-4 space-y-2">
                        <label className="text-sm text-gray-400">Stop Loss Percentage</label>
                        <div className="flex items-center space-x-3">
                          <Slider
                            value={[riskSettings.stopLossPercent]}
                            onValueChange={([value]) => updateSetting('stopLossPercent', value)}
                            max={20}
                            min={1}
                            step={0.5}
                            className="flex-1"
                          />
                          <span className="text-white min-w-12 text-sm">{riskSettings.stopLossPercent}%</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-400">Enable Take Profit</label>
                      <Switch 
                        checked={riskSettings.enableTakeProfit}
                        onCheckedChange={(checked) => updateSetting('enableTakeProfit', checked)}
                      />
                    </div>
                    
                    {riskSettings.enableTakeProfit && (
                      <div className="ml-4 space-y-2">
                        <label className="text-sm text-gray-400">Take Profit Percentage</label>
                        <div className="flex items-center space-x-3">
                          <Slider
                            value={[riskSettings.takeProfitPercent]}
                            onValueChange={([value]) => updateSetting('takeProfitPercent', value)}
                            max={50}
                            min={5}
                            step={1}
                            className="flex-1"
                          />
                          <span className="text-white min-w-12 text-sm">{riskSettings.takeProfitPercent}%</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-400">Enable Position Sizing</label>
                      <Switch 
                        checked={riskSettings.enablePositionSizing}
                        onCheckedChange={(checked) => updateSetting('enablePositionSizing', checked)}
                      />
                    </div>
                    
                    {riskSettings.enablePositionSizing && (
                      <div className="ml-4 space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm text-gray-400">Max Position Size</label>
                          <div className="flex items-center space-x-3">
                            <Slider
                              value={[riskSettings.maxPositionSize]}
                              onValueChange={([value]) => updateSetting('maxPositionSize', value)}
                              max={50}
                              min={5}
                              step={1}
                              className="flex-1"
                            />
                            <span className="text-white min-w-12 text-sm">{riskSettings.maxPositionSize}%</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm text-gray-400">Risk Per Trade</label>
                          <div className="flex items-center space-x-3">
                            <Slider
                              value={[riskSettings.riskPerTrade]}
                              onValueChange={([value]) => updateSetting('riskPerTrade', value)}
                              max={5}
                              min={0.5}
                              step={0.1}
                              className="flex-1"
                            />
                            <span className="text-white min-w-12 text-sm">{riskSettings.riskPerTrade}%</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Max Portfolio Risk</label>
                    <div className="flex items-center space-x-3">
                      <Slider
                        value={[riskSettings.maxPortfolioRisk]}
                        onValueChange={([value]) => updateSetting('maxPortfolioRisk', value)}
                        max={10}
                        min={0.5}
                        step={0.1}
                        className="flex-1"
                      />
                      <span className="text-white min-w-12 text-sm">{riskSettings.maxPortfolioRisk}%</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Max Drawdown Threshold</label>
                    <div className="flex items-center space-x-3">
                      <Slider
                        value={[riskSettings.maxDrawdown]}
                        onValueChange={([value]) => updateSetting('maxDrawdown', value)}
                        max={30}
                        min={5}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-white min-w-12 text-sm">{riskSettings.maxDrawdown}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Metrics */}
              <Card className="bg-[var(--trading-slate)] border-gray-700">
                <CardHeader className="border-b border-gray-700">
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-yellow-400" />
                    <h2 className="text-lg font-semibold text-white">Risk Metrics</h2>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {riskMetrics.map((metric, index) => (
                      <div key={index} className="p-4 bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(metric.status)}
                            <span className="text-white font-medium">{metric.name}</span>
                          </div>
                          <Badge className={getStatusColor(metric.status)}>
                            {metric.status.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xl font-bold text-white">
                            {typeof metric.value === 'number' && metric.value < 10 
                              ? metric.value.toFixed(2) 
                              : metric.value.toFixed(1)
                            }
                            {metric.name.includes('Risk') || metric.name.includes('Drawdown') || metric.name.includes('Concentration') ? '%' : ''}
                          </span>
                          <span className="text-gray-400 text-sm">
                            Threshold: {metric.threshold}
                            {metric.name.includes('Risk') || metric.name.includes('Drawdown') || metric.name.includes('Concentration') ? '%' : ''}
                          </span>
                        </div>
                        
                        <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                          <div 
                            className={`h-2 rounded-full ${
                              metric.status === 'safe' ? 'bg-green-400' :
                              metric.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                            }`}
                            style={{width: `${Math.min((metric.value / metric.threshold) * 100, 100)}%`}}
                          ></div>
                        </div>
                        
                        <p className="text-gray-400 text-sm">{metric.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Risk Recommendations */}
            <Card className="bg-[var(--trading-slate)] border-gray-700">
              <CardHeader className="border-b border-gray-700">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-400" />
                  <h2 className="text-lg font-semibold text-white">Risk Recommendations</h2>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                      <span className="text-red-400 font-medium">High Risk Alert</span>
                    </div>
                    <p className="text-gray-300 text-sm">
                      Your sector concentration is dangerously high (67.8% in Technology). 
                      Consider diversifying into other sectors to reduce correlation risk.
                    </p>
                  </div>

                  <div className="p-4 bg-yellow-900/20 border border-yellow-800 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="h-4 w-4 text-yellow-400" />
                      <span className="text-yellow-400 font-medium">Position Size Warning</span>
                    </div>
                    <p className="text-gray-300 text-sm">
                      Your top 3 positions make up 45% of your portfolio. 
                      Consider reducing individual position sizes to improve diversification.
                    </p>
                  </div>

                  <div className="p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="h-4 w-4 text-blue-400" />
                      <span className="text-blue-400 font-medium">Optimization Suggestion</span>
                    </div>
                    <p className="text-gray-300 text-sm">
                      Your current portfolio beta is 1.15. Consider adding defensive stocks 
                      or bonds to reduce market sensitivity.
                    </p>
                  </div>

                  <div className="p-4 bg-green-900/20 border border-green-800 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <BarChart3 className="h-4 w-4 text-green-400" />
                      <span className="text-green-400 font-medium">Good Practice</span>
                    </div>
                    <p className="text-gray-300 text-sm">
                      Your stop-loss and take-profit settings are well configured. 
                      This helps maintain good risk-reward ratios.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}