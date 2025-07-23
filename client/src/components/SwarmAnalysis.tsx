import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Users, TrendingUp, TrendingDown, Shield, BarChart3, Globe, Target, AlertTriangle } from "lucide-react";
import { useState } from "react";

interface AgentAnalysis {
  agentName: string;
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  reasoning: string;
  keyPoints: string[];
  riskAssessment: string;
}

interface SwarmAnalysis {
  symbol: string;
  consensus: {
    action: 'BUY' | 'SELL' | 'HOLD';
    confidence: number;
    grade: string;
    targetPrice: number;
    stopLoss: number;
  };
  agentAnalyses: AgentAnalysis[];
  collaboration: {
    agreements: string[];
    disagreements: string[];
    finalReasoning: string;
  };
  marketContext: {
    newsHeadlines: string[];
    socialSentiment: string;
    technicalIndicators: any;
  };
}

interface SwarmAnalysisProps {
  symbol?: string;
}

export function SwarmAnalysis({ symbol }: SwarmAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: swarmStatus } = useQuery<{ agents: number; status: string }>({
    queryKey: ['/api/swarm/status'],
    refetchInterval: 30000
  });

  const { data: analysis, isLoading, refetch } = useQuery<SwarmAnalysis>({
    queryKey: ['/api/swarm/analyze', symbol],
    enabled: !!symbol && !isAnalyzing,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false
  });

  const handleAnalyze = async () => {
    if (!symbol) return;
    setIsAnalyzing(true);
    try {
      await refetch();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getAgentIcon = (agentName: string) => {
    switch (agentName) {
      case 'TechnicalAnalyst': return <BarChart3 className="h-4 w-4" />;
      case 'FundamentalAnalyst': return <TrendingUp className="h-4 w-4" />;
      case 'SentimentAnalyst': return <Users className="h-4 w-4" />;
      case 'RiskManager': return <Shield className="h-4 w-4" />;
      case 'MacroAnalyst': return <Globe className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'BUY': return 'text-green-400 bg-green-900/20 border-green-800';
      case 'SELL': return 'text-red-400 bg-red-900/20 border-red-800';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-800';
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-400 bg-green-900/20 border-green-800';
    if (grade.startsWith('B')) return 'text-blue-400 bg-blue-900/20 border-blue-800';
    if (grade.startsWith('C')) return 'text-yellow-400 bg-yellow-900/20 border-yellow-800';
    return 'text-red-400 bg-red-900/20 border-red-800';
  };

  return (
    <div className="space-y-6">
      {/* Swarm Status */}
      <Card className="bg-[var(--trading-slate)] border-gray-700">
        <CardHeader className="border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-400" />
              <h2 className="text-lg font-semibold text-white">AI Swarm Intelligence</h2>
              <Badge variant="outline" className="text-purple-400 border-purple-400">
                {swarmStatus?.agents || 5} Agents
              </Badge>
            </div>
            {symbol && (
              <Button 
                onClick={handleAnalyze}
                disabled={isAnalyzing || isLoading}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isAnalyzing || isLoading ? 'Analyzing...' : 'Analyze'} ${symbol}
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="text-gray-300">
            <p className="mb-2">{swarmStatus?.status || 'AI Swarm Ready'}</p>
            <div className="grid grid-cols-5 gap-2 text-sm">
              <div className="text-center p-2 bg-gray-800 rounded">
                <BarChart3 className="h-4 w-4 mx-auto mb-1 text-blue-400" />
                <div className="text-xs">Technical</div>
              </div>
              <div className="text-center p-2 bg-gray-800 rounded">
                <TrendingUp className="h-4 w-4 mx-auto mb-1 text-green-400" />
                <div className="text-xs">Fundamental</div>
              </div>
              <div className="text-center p-2 bg-gray-800 rounded">
                <Users className="h-4 w-4 mx-auto mb-1 text-yellow-400" />
                <div className="text-xs">Sentiment</div>
              </div>
              <div className="text-center p-2 bg-gray-800 rounded">
                <Shield className="h-4 w-4 mx-auto mb-1 text-red-400" />
                <div className="text-xs">Risk</div>
              </div>
              <div className="text-center p-2 bg-gray-800 rounded">
                <Globe className="h-4 w-4 mx-auto mb-1 text-purple-400" />
                <div className="text-xs">Macro</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Swarm Consensus */}
      {analysis && (
        <Card className="bg-[var(--trading-slate)] border-gray-700">
          <CardHeader className="border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-400" />
              <h2 className="text-lg font-semibold text-white">Swarm Consensus - ${analysis.symbol}</h2>
              <Badge className={getGradeColor(analysis.consensus.grade)}>
                Grade {analysis.consensus.grade}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <Badge className={getRecommendationColor(analysis.consensus.action)} size="lg">
                  {analysis.consensus.action}
                </Badge>
                <div className="text-gray-400 text-sm mt-1">Recommendation</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {analysis.consensus.confidence}%
                </div>
                <div className="text-gray-400 text-sm">Confidence</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  ${analysis.consensus.targetPrice.toFixed(2)}
                </div>
                <div className="text-gray-400 text-sm">Target</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">
                  ${analysis.consensus.stopLoss.toFixed(2)}
                </div>
                <div className="text-gray-400 text-sm">Stop Loss</div>
              </div>
            </div>

            {/* Market Context */}
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <h3 className="text-white font-medium text-sm mb-2">Market Context</h3>
              <div className="text-gray-300 text-sm space-y-1">
                <div><strong>Social:</strong> {analysis.marketContext.socialSentiment}</div>
                {analysis.marketContext.newsHeadlines.length > 0 && (
                  <div><strong>News:</strong> {analysis.marketContext.newsHeadlines[0]}</div>
                )}
              </div>
            </div>

            {/* Collaboration Summary */}
            <div className="space-y-3">
              {analysis.collaboration.agreements.length > 0 && (
                <div className="bg-green-900/20 border border-green-800 rounded-lg p-3">
                  <h4 className="text-green-400 font-medium text-sm mb-2">Agent Agreements</h4>
                  {analysis.collaboration.agreements.map((agreement, index) => (
                    <div key={index} className="text-green-300 text-sm">{agreement}</div>
                  ))}
                </div>
              )}

              {analysis.collaboration.disagreements.length > 0 && (
                <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-3">
                  <h4 className="text-yellow-400 font-medium text-sm mb-2">Agent Disagreements</h4>
                  {analysis.collaboration.disagreements.map((disagreement, index) => (
                    <div key={index} className="text-yellow-300 text-sm">{disagreement}</div>
                  ))}
                </div>
              )}

              <div className="text-gray-300 text-sm bg-gray-800 rounded-lg p-3">
                <strong>Final Reasoning:</strong> {analysis.collaboration.finalReasoning}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Individual Agent Analyses */}
      {analysis?.agentAnalyses && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysis.agentAnalyses.map((agent, index) => (
            <Card key={index} className="bg-[var(--trading-slate)] border-gray-700">
              <CardHeader className="border-b border-gray-700">
                <div className="flex items-center space-x-2">
                  {getAgentIcon(agent.agentName)}
                  <h3 className="text-white font-medium">{agent.agentName}</h3>
                  <Badge className={getRecommendationColor(agent.recommendation)}>
                    {agent.recommendation}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Confidence</span>
                    <span className="text-white font-medium">{agent.confidence}%</span>
                  </div>
                  
                  <div>
                    <h4 className="text-gray-400 text-sm mb-1">Reasoning</h4>
                    <p className="text-gray-300 text-sm">{agent.reasoning}</p>
                  </div>

                  {agent.keyPoints.length > 0 && (
                    <div>
                      <h4 className="text-gray-400 text-sm mb-1">Key Points</h4>
                      <ul className="text-gray-300 text-sm space-y-1">
                        {agent.keyPoints.map((point, idx) => (
                          <li key={idx} className="flex items-start space-x-1">
                            <span className="text-gray-500 mt-1">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="bg-gray-800 rounded p-2">
                    <div className="flex items-center space-x-1">
                      <AlertTriangle className="h-3 w-3 text-yellow-400" />
                      <span className="text-gray-400 text-xs">Risk Assessment:</span>
                    </div>
                    <p className="text-gray-300 text-xs mt-1">{agent.riskAssessment}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Analysis State */}
      {!analysis && !isLoading && symbol && (
        <Card className="bg-[var(--trading-slate)] border-gray-700">
          <CardContent className="p-8 text-center">
            <Brain className="h-12 w-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-2">Ready for Swarm Analysis</h3>
            <p className="text-gray-400 mb-4">
              Deploy 5 AI agents to analyze ${symbol} from multiple perspectives
            </p>
            <Button 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isAnalyzing ? 'Deploying Swarm...' : 'Deploy AI Swarm'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}