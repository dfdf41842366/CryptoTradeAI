import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LivePrice } from "@/components/LivePrice";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Analytics } from "@shared/schema";
import { Atom, Zap, Eye, Radar, Target, Activity, TrendingUp, Brain } from "lucide-react";

interface QuantumSignal {
  symbol: string;
  quantumScore: number;
  probabilityField: number;
  entanglementStrength: number;
  coherenceLevel: number;
  superpositionState: 'bullish' | 'bearish' | 'neutral';
  quantumAdvantage: number;
  nextProbabilityShift: Date;
  hiddenPatterns: string[];
}

interface MarketQuantumField {
  symbol: string;
  currentPrice: number;
  quantumMomentum: number;
  probabilityDensity: number;
  uncertaintyPrinciple: number;
  marketEntanglement: string[];
  quantumTunneling: {
    resistance: number;
    probability: number;
    targetPrice: number;
  };
  waveFunction: {
    amplitude: number;
    frequency: number;
    phase: string;
  };
}

export function QuantumAnalysisPage() {
  const [scanningActive, setScanningActive] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState('TSLA');

  const { data: analytics } = useQuery<Analytics>({
    queryKey: ['/api/analytics'],
  });

  const quantumSignals: QuantumSignal[] = [
    {
      symbol: 'TSLA',
      quantumScore: 94.7,
      probabilityField: 87.3,
      entanglementStrength: 91.2,
      coherenceLevel: 89.4,
      superpositionState: 'bullish',
      quantumAdvantage: 23.4,
      nextProbabilityShift: new Date(Date.now() + 3600000),
      hiddenPatterns: ['Quantum Resonance at $242', 'Probability Wave Convergence', 'Dark Pool Entanglement']
    },
    {
      symbol: 'NVDA',
      quantumScore: 96.2,
      probabilityField: 92.1,
      entanglementStrength: 88.7,
      coherenceLevel: 94.3,
      superpositionState: 'bullish',
      quantumAdvantage: 28.7,
      nextProbabilityShift: new Date(Date.now() + 7200000),
      hiddenPatterns: ['AI Sector Quantum Field', 'Institutional Entanglement', 'Earnings Wave Function']
    },
    {
      symbol: 'AAPL',
      quantumScore: 78.9,
      probabilityField: 76.4,
      entanglementStrength: 82.1,
      coherenceLevel: 74.8,
      superpositionState: 'neutral',
      quantumAdvantage: 12.3,
      nextProbabilityShift: new Date(Date.now() + 5400000),
      hiddenPatterns: ['Market Cap Gravity Well', 'Dividend Quantum State', 'Supply Chain Entanglement']
    }
  ];

  const marketFields: MarketQuantumField[] = [
    {
      symbol: 'TSLA',
      currentPrice: 238.92,
      quantumMomentum: 0.847,
      probabilityDensity: 0.923,
      uncertaintyPrinciple: 0.156,
      marketEntanglement: ['RIVN', 'F', 'GM', 'NIO'],
      quantumTunneling: {
        resistance: 245.0,
        probability: 0.734,
        targetPrice: 252.40
      },
      waveFunction: {
        amplitude: 1.34,
        frequency: 0.67,
        phase: 'ascending'
      }
    }
  ];

  const getSuperpositionColor = (state: QuantumSignal['superpositionState']) => {
    switch (state) {
      case 'bullish': return 'text-green-400 bg-green-900/20 border-green-800';
      case 'bearish': return 'text-red-400 bg-red-900/20 border-red-800';
      case 'neutral': return 'text-yellow-400 bg-yellow-900/20 border-yellow-800';
    }
  };

  const startQuantumScan = () => {
    setScanningActive(true);
    setTimeout(() => setScanningActive(false), 3000);
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
                <h1 className="text-3xl font-bold text-white mb-2">Quantum Market Analysis</h1>
                <p className="text-gray-400">Advanced quantum computing algorithms revealing hidden market patterns</p>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="text-purple-400 border-purple-400">
                  <Atom className="h-3 w-3 mr-1" />
                  Quantum Engine Online
                </Badge>
                <Button 
                  onClick={startQuantumScan}
                  disabled={scanningActive}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Radar className="h-4 w-4 mr-2" />
                  {scanningActive ? 'Scanning...' : 'Quantum Scan'}
                </Button>
              </div>
            </div>

            {/* Quantum Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Atom className="h-4 w-4 text-purple-400" />
                    <div>
                      <div className="text-2xl font-bold text-purple-400">Q-Score</div>
                      <div className="text-lg text-white">89.7</div>
                      <div className="text-sm text-gray-400">Market Quantum State</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-blue-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4 text-blue-400" />
                    <div>
                      <div className="text-2xl font-bold text-blue-400">Dark Signals</div>
                      <div className="text-lg text-white">17</div>
                      <div className="text-sm text-gray-400">Hidden Patterns</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-green-400" />
                    <div>
                      <div className="text-2xl font-bold text-green-400">Entanglement</div>
                      <div className="text-lg text-white">94.2%</div>
                      <div className="text-sm text-gray-400">Market Coherence</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-900/30 to-pink-900/30 border-red-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-red-400" />
                    <div>
                      <div className="text-2xl font-bold text-red-400">Probability</div>
                      <div className="text-lg text-white">87.6%</div>
                      <div className="text-sm text-gray-400">Next Move Certainty</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quantum Signals */}
            <Card className="bg-[var(--trading-slate)] border-gray-700">
              <CardHeader className="border-b border-gray-700">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-purple-400" />
                  <h2 className="text-lg font-semibold text-white">Quantum Trading Signals</h2>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="space-y-4">
                  {quantumSignals.map((signal, index) => (
                    <div key={index} className="p-4 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg border border-gray-700">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <Badge className="bg-blue-600 text-white">${signal.symbol}</Badge>
                          <Badge className={getSuperpositionColor(signal.superpositionState)}>
                            {signal.superpositionState.toUpperCase()}
                          </Badge>
                          <span className="text-purple-400 font-medium">
                            Quantum Score: {signal.quantumScore}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 font-bold">
                            +{signal.quantumAdvantage.toFixed(1)}% Advantage
                          </div>
                          <div className="text-gray-400 text-sm">
                            Next shift: {signal.nextProbabilityShift.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center p-3 bg-gray-800 rounded">
                          <div className="text-purple-400 font-medium">Probability Field</div>
                          <div className="text-xl font-bold text-white">{signal.probabilityField.toFixed(1)}</div>
                          <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                            <div 
                              className="bg-purple-400 h-2 rounded-full"
                              style={{width: `${signal.probabilityField}%`}}
                            ></div>
                          </div>
                        </div>

                        <div className="text-center p-3 bg-gray-800 rounded">
                          <div className="text-blue-400 font-medium">Entanglement</div>
                          <div className="text-xl font-bold text-white">{signal.entanglementStrength.toFixed(1)}</div>
                          <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-400 h-2 rounded-full"
                              style={{width: `${signal.entanglementStrength}%`}}
                            ></div>
                          </div>
                        </div>

                        <div className="text-center p-3 bg-gray-800 rounded">
                          <div className="text-green-400 font-medium">Coherence</div>
                          <div className="text-xl font-bold text-white">{signal.coherenceLevel.toFixed(1)}</div>
                          <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                            <div 
                              className="bg-green-400 h-2 rounded-full"
                              style={{width: `${signal.coherenceLevel}%`}}
                            ></div>
                          </div>
                        </div>

                        <div className="text-center p-3 bg-gray-800 rounded">
                          <div className="text-yellow-400 font-medium">Q-Advantage</div>
                          <div className="text-xl font-bold text-white">{signal.quantumAdvantage.toFixed(1)}%</div>
                          <div className="flex items-center justify-center mt-1">
                            <TrendingUp className="h-4 w-4 text-yellow-400" />
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-gray-900 rounded border border-purple-800">
                        <div className="flex items-center space-x-2 mb-2">
                          <Brain className="h-4 w-4 text-purple-400" />
                          <span className="text-purple-400 font-medium">Hidden Patterns Detected:</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          {signal.hiddenPatterns.map((pattern, patternIndex) => (
                            <div key={patternIndex} className="text-xs text-gray-300 bg-gray-800 px-2 py-1 rounded">
                              {pattern}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quantum Field Analysis */}
            <Card className="bg-[var(--trading-slate)] border-gray-700">
              <CardHeader className="border-b border-gray-700">
                <div className="flex items-center space-x-2">
                  <Atom className="h-5 w-5 text-cyan-400" />
                  <h2 className="text-lg font-semibold text-white">Market Quantum Field</h2>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                {marketFields.map((field, index) => (
                  <div key={index} className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge className="bg-cyan-600 text-white text-lg px-3 py-1">
                          ${field.symbol}
                        </Badge>
                        <LivePrice symbol={field.symbol} className="text-white text-xl font-bold" />
                      </div>
                      <Badge variant="outline" className="text-cyan-400 border-cyan-400">
                        Quantum State: Active
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-4 bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-800 rounded-lg">
                        <h3 className="text-cyan-400 font-medium mb-3">Quantum Momentum</h3>
                        <div className="text-2xl font-bold text-white mb-2">
                          {field.quantumMomentum.toFixed(3)}
                        </div>
                        <div className="text-sm text-gray-400 mb-3">
                          Probability Density: {field.probabilityDensity.toFixed(3)}
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3">
                          <div 
                            className="bg-cyan-400 h-3 rounded-full"
                            style={{width: `${field.quantumMomentum * 100}%`}}
                          ></div>
                        </div>
                      </div>

                      <div className="p-4 bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-800 rounded-lg">
                        <h3 className="text-purple-400 font-medium mb-3">Quantum Tunneling</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Resistance:</span>
                            <span className="text-white">${field.quantumTunneling.resistance.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Probability:</span>
                            <span className="text-purple-400">{(field.quantumTunneling.probability * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Target:</span>
                            <span className="text-green-400">${field.quantumTunneling.targetPrice.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3 mt-3">
                          <div 
                            className="bg-purple-400 h-3 rounded-full"
                            style={{width: `${field.quantumTunneling.probability * 100}%`}}
                          ></div>
                        </div>
                      </div>

                      <div className="p-4 bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-800 rounded-lg">
                        <h3 className="text-green-400 font-medium mb-3">Wave Function</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Amplitude:</span>
                            <span className="text-white">{field.waveFunction.amplitude.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Frequency:</span>
                            <span className="text-blue-400">{field.waveFunction.frequency.toFixed(2)} Hz</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Phase:</span>
                            <Badge className="text-green-400 bg-green-900/20 border-green-800">
                              {field.waveFunction.phase}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
                      <h3 className="text-yellow-400 font-medium mb-3 flex items-center space-x-2">
                        <Zap className="h-4 w-4" />
                        <span>Market Entanglement Network</span>
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400">Entangled with:</span>
                        {field.marketEntanglement.map((symbol, entIndex) => (
                          <Badge key={entIndex} variant="outline" className="text-yellow-400 border-yellow-800">
                            ${symbol}
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-2 text-sm text-gray-400">
                        Uncertainty Principle: ±{(field.uncertaintyPrinciple * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}