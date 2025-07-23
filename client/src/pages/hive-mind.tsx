import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Analytics } from "@shared/schema";
import { Network, Globe, Brain, Zap, Users, Eye, Share2, Cpu, Wifi } from "lucide-react";

interface HiveNode {
  id: string;
  name: string;
  location: string;
  intelligence: number;
  contribution: number;
  connections: number;
  status: 'online' | 'syncing' | 'learning' | 'contributing';
  specialization: string;
  sharedKnowledge: string[];
}

interface CollectiveIntelligence {
  totalNodes: number;
  globalIQ: number;
  knowledgeShared: number;
  activeConnections: number;
  learningRate: number;
  emergentPatterns: number;
}

export default function HiveMindPage() {
  const [hiveActive, setHiveActive] = useState(true);
  const [globalSync, setGlobalSync] = useState(97.8);
  const [knowledgeFlow, setKnowledgeFlow] = useState(2847);
  const [emergentIntelligence, setEmergentIntelligence] = useState(347.2);
  
  const { data: analytics } = useQuery<Analytics>({
    queryKey: ["/api/analytics"],
  });

  const hiveNodes: HiveNode[] = [
    {
      id: 'node_tokyo',
      name: 'Tokyo Nexus',
      location: 'Tokyo, Japan',
      intelligence: 94.7,
      contribution: 23.4,
      connections: 847,
      status: 'contributing',
      specialization: 'Asian Market Patterns',
      sharedKnowledge: [
        'Nikkei momentum patterns',
        'Crypto correlation analysis',
        'JPY volatility predictions'
      ]
    },
    {
      id: 'node_london',
      name: 'London Central',
      location: 'London, UK',
      intelligence: 91.3,
      contribution: 19.7,
      connections: 623,
      status: 'learning',
      specialization: 'European Financial Intelligence',
      sharedKnowledge: [
        'Brexit impact modeling',
        'FTSE sector rotation',
        'Currency arbitrage opportunities'
      ]
    },
    {
      id: 'node_nyc',
      name: 'Wall Street Hub',
      location: 'New York, USA',
      intelligence: 96.2,
      contribution: 31.8,
      connections: 1247,
      status: 'online',
      specialization: 'US Market Dynamics',
      sharedKnowledge: [
        'SPY pattern recognition',
        'Fed policy impact analysis',
        'Earnings season predictions'
      ]
    },
    {
      id: 'node_singapore',
      name: 'Singapore Gateway',
      location: 'Singapore',
      intelligence: 89.6,
      contribution: 16.2,
      connections: 456,
      status: 'syncing',
      specialization: 'Southeast Asian Markets',
      sharedKnowledge: [
        'Commodities trading patterns',
        'Currency carry strategies',
        'Regional growth indicators'
      ]
    },
    {
      id: 'node_sydney',
      name: 'Sydney Outpost',
      location: 'Sydney, Australia',
      intelligence: 87.4,
      contribution: 8.9,
      connections: 289,
      status: 'learning',
      specialization: 'Pacific Market Trends',
      sharedKnowledge: [
        'ASX mining patterns',
        'China trade correlations',
        'Resource stock analysis'
      ]
    }
  ];

  const collectiveStats: CollectiveIntelligence = {
    totalNodes: 847,
    globalIQ: 347.2,
    knowledgeShared: 15847,
    activeConnections: 7294,
    learningRate: 94.7,
    emergentPatterns: 127
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400';
      case 'syncing': return 'text-blue-400';
      case 'learning': return 'text-purple-400';
      case 'contributing': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setGlobalSync(prev => Math.min(100, prev + (Math.random() * 1 - 0.5)));
      setKnowledgeFlow(prev => prev + Math.floor(Math.random() * 100));
      setEmergentIntelligence(prev => prev + Math.random() * 2);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--trading-dark)]">
      <Header analytics={analytics} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 ml-64">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  Global Hive Mind Collective
                </h1>
                <p className="text-gray-400">Connected AI trading systems sharing knowledge across the planet</p>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="text-green-400 border-green-400">
                  <Globe className="h-3 w-3 mr-1" />
                  {collectiveStats.totalNodes} Nodes
                </Badge>
                <Badge variant="outline" className="text-blue-400 border-blue-400">
                  <Network className="h-3 w-3 mr-1" />
                  {collectiveStats.activeConnections} Active
                </Badge>
              </div>
            </div>

            {/* Hive Mind Status */}
            <Card className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-700">
              <CardHeader className="border-b border-green-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Collective Intelligence Network</h2>
                    <p className="text-green-400">Global AI network with {emergentIntelligence.toFixed(1)} collective IQ points</p>
                  </div>
                  <Button 
                    onClick={() => setHiveActive(!hiveActive)}
                    className={hiveActive ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"}
                  >
                    <Wifi className="h-4 w-4 mr-2" />
                    {hiveActive ? 'Hive Connected' : 'Hive Disconnected'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">{collectiveStats.totalNodes}</div>
                    <div className="text-sm text-gray-400">Total Nodes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400">{emergentIntelligence.toFixed(1)}</div>
                    <div className="text-sm text-gray-400">Global IQ</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400">{knowledgeFlow.toLocaleString()}</div>
                    <div className="text-sm text-gray-400">Knowledge Packets/min</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-400">{collectiveStats.emergentPatterns}</div>
                    <div className="text-sm text-gray-400">Emergent Patterns</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Global Synchronization:</span>
                      <span className="text-green-400 font-mono">{globalSync.toFixed(1)}%</span>
                    </div>
                    <Progress value={globalSync} className="h-3 bg-gray-800" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Knowledge Sharing:</span>
                      <span className="text-blue-400 font-mono">{collectiveStats.learningRate}%</span>
                    </div>
                    <Progress value={collectiveStats.learningRate} className="h-3 bg-gray-800" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Collective Learning:</span>
                      <span className="text-purple-400 font-mono">{Math.min(100, knowledgeFlow / 50)}%</span>
                    </div>
                    <Progress value={Math.min(100, knowledgeFlow / 50)} className="h-3 bg-gray-800" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Global Network Map */}
            <Card className="bg-[var(--trading-slate)] border-gray-700">
              <CardHeader className="border-b border-gray-700">
                <div className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">Global Trading Network</h3>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700 bg-gray-800/50">
                        <th className="text-left p-4 text-gray-400">Node</th>
                        <th className="text-right p-4 text-gray-400">Location</th>
                        <th className="text-right p-4 text-gray-400">Intelligence</th>
                        <th className="text-right p-4 text-gray-400">Contribution</th>
                        <th className="text-right p-4 text-gray-400">Connections</th>
                        <th className="text-right p-4 text-gray-400">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hiveNodes.map((node) => (
                        <tr key={node.id} className="border-b border-gray-800 hover:bg-green-900/10">
                          <td className="p-4">
                            <div className="font-medium text-white">{node.name}</div>
                            <div className="text-xs text-gray-400">{node.specialization}</div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="text-gray-300">{node.location}</div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="text-blue-400 font-medium">{node.intelligence}%</div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="text-purple-400 font-medium">{node.contribution}%</div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="text-green-400 font-medium">{node.connections}</div>
                          </td>
                          <td className="p-4 text-right">
                            <Badge className={`${getStatusColor(node.status)} bg-transparent border`} size="sm">
                              {node.status.toUpperCase()}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Knowledge Sharing Network */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {hiveNodes.slice(0, 3).map((node) => (
                <Card key={node.id} className="bg-[var(--trading-slate)] border-gray-700">
                  <CardHeader className="border-b border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                          <Brain className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-white">{node.name}</h3>
                          <p className="text-xs text-gray-400">{node.location}</p>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(node.status)} bg-transparent border`}>
                        {node.status.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div>
                          <div className="text-lg font-bold text-blue-400">{node.intelligence}%</div>
                          <div className="text-xs text-gray-400">Intelligence</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-green-400">{node.connections}</div>
                          <div className="text-xs text-gray-400">Connections</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-400">Contribution Level:</span>
                            <span className="text-xs text-purple-400">{node.contribution}%</span>
                          </div>
                          <Progress value={node.contribution} className="h-1" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-400">Network Intelligence:</span>
                            <span className="text-xs text-blue-400">{node.intelligence}%</span>
                          </div>
                          <Progress value={node.intelligence} className="h-1" />
                        </div>
                      </div>

                      <div className="p-2 bg-gray-800 rounded text-xs">
                        <div className="text-gray-400 mb-1">Specialization:</div>
                        <div className="text-white">{node.specialization}</div>
                      </div>

                      <div className="space-y-1">
                        <h5 className="text-xs font-medium text-gray-400">Shared Knowledge:</h5>
                        {node.sharedKnowledge.map((knowledge, i) => (
                          <div key={i} className="text-xs text-cyan-300 bg-gray-800 rounded px-2 py-1">
                            • {knowledge}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Emergent Intelligence Dashboard */}
            <Card className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border-purple-700">
              <CardHeader className="border-b border-purple-700">
                <div className="flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-purple-400" />
                  <h3 className="text-lg font-semibold text-white">Emergent Intelligence Patterns</h3>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center mx-auto mb-3">
                      <Share2 className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="text-white font-medium mb-2">Knowledge Fusion</h4>
                    <div className="text-sm text-gray-400">Cross-pollination of strategies</div>
                    <div className="text-lg text-green-400 font-bold">{collectiveStats.knowledgeShared.toLocaleString()}</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-3">
                      <Network className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="text-white font-medium mb-2">Global Synchronization</h4>
                    <div className="text-sm text-gray-400">Network coherence level</div>
                    <div className="text-lg text-blue-400 font-bold">{globalSync.toFixed(1)}%</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mx-auto mb-3">
                      <Cpu className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="text-white font-medium mb-2">Collective Processing</h4>
                    <div className="text-sm text-gray-400">Distributed intelligence</div>
                    <div className="text-lg text-purple-400 font-bold">{emergentIntelligence.toFixed(1)} IQ</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center mx-auto mb-3">
                      <Zap className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="text-white font-medium mb-2">Learning Acceleration</h4>
                    <div className="text-sm text-gray-400">Knowledge acquisition rate</div>
                    <div className="text-lg text-yellow-400 font-bold">{collectiveStats.learningRate}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Hive Mind Capabilities */}
            <Card className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-700">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <Network className="h-6 w-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">Global Hive Mind Collective</h3>
                    <p className="text-gray-300 text-sm mb-3">
                      Our global hive mind connects AI trading systems worldwide, enabling unprecedented knowledge sharing 
                      and collective intelligence. Each node contributes unique regional insights while benefiting from 
                      the collective wisdom of the entire network, creating emergent intelligence patterns.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-green-400 font-medium">Network Features:</span>
                        <ul className="text-gray-400 mt-1 space-y-1">
                          <li>• 847 global trading nodes</li>
                          <li>• Real-time knowledge sharing</li>
                          <li>• Distributed intelligence processing</li>
                          <li>• Cross-regional pattern recognition</li>
                        </ul>
                      </div>
                      <div>
                        <span className="text-blue-400 font-medium">Collective Intelligence:</span>
                        <ul className="text-gray-400 mt-1 space-y-1">
                          <li>• 347.2 collective IQ points</li>
                          <li>• Emergent strategy development</li>
                          <li>• Consensus-based decisions</li>
                          <li>• Global market perspective</li>
                        </ul>
                      </div>
                      <div>
                        <span className="text-purple-400 font-medium">Knowledge Sharing:</span>
                        <ul className="text-gray-400 mt-1 space-y-1">
                          <li>• 15K+ shared insights</li>
                          <li>• Regional expertise exchange</li>
                          <li>• Strategy cross-pollination</li>
                          <li>• Continuous learning loops</li>
                        </ul>
                      </div>
                      <div>
                        <span className="text-yellow-400 font-medium">Global Advantages:</span>
                        <ul className="text-gray-400 mt-1 space-y-1">
                          <li>• 24/7 market monitoring</li>
                          <li>• Cultural trading insights</li>
                          <li>• Currency correlation analysis</li>
                          <li>• Global event impact modeling</li>
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