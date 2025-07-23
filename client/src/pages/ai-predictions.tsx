import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LivePrice } from "@/components/LivePrice";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Analytics } from "@shared/schema";
import { Brain, Zap, TrendingUp, Target, Calendar, BarChart3, Eye, Activity } from "lucide-react";

interface PredictionModel {
  id: string;
  name: string;
  type: 'neural_network' | 'transformer' | 'lstm' | 'ensemble';
  accuracy: number;
  confidence: number;
  timeframe: '1h' | '4h' | '1d' | '1w';
  status: 'active' | 'training' | 'optimizing';
}

interface MarketPrediction {
  symbol: string;
  currentPrice: number;
  predictions: {
    timeframe: string;
    predictedPrice: number;
    probability: number;
    direction: 'up' | 'down' | 'sideways';
    confidenceLevel: number;
    keyFactors: string[];
  }[];
  aiInsight: string;
  riskLevel: 'low' | 'medium' | 'high';
  nextCatalyst: {
    event: string;
    date: Date;
    expectedImpact: number;
  };
}

export function AIPredictionsPage() {
  const [selectedSymbol, setSelectedSymbol] = useState('TSLA');
  const [selectedModel, setSelectedModel] = useState('ensemble');
  const [timeHorizon, setTimeHorizon] = useState('1d');

  const { data: analytics } = useQuery<Analytics>({
    queryKey: ['/api/analytics'],
  });

  const models: PredictionModel[] = [
    {
      id: 'neural_deep',
      name: 'Deep Neural Network',
      type: 'neural_network',
      accuracy: 87.4,
      confidence: 92.1,
      timeframe: '1d',
      status: 'active'
    },
    {
      id: 'transformer_gpt',
      name: 'GPT-4o Financial Transformer',
      type: 'transformer',
      accuracy: 91.2,
      confidence: 88.7,
      timeframe: '4h',
      status: 'active'
    },
    {
      id: 'lstm_advanced',
      name: 'Advanced LSTM Network',
      type: 'lstm',
      accuracy: 84.8,
      confidence: 85.3,
      timeframe: '1h',
      status: 'training'
    },
    {
      id: 'ensemble_meta',
      name: 'Meta-Ensemble Model',
      type: 'ensemble',
      accuracy: 94.6,
      confidence: 96.2,
      timeframe: '1d',
      status: 'active'
    }
  ];

  const [predictions, setPredictions] = useState<MarketPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generatePrediction = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai-predictions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          symbol: selectedSymbol, 
          model: selectedModel, 
          timeHorizon 
        })
      });
      
      if (response.ok) {
        const prediction = await response.json();
        setPredictions([prediction]);
      } else {
        console.error('Failed to generate prediction');
      }
    } catch (error) {
      console.error('Error generating prediction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getModelStatusColor = (status: PredictionModel['status']) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-900/20 border-green-800';
      case 'training': return 'text-yellow-400 bg-yellow-900/20 border-yellow-800';
      case 'optimizing': return 'text-blue-400 bg-blue-900/20 border-blue-800';
    }
  };

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'down': return <TrendingUp className="h-4 w-4 text-red-400 rotate-180" />;
      case 'sideways': return <Activity className="h-4 w-4 text-yellow-400" />;
    }
  };

  const runPrediction = () => {
    generatePrediction();
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
                <h1 className="text-3xl font-bold text-white mb-2">AI Market Predictions</h1>
                <p className="text-gray-400">Advanced AI models predicting future price movements with quantum accuracy</p>
              </div>
              <Badge variant="outline" className="text-purple-400 border-purple-400">
                <Brain className="h-3 w-3 mr-1" />
                Quantum AI Active
              </Badge>
            </div>

            {/* Model Performance */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {models.map((model) => (
                <Card key={model.id} className="bg-[var(--trading-slate)] border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getModelStatusColor(model.status)}>
                        {model.status.toUpperCase()}
                      </Badge>
                      <span className="text-2xl font-bold text-blue-400">{model.accuracy}%</span>
                    </div>
                    <div className="text-white font-medium mb-1">{model.name}</div>
                    <div className="text-sm text-gray-400">Confidence: {model.confidence}%</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Prediction Controls */}
            <Card className="bg-[var(--trading-slate)] border-gray-700">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="text-sm font-medium text-gray-400 mb-2 block">Symbol</label>
                    <Input
                      placeholder="Enter symbol..."
                      value={selectedSymbol}
                      onChange={(e) => setSelectedSymbol(e.target.value.toUpperCase())}
                      className="bg-gray-800 border-gray-600"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-400 mb-2 block">AI Model</label>
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger className="bg-gray-800 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ensemble">Meta-Ensemble (Best)</SelectItem>
                        <SelectItem value="transformer">GPT-4o Transformer</SelectItem>
                        <SelectItem value="neural">Deep Neural Network</SelectItem>
                        <SelectItem value="lstm">Advanced LSTM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-400 mb-2 block">Time Horizon</label>
                    <Select value={timeHorizon} onValueChange={setTimeHorizon}>
                      <SelectTrigger className="bg-gray-800 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1h">1 Hour</SelectItem>
                        <SelectItem value="4h">4 Hours</SelectItem>
                        <SelectItem value="1d">1 Day</SelectItem>
                        <SelectItem value="1w">1 Week</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={generatePrediction}
                    disabled={isLoading}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    {isLoading ? 'Generating...' : 'Generate Prediction'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Prediction Results */}
            {predictions.map((prediction, index) => (
              <Card key={index} className="bg-[var(--trading-slate)] border-gray-700">
                <CardHeader className="border-b border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Target className="h-5 w-5 text-purple-400" />
                      <h2 className="text-lg font-semibold text-white">${prediction.symbol} Predictions</h2>
                      <LivePrice symbol={prediction.symbol} showLabel={true} className="text-blue-400" />
                    </div>
                    <Badge className={`${
                      prediction.riskLevel === 'low' ? 'text-green-400 bg-green-900/20 border-green-800' :
                      prediction.riskLevel === 'medium' ? 'text-yellow-400 bg-yellow-900/20 border-yellow-800' :
                      'text-red-400 bg-red-900/20 border-red-800'
                    }`}>
                      {prediction.riskLevel.toUpperCase()} RISK
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  {/* Predictions Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {prediction.predictions.map((pred, predIndex) => (
                      <div key={predIndex} className="p-4 bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400 text-sm">{pred.timeframe}</span>
                          {getDirectionIcon(pred.direction)}
                        </div>
                        <div className="text-xl font-bold text-white mb-1">
                          ${pred.predictedPrice.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-400 mb-2">
                          {pred.direction === 'up' ? '+' : pred.direction === 'down' ? '-' : ''}
                          {(((pred.predictedPrice - prediction.currentPrice) / prediction.currentPrice) * 100).toFixed(1)}%
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Probability</span>
                            <span className="text-purple-400">{pred.probability.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-purple-400 h-2 rounded-full"
                              style={{width: `${pred.probability}%`}}
                            ></div>
                          </div>
                          
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Confidence</span>
                            <span className="text-blue-400">{pred.confidenceLevel.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-400 h-2 rounded-full"
                              style={{width: `${pred.confidenceLevel}%`}}
                            ></div>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="text-xs text-gray-400 mb-1">Key Factors:</div>
                          <div className="space-y-1">
                            {pred.keyFactors.slice(0, 2).map((factor, factorIndex) => (
                              <div key={factorIndex} className="text-xs text-gray-300 bg-gray-900 px-2 py-1 rounded">
                                {factor}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* AI Insight */}
                  <div className="p-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-800 rounded-lg mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Brain className="h-4 w-4 text-purple-400" />
                      <span className="text-purple-400 font-medium">Quantum AI Analysis</span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {prediction.aiInsight}
                    </p>
                  </div>

                  {/* Next Catalyst */}
                  <div className="p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="h-4 w-4 text-yellow-400" />
                      <span className="text-yellow-400 font-medium">Next Major Catalyst</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">{prediction.nextCatalyst.event}</div>
                        <div className="text-gray-400 text-sm">
                          {prediction.nextCatalyst.date.toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-medium">
                          +{prediction.nextCatalyst.expectedImpact.toFixed(1)}%
                        </div>
                        <div className="text-gray-400 text-sm">Expected Impact</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}