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
import { Brain, MessageCircle, ThumbsUp, ThumbsDown, Users, Zap, Target, TrendingUp, Shield, Eye, Activity, Clock } from "lucide-react";

interface ThinkingEngine {
  id: string;
  name: string;
  specialty: string;
  personality: string;
  experience: string;
  currentArgument: string;
  position: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  reasoning: string[];
  counterPoints: string[];
  reputation: number;
  winRate: number;
  debateStyle: string;
}

interface TradeDebate {
  symbol: string;
  currentPrice: number;
  proposition: string;
  totalVotes: number;
  bullishVotes: number;
  bearishVotes: number;
  neutralVotes: number;
  debateStarted: string;
  consensus: number;
  finalDecision: 'BUY' | 'SELL' | 'HOLD' | 'DEBATING';
  keyPoints: string[];
  riskFactors: string[];
}

export default function AICouncilPage() {
  const [debateActive, setDebateActive] = useState(true);
  const [currentSpeaker, setCurrentSpeaker] = useState(0);
  const [debateRound, setDebateRound] = useState(2);
  const [consensusReached, setConsensusReached] = useState(false);
  
  const { data: analytics } = useQuery<Analytics>({
    queryKey: ["/api/analytics"],
  });

  const thinkingEngines: ThinkingEngine[] = [
    {
      id: 'technical_titan',
      name: 'Technical Titan',
      specialty: 'Chart Patterns & Technical Analysis',
      personality: 'Analytical, Data-Driven, Methodical',
      experience: '15 years algorithmic trading',
      currentArgument: 'RSI oversold at 28.4, MACD bullish crossover imminent, strong support at $1.75',
      position: 'bullish',
      confidence: 87,
      reasoning: ['Strong technical indicators', 'Bullish divergence forming', 'Volume confirmation'],
      counterPoints: ['Bearish trend intact', 'Resistance at $2.10', 'Low volume concern'],
      reputation: 94.2,
      winRate: 89.7,
      debateStyle: 'Presents data-heavy arguments with charts'
    },
    {
      id: 'fundamental_prophet',
      name: 'Fundamental Prophet',
      specialty: 'Company Valuation & Financial Analysis',
      personality: 'Conservative, Thorough, Value-Focused',
      experience: '20 years equity research',
      currentArgument: 'P/E ratio 40% below sector average, strong cash flow, upcoming catalyst events',
      position: 'bullish',
      confidence: 76,
      reasoning: ['Undervalued metrics', 'Strong fundamentals', 'Positive earnings trend'],
      counterPoints: ['High debt levels', 'Declining margins', 'Competitive pressure'],
      reputation: 91.8,
      winRate: 84.3,
      debateStyle: 'Deep financial analysis with ratios'
    },
    {
      id: 'sentiment_sage',
      name: 'Sentiment Sage',
      specialty: 'Market Psychology & Social Media',
      personality: 'Intuitive, Emotional Intelligence, Trend-Aware',
      experience: '12 years behavioral finance',
      currentArgument: 'Twitter sentiment 73% positive, Reddit mentions up 340%, influencer bullishness',
      position: 'bullish',
      confidence: 82,
      reasoning: ['Positive social sentiment', 'Viral momentum building', 'Retail interest surge'],
      counterPoints: ['Sentiment can reverse quickly', 'Pump and dump risk', 'Overhype concern'],
      reputation: 88.7,
      winRate: 81.2,
      debateStyle: 'Emotional and psychological arguments'
    },
    {
      id: 'risk_realist',
      name: 'Risk Realist',
      specialty: 'Risk Management & Portfolio Theory',
      personality: 'Cautious, Systematic, Conservative',
      experience: '18 years risk management',
      currentArgument: 'High volatility 47%, correlation risk with sector, position size must be limited',
      position: 'neutral',
      confidence: 91,
      reasoning: ['Risk-adjusted returns poor', 'High correlation exposure', 'Volatility concerns'],
      counterPoints: ['Limited downside at current price', 'Stop-loss protection', 'Diversification benefit'],
      reputation: 96.4,
      winRate: 92.1,
      debateStyle: 'Conservative with risk calculations'
    },
    {
      id: 'macro_maestro',
      name: 'Macro Maestro',
      specialty: 'Macroeconomic Analysis & Market Cycles',
      personality: 'Big Picture, Strategic, Forward-Thinking',
      experience: '22 years macro trading',
      currentArgument: 'Fed policy tailwinds, sector rotation favorable, economic cycle supportive',
      position: 'bullish',
      confidence: 79,
      reasoning: ['Macro environment positive', 'Sector rotation trend', 'Policy support'],
      counterPoints: ['Recession risks', 'Rate hike concerns', 'Sector headwinds'],
      reputation: 93.1,
      winRate: 86.8,
      debateStyle: 'Top-down economic perspective'
    },
    {
      id: 'momentum_maverick',
      name: 'Momentum Maverick',
      specialty: 'Momentum Trading & Price Action',
      personality: 'Aggressive, Fast-Paced, Opportunistic',
      experience: '10 years momentum trading',
      currentArgument: 'Breakout momentum strong, volume surge 280%, short squeeze potential high',
      position: 'bullish',
      confidence: 94,
      reasoning: ['Strong momentum signals', 'Volume breakout', 'Short interest high'],
      counterPoints: ['Momentum can fade quickly', 'Overbought conditions', 'Profit taking likely'],
      reputation: 87.5,
      winRate: 88.9,
      debateStyle: 'High-energy momentum arguments'
    },
    {
      id: 'contrarian_crusher',
      name: 'Contrarian Crusher',
      specialty: 'Contrarian Analysis & Market Inefficiencies',
      personality: 'Skeptical, Independent, Counter-Trend',
      experience: '16 years contrarian investing',
      currentArgument: 'Everyone bullish = bearish signal, retail euphoria peak, smart money selling',
      position: 'bearish',
      confidence: 85,
      reasoning: ['Contrarian indicators flashing', 'Overcrowded trade', 'Smart money divergence'],
      counterPoints: ['Trend still strong', 'Fundamentals support price', 'Early for reversal'],
      reputation: 89.9,
      winRate: 83.7,
      debateStyle: 'Challenges consensus with contrarian views'
    },
    {
      id: 'quant_queen',
      name: 'Quant Queen',
      specialty: 'Quantitative Models & Statistical Analysis',
      personality: 'Mathematical, Precise, Model-Based',
      experience: '14 years quantitative research',
      currentArgument: 'Statistical model shows 78% probability of 15%+ move, regression analysis bullish',
      position: 'bullish',
      confidence: 88,
      reasoning: ['Statistical edge confirmed', 'Model backtesting positive', 'Probability favors upside'],
      counterPoints: ['Model assumptions risky', 'Overfitting concerns', 'Market regime change'],
      reputation: 92.7,
      winRate: 90.4,
      debateStyle: 'Mathematical proofs and statistics'
    },
    {
      id: 'news_ninja',
      name: 'News Ninja',
      specialty: 'News Analysis & Event-Driven Trading',
      personality: 'Fast, Reactive, Information-Focused',
      experience: '11 years event trading',
      currentArgument: 'Breaking: Partnership rumors, SEC filing positive, analyst upgrade imminent',
      position: 'bullish',
      confidence: 81,
      reasoning: ['Positive news flow', 'Catalyst pipeline strong', 'Information edge'],
      counterPoints: ['News already priced in', 'Rumor risk', 'Disappointment potential'],
      reputation: 86.3,
      winRate: 82.6,
      debateStyle: 'Fast-paced news-based arguments'
    },
    {
      id: 'volatility_viper',
      name: 'Volatility Viper',
      specialty: 'Options Trading & Volatility Analysis',
      personality: 'Complex, Multi-Dimensional, Greeks-Focused',
      experience: '13 years derivatives trading',
      currentArgument: 'IV crush post-earnings, gamma squeeze setup, put/call ratio extreme',
      position: 'neutral',
      confidence: 86,
      reasoning: ['Volatility mispricing', 'Options flow bullish', 'Gamma dynamics favor'],
      counterPoints: ['Volatility risk high', 'Time decay concern', 'Options expiry risk'],
      reputation: 90.8,
      winRate: 87.2,
      debateStyle: 'Complex derivatives and volatility focus'
    }
  ];

  const currentDebate: TradeDebate = {
    symbol: 'PROG',
    currentPrice: 1.84,
    proposition: 'PROG presents a high-probability breakout opportunity with 23%+ upside potential',
    totalVotes: 10,
    bullishVotes: 7,
    bearishVotes: 1,
    neutralVotes: 2,
    debateStarted: '3 minutes ago',
    consensus: 72,
    finalDecision: 'DEBATING',
    keyPoints: [
      'Strong technical breakout pattern with volume confirmation',
      'Undervalued on fundamental metrics with upcoming catalysts',
      'Positive sentiment surge across social media platforms',
      'Momentum indicators showing bullish divergence',
      'High short interest creates squeeze potential'
    ],
    riskFactors: [
      'High volatility presents significant downside risk',
      'Contrarian indicators suggest overcrowded trade',
      'Market correlation risk with biotech sector weakness',
      'Options expiry could create volatility headwinds'
    ]
  };

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'bullish': return 'text-green-400 bg-green-900/20 border-green-800';
      case 'bearish': return 'text-red-400 bg-red-900/20 border-red-800';
      case 'neutral': return 'text-yellow-400 bg-yellow-900/20 border-yellow-800';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-800';
    }
  };

  const startNewDebate = () => {
    setDebateRound(1);
    setCurrentSpeaker(0);
    setConsensusReached(false);
    setDebateActive(true);
  };

  useEffect(() => {
    if (debateActive) {
      const interval = setInterval(() => {
        setCurrentSpeaker((prev) => (prev + 1) % thinkingEngines.length);
      }, 4000);
      
      return () => clearInterval(interval);
    }
  }, [debateActive]);

  useEffect(() => {
    if (currentSpeaker === 0 && debateRound < 3) {
      setDebateRound((prev) => prev + 1);
    }
    
    if (debateRound >= 3) {
      setConsensusReached(true);
      setDebateActive(false);
    }
  }, [currentSpeaker, debateRound]);

  return (
    <div className="min-h-screen bg-[var(--trading-dark)]">
      <Header analytics={analytics} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 ml-64">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  AI Trading Council
                </h1>
                <p className="text-gray-400">10 specialized AI engines debating every trade decision with rigorous analysis</p>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="text-blue-400 border-blue-400">
                  <Users className="h-3 w-3 mr-1" />
                  10 Engines
                </Badge>
                <Badge variant="outline" className="text-purple-400 border-purple-400">
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Active Debate
                </Badge>
                <Button 
                  onClick={startNewDebate}
                  disabled={debateActive}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {debateActive ? `Round ${debateRound}` : 'Start New Debate'}
                </Button>
              </div>
            </div>

            {/* Current Debate Status */}
            <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-700">
              <CardHeader className="border-b border-blue-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Current Debate: {currentDebate.symbol}</h2>
                    <p className="text-blue-400">{currentDebate.proposition}</p>
                  </div>
                  <div className="text-right">
                    <LivePrice symbol={currentDebate.symbol} className="text-2xl font-bold text-blue-400" />
                    <div className="text-sm text-gray-400">Current Price</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{currentDebate.bullishVotes}</div>
                    <div className="text-sm text-gray-400">Bullish Votes</div>
                    <div className="text-xs text-green-300 mt-1">70% of engines</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">{currentDebate.bearishVotes}</div>
                    <div className="text-sm text-gray-400">Bearish Votes</div>
                    <div className="text-xs text-red-300 mt-1">10% of engines</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{currentDebate.neutralVotes}</div>
                    <div className="text-sm text-gray-400">Neutral Votes</div>
                    <div className="text-xs text-yellow-300 mt-1">20% of engines</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{currentDebate.consensus}%</div>
                    <div className="text-sm text-gray-400">Consensus Level</div>
                    <div className="text-xs text-purple-300 mt-1">{consensusReached ? 'Reached' : 'Building'}</div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300">Consensus Progress:</span>
                    <span className="text-purple-400 font-mono">{currentDebate.consensus}%</span>
                  </div>
                  <Progress value={currentDebate.consensus} className="h-3 bg-gray-800" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-green-400 mb-2">Key Arguments For:</h4>
                    <ul className="space-y-1">
                      {currentDebate.keyPoints.slice(0, 3).map((point, index) => (
                        <li key={index} className="text-sm text-gray-300 flex items-start space-x-2">
                          <ThumbsUp className="h-3 w-3 text-green-400 mt-1 flex-shrink-0" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-red-400 mb-2">Risk Factors:</h4>
                    <ul className="space-y-1">
                      {currentDebate.riskFactors.slice(0, 3).map((risk, index) => (
                        <li key={index} className="text-sm text-gray-300 flex items-start space-x-2">
                          <ThumbsDown className="h-3 w-3 text-red-400 mt-1 flex-shrink-0" />
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Speaker */}
            {debateActive && (
              <Card className="bg-[var(--trading-slate)] border-yellow-600">
                <CardHeader className="border-b border-yellow-600">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
                    <h3 className="text-lg font-semibold text-white">
                      Now Speaking: {thinkingEngines[currentSpeaker].name}
                    </h3>
                    <Badge className="text-yellow-400 bg-yellow-900/20 border-yellow-800">
                      Round {debateRound}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                      <Brain className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium mb-2">"{thinkingEngines[currentSpeaker].currentArgument}"</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>Specialty: {thinkingEngines[currentSpeaker].specialty}</span>
                        <span>Confidence: {thinkingEngines[currentSpeaker].confidence}%</span>
                        <Badge className={getPositionColor(thinkingEngines[currentSpeaker].position)}>
                          {thinkingEngines[currentSpeaker].position.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Engines Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {thinkingEngines.map((engine, index) => (
                <Card 
                  key={engine.id} 
                  className={`bg-[var(--trading-slate)] ${
                    index === currentSpeaker && debateActive 
                      ? 'border-yellow-500 shadow-lg shadow-yellow-500/20' 
                      : 'border-gray-700'
                  }`}
                >
                  <CardHeader className="border-b border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <Brain className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-md font-semibold text-white">{engine.name}</h3>
                          <p className="text-sm text-gray-400">{engine.specialty}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getPositionColor(engine.position)}>
                          {engine.position.toUpperCase()}
                        </Badge>
                        {index === currentSpeaker && debateActive && (
                          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div>
                          <div className="text-sm font-bold text-blue-400">{engine.reputation}%</div>
                          <div className="text-xs text-gray-400">Reputation</div>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-green-400">{engine.winRate}%</div>
                          <div className="text-xs text-gray-400">Win Rate</div>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-purple-400">{engine.confidence}%</div>
                          <div className="text-xs text-gray-400">Confidence</div>
                        </div>
                      </div>

                      <div className="p-3 bg-gray-800 rounded-lg">
                        <p className="text-sm text-white italic">"{engine.currentArgument}"</p>
                      </div>

                      <div>
                        <h4 className="text-xs font-medium text-gray-400 mb-1">Key Reasoning:</h4>
                        <div className="flex flex-wrap gap-1">
                          {engine.reasoning.slice(0, 2).map((reason, i) => (
                            <Badge key={i} size="sm" variant="outline" className="text-xs text-cyan-300">
                              {reason}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="text-xs text-gray-500">
                        Style: {engine.debateStyle}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Final Decision */}
            {consensusReached && (
              <Card className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-700">
                <CardHeader className="border-b border-green-700">
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-green-400" />
                    <h3 className="text-lg font-semibold text-white">Council Trade Decision</h3>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-green-400 mb-2">BUY {currentDebate.symbol}</div>
                    <div className="text-lg text-gray-300">Consensus: {currentDebate.consensus}% Agreement</div>
                  </div>
                  
                  {/* Detailed Trade Specifications */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="p-4 bg-gray-800 rounded-lg">
                      <h4 className="text-lg font-medium text-white mb-3">Trade Setup</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Entry Price:</span>
                          <span className="text-cyan-400 font-bold">${currentDebate.currentPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Target Price:</span>
                          <span className="text-green-400 font-bold">$2.26</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Stop Loss:</span>
                          <span className="text-red-400 font-bold">$1.62</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Gain Target:</span>
                          <span className="text-green-400 font-bold">+22.8%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Risk/Reward:</span>
                          <span className="text-purple-400 font-bold">3.2:1</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-800 rounded-lg">
                      <h4 className="text-lg font-medium text-white mb-3">Trade Analysis</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Success Probability:</span>
                          <span className="text-blue-400 font-bold">72%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Time Horizon:</span>
                          <span className="text-yellow-400 font-bold">3-7 days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Position Size:</span>
                          <span className="text-cyan-400 font-bold">2.5% portfolio</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Max Loss:</span>
                          <span className="text-red-400 font-bold">-12.0%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Expected Value:</span>
                          <span className="text-green-400 font-bold">+$486</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center p-4 bg-gray-900/50 rounded-lg">
                    <div>
                      <div className="text-2xl font-bold text-green-400">BUY</div>
                      <div className="text-sm text-gray-400">Action</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-400">7/10</div>
                      <div className="text-sm text-gray-400">Engine Votes</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-400">HIGH</div>
                      <div className="text-sm text-gray-400">Confidence</div>
                    </div>
                  </div>

                  {/* Key Catalysts and Risks */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <h5 className="text-sm font-medium text-green-400 mb-2">Supporting Arguments:</h5>
                      <ul className="text-xs text-gray-300 space-y-1">
                        <li>• Technical breakout confirmed with volume</li>
                        <li>• RSI oversold bounce potential</li>
                        <li>• High short interest squeeze setup</li>
                        <li>• Positive sentiment momentum building</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-red-400 mb-2">Risk Considerations:</h5>
                      <ul className="text-xs text-gray-300 space-y-1">
                        <li>• High volatility environment</li>
                        <li>• Biotech sector correlation risk</li>
                        <li>• Potential profit taking at resistance</li>
                        <li>• Market sentiment can shift quickly</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* System Explanation */}
            <Card className="bg-gradient-to-r from-indigo-900/20 to-blue-900/20 border-indigo-700">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <Users className="h-6 w-6 text-indigo-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">AI Trading Council Process</h3>
                    <p className="text-gray-300 text-sm mb-3">
                      Every trade decision goes through rigorous debate by 10 specialized AI engines, each with unique 
                      expertise and personality. They analyze, argue, and challenge each other until reaching consensus 
                      or identifying critical disagreements that require further analysis.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-indigo-400 font-medium">Debate Process:</span>
                        <ul className="text-gray-400 mt-1 space-y-1">
                          <li>• 10 engines present initial positions</li>
                          <li>• Multi-round structured debate</li>
                          <li>• Counter-arguments and rebuttals</li>
                          <li>• Consensus building or majority vote</li>
                        </ul>
                      </div>
                      <div>
                        <span className="text-blue-400 font-medium">Engine Specialties:</span>
                        <ul className="text-gray-400 mt-1 space-y-1">
                          <li>• Technical analysis & patterns</li>
                          <li>• Fundamental valuation</li>
                          <li>• Market sentiment & psychology</li>
                          <li>• Risk management & volatility</li>
                        </ul>
                      </div>
                      <div>
                        <span className="text-purple-400 font-medium">Decision Quality:</span>
                        <ul className="text-gray-400 mt-1 space-y-1">
                          <li>• Multiple perspective analysis</li>
                          <li>• Bias reduction through debate</li>
                          <li>• Reputation-weighted voting</li>
                          <li>• Transparent reasoning process</li>
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