import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SymbolSearch } from "@/components/SymbolSearch";
import { LivePrice } from "@/components/LivePrice";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Analytics } from "@shared/schema";
import { AlertTriangle, Zap, TrendingUp, Eye, Activity, Target, Clock, Radar, Search, Brain, ShieldAlert } from "lucide-react";

interface AnomalySignal {
  id: string;
  symbol: string;
  currentPrice: number;
  priceChange: number;
  volumeSpike: number;
  anomalyScore: number;
  potentialGain: number;
  timeDetected: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  patterns: string[];
  catalysts: string[];
  riskLevel: number;
  confidence: number;
  tradingPlan: {
    entryPrice: number;
    exitTarget: number;
    stopLoss: number;
    timeframe: string;
    positionSize: string;
  };
}

interface AnomalyHunter {
  id: string;
  name: string;
  specialty: string;
  detectionRate: number;
  accuracy: number;
  avgGainDetected: number;
  totalDetections: number;
  recentFinds: number;
  huntingStyle: string;
  currentFocus: string;
  status: 'active' | 'scanning' | 'analyzing' | 'alerting';
  reputation: number;
}

export default function AnomalyHuntersPage() {
  const [scanningActive, setScanningActive] = useState(true);
  const [alertCount, setAlertCount] = useState(7);
  const [criticalAlerts, setCriticalAlerts] = useState(2);
  const [currentScanner, setCurrentScanner] = useState(0);
  
  const { data: analytics } = useQuery<Analytics>({
    queryKey: ["/api/analytics"],
  });

  const anomalyHunters: AnomalyHunter[] = [
    {
      id: 'volume_viper',
      name: 'Volume Viper Victor',
      specialty: 'Massive Volume Spike Detection',
      detectionRate: 94.3,
      accuracy: 78.6,
      avgGainDetected: 67.2,
      totalDetections: 156,
      recentFinds: 8,
      huntingStyle: 'Real-time volume anomaly scanning',
      currentFocus: 'Detecting 1000%+ volume spikes in micro-caps',
      status: 'scanning',
      reputation: 96.1
    },
    {
      id: 'pattern_predator',
      name: 'Pattern Predator Paula',
      specialty: 'Unusual Chart Pattern Recognition',
      detectionRate: 87.8,
      accuracy: 82.1,
      avgGainDetected: 52.4,
      totalDetections: 203,
      recentFinds: 12,
      huntingStyle: 'Advanced pattern recognition algorithms',
      currentFocus: 'Identifying pre-breakout compression patterns',
      status: 'analyzing',
      reputation: 91.7
    },
    {
      id: 'options_oracle',
      name: 'Options Oracle Otto',
      specialty: 'Unusual Options Activity Detection',
      detectionRate: 91.2,
      accuracy: 74.9,
      avgGainDetected: 71.8,
      totalDetections: 98,
      recentFinds: 5,
      huntingStyle: 'Options flow and gamma squeeze prediction',
      currentFocus: 'Monitoring unusual call volume and gamma ramps',
      status: 'alerting',
      reputation: 88.4
    },
    {
      id: 'sentiment_scanner',
      name: 'Sentiment Scanner Steve',
      specialty: 'Social Media Anomaly Detection',
      detectionRate: 89.5,
      accuracy: 69.3,
      avgGainDetected: 58.9,
      totalDetections: 267,
      recentFinds: 15,
      huntingStyle: 'Real-time social sentiment analysis',
      currentFocus: 'Detecting viral momentum before mainstream awareness',
      status: 'active',
      reputation: 85.2
    },
    {
      id: 'insider_investigator',
      name: 'Insider Investigator Ivy',
      specialty: 'Unusual Insider Activity Tracking',
      detectionRate: 76.4,
      accuracy: 91.7,
      avgGainDetected: 89.3,
      totalDetections: 47,
      recentFinds: 3,
      huntingStyle: 'SEC filing analysis and insider pattern recognition',
      currentFocus: 'Tracking executive buying patterns and form 4 filings',
      status: 'analyzing',
      reputation: 93.8
    }
  ];

  const recentAnomalies: AnomalySignal[] = [
    {
      id: 'anom_001',
      symbol: 'KOSS',
      currentPrice: 3.67,
      priceChange: 18.7,
      volumeSpike: 2840,
      anomalyScore: 97.3,
      potentialGain: 78.2,
      timeDetected: '2 minutes ago',
      urgency: 'critical',
      patterns: ['Volume breakout', 'Short squeeze setup', 'Technical breakout'],
      catalysts: ['Massive volume spike', 'Short interest 47%', 'Options gamma ramp'],
      riskLevel: 35,
      confidence: 94,
      tradingPlan: {
        entryPrice: 3.67,
        exitTarget: 6.54,
        stopLoss: 3.15,
        timeframe: '1-3 days',
        positionSize: '3% portfolio'
      }
    },
    {
      id: 'anom_002',
      symbol: 'PROG',
      currentPrice: 1.97,
      priceChange: 12.4,
      volumeSpike: 1560,
      anomalyScore: 91.8,
      potentialGain: 65.4,
      timeDetected: '8 minutes ago',
      urgency: 'critical',
      patterns: ['Pennant breakout', 'Ascending triangle', 'Bull flag'],
      catalysts: ['FDA approval rumors', 'Institutional buying', 'Technical breakout'],
      riskLevel: 42,
      confidence: 87,
      tradingPlan: {
        entryPrice: 1.97,
        exitTarget: 3.26,
        stopLoss: 1.68,
        timeframe: '2-5 days',
        positionSize: '2.5% portfolio'
      }
    },
    {
      id: 'anom_003',
      symbol: 'BBIG',
      currentPrice: 1.73,
      priceChange: 9.2,
      volumeSpike: 890,
      anomalyScore: 86.4,
      potentialGain: 52.7,
      timeDetected: '15 minutes ago',
      urgency: 'high',
      patterns: ['Cup and handle', 'Volume confirmation', 'Moving average breakout'],
      catalysts: ['Earnings whispers', 'Social media buzz', 'Technical momentum'],
      riskLevel: 38,
      confidence: 79,
      tradingPlan: {
        entryPrice: 1.73,
        exitTarget: 2.64,
        stopLoss: 1.52,
        timeframe: '3-7 days',
        positionSize: '2% portfolio'
      }
    },
    {
      id: 'anom_004',
      symbol: 'CYDY',
      currentPrice: 0.71,
      priceChange: 15.8,
      volumeSpike: 1240,
      anomalyScore: 89.2,
      potentialGain: 71.3,
      timeDetected: '22 minutes ago',
      urgency: 'high',
      patterns: ['Oversold bounce', 'Hammer reversal', 'Volume surge'],
      catalysts: ['Drug trial update', 'Insider buying', 'Technical oversold'],
      riskLevel: 45,
      confidence: 82,
      tradingPlan: {
        entryPrice: 0.71,
        exitTarget: 1.22,
        stopLoss: 0.61,
        timeframe: '1-2 weeks',
        positionSize: '2% portfolio'
      }
    },
    {
      id: 'anom_005',
      symbol: 'AVXL',
      currentPrice: 5.14,
      priceChange: 6.8,
      volumeSpike: 450,
      anomalyScore: 83.7,
      potentialGain: 58.9,
      timeDetected: '35 minutes ago',
      urgency: 'medium',
      patterns: ['Bull flag', 'Higher lows', 'Institutional accumulation'],
      catalysts: ['FDA decision pending', 'Phase 3 results', 'Analyst upgrade'],
      riskLevel: 32,
      confidence: 76,
      tradingPlan: {
        entryPrice: 5.14,
        exitTarget: 8.17,
        stopLoss: 4.62,
        timeframe: '2-4 weeks',
        positionSize: '1.5% portfolio'
      }
    }
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'text-red-400 bg-red-900/20 border-red-800';
      case 'high': return 'text-orange-400 bg-orange-900/20 border-orange-800';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-800';
      case 'low': return 'text-green-400 bg-green-900/20 border-green-800';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'scanning': return 'text-blue-400';
      case 'analyzing': return 'text-purple-400';
      case 'alerting': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  useEffect(() => {
    if (scanningActive) {
      const interval = setInterval(() => {
        setCurrentScanner((prev) => (prev + 1) % anomalyHunters.length);
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [scanningActive]);

  return (
    <div className="min-h-screen bg-[var(--trading-dark)]">
      <Header analytics={analytics} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 ml-64">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent mb-2">
                  Anomaly Hunters
                </h1>
                <p className="text-gray-400">Specialized team detecting unusual market behavior for 50%+ gain opportunities</p>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="text-red-400 border-red-400">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {criticalAlerts} Critical
                </Badge>
                <Badge variant="outline" className="text-orange-400 border-orange-400">
                  <Radar className="h-3 w-3 mr-1" />
                  {alertCount} Active
                </Badge>
                <Button 
                  onClick={() => setScanningActive(!scanningActive)}
                  className={scanningActive ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
                >
                  <Search className="h-4 w-4 mr-2" />
                  {scanningActive ? 'Stop Scanning' : 'Start Scanning'}
                </Button>
              </div>
            </div>

            {/* Real-time Alerts */}
            <Card className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border-red-700">
              <CardHeader className="border-b border-red-700">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="h-5 w-5 text-red-400" />
                  <h2 className="text-lg font-semibold text-white">Live Anomaly Alerts</h2>
                  <Badge className="text-red-300 bg-red-900/30">
                    {scanningActive ? 'SCANNING' : 'PAUSED'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-red-800 bg-red-900/30">
                        <th className="text-left p-4 text-gray-300">Symbol</th>
                        <th className="text-right p-4 text-gray-300">Price</th>
                        <th className="text-right p-4 text-gray-300">Change</th>
                        <th className="text-right p-4 text-gray-300">Volume Spike</th>
                        <th className="text-right p-4 text-gray-300">Potential</th>
                        <th className="text-right p-4 text-gray-300">Score</th>
                        <th className="text-right p-4 text-gray-300">Urgency</th>
                        <th className="text-right p-4 text-gray-300">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentAnomalies.map((anomaly) => (
                        <tr key={anomaly.id} className="border-b border-gray-800 hover:bg-red-900/10">
                          <td className="p-4">
                            <div className="font-medium text-white">{anomaly.symbol}</div>
                            <div className="text-xs text-gray-400">{anomaly.patterns[0]}</div>
                          </td>
                          <td className="p-4 text-right">
                            <LivePrice symbol={anomaly.symbol} className="text-white font-medium" />
                          </td>
                          <td className="p-4 text-right">
                            <div className="text-green-400 font-medium">+{anomaly.priceChange}%</div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="text-orange-400 font-medium">{anomaly.volumeSpike}%</div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="text-yellow-400 font-medium">+{anomaly.potentialGain}%</div>
                            <div className="text-xs text-gray-400">${anomaly.tradingPlan.exitTarget.toFixed(2)}</div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="text-red-400 font-medium">{anomaly.anomalyScore}</div>
                          </td>
                          <td className="p-4 text-right">
                            <Badge className={getUrgencyColor(anomaly.urgency)} size="sm">
                              {anomaly.urgency.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="p-4 text-right">
                            <div className="text-gray-400 text-xs">{anomaly.timeDetected}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Current Scanner Status */}
            {scanningActive && (
              <Card className="bg-[var(--trading-slate)] border-yellow-600">
                <CardHeader className="border-b border-yellow-600">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
                    <h3 className="text-lg font-semibold text-white">
                      Currently Scanning: {anomalyHunters[currentScanner].name}
                    </h3>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                      <Radar className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium mb-2">{anomalyHunters[currentScanner].currentFocus}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>Specialty: {anomalyHunters[currentScanner].specialty}</span>
                        <span>Detection Rate: {anomalyHunters[currentScanner].detectionRate}%</span>
                        <Badge className={`${getStatusColor(anomalyHunters[currentScanner].status)} bg-transparent border`}>
                          {anomalyHunters[currentScanner].status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Detailed Anomaly Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {recentAnomalies.slice(0, 2).map((anomaly) => (
                <Card key={anomaly.id} className="bg-[var(--trading-slate)] border-gray-700">
                  <CardHeader className="border-b border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                          <AlertTriangle className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{anomaly.symbol}</h3>
                          <div className="text-sm text-gray-400 flex items-center space-x-2">
                            <LivePrice symbol={anomaly.symbol} className="text-white text-sm" showLabel={false} />
                            <span>(+{anomaly.priceChange}%)</span>
                          </div>
                        </div>
                      </div>
                      <Badge className={getUrgencyColor(anomaly.urgency)}>
                        {anomaly.urgency.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    {/* Anomaly Metrics */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-400">{anomaly.anomalyScore}</div>
                        <div className="text-xs text-gray-400">Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-400">{anomaly.volumeSpike}%</div>
                        <div className="text-xs text-gray-400">Vol Spike</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-yellow-400">+{anomaly.potentialGain}%</div>
                        <div className="text-xs text-gray-400">Potential</div>
                      </div>
                    </div>

                    {/* Trading Plan */}
                    <div className="p-3 bg-gray-800 rounded-lg mb-4">
                      <h4 className="text-sm font-medium text-white mb-2">Trading Plan</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-400">Entry:</span>
                          <span className="text-cyan-400 ml-2">${anomaly.tradingPlan.entryPrice.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Target:</span>
                          <span className="text-green-400 ml-2">${anomaly.tradingPlan.exitTarget.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Stop:</span>
                          <span className="text-red-400 ml-2">${anomaly.tradingPlan.stopLoss.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Size:</span>
                          <span className="text-purple-400 ml-2">{anomaly.tradingPlan.positionSize}</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Indicator */}
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-400">Confidence Level:</span>
                        <span className="text-xs text-blue-400">{anomaly.confidence}%</span>
                      </div>
                      <Progress value={anomaly.confidence} className="h-2" />
                    </div>

                    {/* Patterns & Catalysts */}
                    <div className="space-y-3">
                      <div>
                        <h5 className="text-xs font-medium text-gray-400 mb-1">Patterns Detected:</h5>
                        <div className="flex flex-wrap gap-1">
                          {anomaly.patterns.map((pattern, i) => (
                            <Badge key={i} size="sm" variant="outline" className="text-xs text-blue-300">
                              {pattern}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="text-xs font-medium text-gray-400 mb-1">Key Catalysts:</h5>
                        <div className="flex flex-wrap gap-1">
                          {anomaly.catalysts.map((catalyst, i) => (
                            <Badge key={i} size="sm" variant="outline" className="text-xs text-yellow-300">
                              {catalyst}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-500">
                      Detected {anomaly.timeDetected} • Risk Level: {anomaly.riskLevel}%
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Hunter Team Status */}
            <Card className="bg-[var(--trading-slate)] border-gray-700">
              <CardHeader className="border-b border-gray-700">
                <div className="flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-orange-400" />
                  <h3 className="text-lg font-semibold text-white">Anomaly Hunter Team</h3>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {anomalyHunters.map((hunter, index) => (
                    <div 
                      key={hunter.id} 
                      className={`p-4 rounded-lg ${
                        index === currentScanner && scanningActive 
                          ? 'bg-yellow-900/20 border border-yellow-600' 
                          : 'bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                          <Brain className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-white">{hunter.name}</h4>
                          <div className={`text-xs ${getStatusColor(hunter.status)}`}>
                            {hunter.status.toUpperCase()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Detection:</span>
                          <span className="text-green-400">{hunter.detectionRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Accuracy:</span>
                          <span className="text-blue-400">{hunter.accuracy}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Avg Gain:</span>
                          <span className="text-yellow-400">+{hunter.avgGainDetected}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Recent:</span>
                          <span className="text-purple-400">{hunter.recentFinds}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-2 border-t border-gray-700">
                        <p className="text-xs text-gray-300">{hunter.specialty}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Philosophy */}
            <Card className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border-red-700">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <Radar className="h-6 w-6 text-red-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">Anomaly Detection Philosophy</h3>
                    <p className="text-gray-300 text-sm mb-3">
                      Our specialized hunters continuously scan for unusual market behavior that precedes major price movements. 
                      By detecting volume spikes, pattern breaks, social sentiment shifts, and insider activity, we identify 
                      potential 50%+ gainers within minutes of the anomaly occurring.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-red-400 font-medium">Detection Methods:</span>
                        <ul className="text-gray-400 mt-1 space-y-1">
                          <li>• Real-time volume spike detection</li>
                          <li>• Unusual options activity monitoring</li>
                          <li>• Social sentiment anomaly tracking</li>
                          <li>• Insider buying pattern recognition</li>
                        </ul>
                      </div>
                      <div>
                        <span className="text-orange-400 font-medium">Speed Advantage:</span>
                        <ul className="text-gray-400 mt-1 space-y-1">
                          <li>• Sub-minute detection times</li>
                          <li>• Pre-breakout identification</li>
                          <li>• Early catalyst recognition</li>
                          <li>• Momentum shift prediction</li>
                        </ul>
                      </div>
                      <div>
                        <span className="text-yellow-400 font-medium">Risk Management:</span>
                        <ul className="text-gray-400 mt-1 space-y-1">
                          <li>• Confidence-based position sizing</li>
                          <li>• Dynamic stop-loss placement</li>
                          <li>• Multi-signal confirmation</li>
                          <li>• False positive filtering</li>
                        </ul>
                      </div>
                    </div>
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