import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
  Brain, 
  Activity, 
  PlayCircle, 
  PauseCircle, 
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Lightbulb,
  Zap,
  Target,
  AlertTriangle,
  Cpu,
  BarChart3
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AIStatus {
  isRunning: boolean;
  consciousnessLevel: number;
  lastAnalysis: string;
  autonomyLevel: string;
  currentFocus: string;
  thoughtsPerSecond: number;
  activeModules: string[];
  networkStatus?: {
    totalConnections: number;
    activeConnections: number;
    averageDataQuality: string;
    averageConnectionStrength: string;
    knowledgeBaseSize: number;
    lastUpdate: string;
  };
}

interface AIProposal {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: string;
  implementation: string;
  estimatedImpact: number;
  riskLevel: string;
  approvalRequired: boolean;
  status: string;
  aiConfidence: number;
  generatedAt: string;
  reviewedAt?: string;
  userFeedback?: string;
}

export default function AutonomousAIPage() {
  const [feedback, setFeedback] = useState<Record<number, string>>({});
  const queryClient = useQueryClient();

  // Fetch AI status
  const { data: aiStatus, isLoading: statusLoading } = useQuery<AIStatus>({
    queryKey: ['/api/ai/status'],
    refetchInterval: 5000 // Update every 5 seconds
  });

  // Fetch AI proposals
  const { data: proposals = [], isLoading: proposalsLoading } = useQuery<AIProposal[]>({
    queryKey: ['/api/ai/proposals'],
    refetchInterval: 30000 // Update every 30 seconds
  });

  // Start AI monitoring
  const startAI = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/ai/start', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to start AI');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/status'] });
    }
  });

  // Stop AI monitoring
  const stopAI = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/ai/stop', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to stop AI');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/status'] });
    }
  });

  // Approve proposal
  const approveProposal = useMutation({
    mutationFn: async ({ id, feedback }: { id: number; feedback: string }) => {
      const response = await fetch(`/api/ai/proposals/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback })
      });
      if (!response.ok) throw new Error('Failed to approve proposal');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/proposals'] });
      setFeedback(prev => ({ ...prev }));
    }
  });

  // Reject proposal
  const rejectProposal = useMutation({
    mutationFn: async ({ id, feedback }: { id: number; feedback: string }) => {
      const response = await fetch(`/api/ai/proposals/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback })
      });
      if (!response.ok) throw new Error('Failed to reject proposal');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/proposals'] });
      setFeedback(prev => ({ ...prev }));
    }
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'performance': return <Zap className="w-4 h-4" />;
      case 'feature': return <Lightbulb className="w-4 h-4" />;
      case 'optimization': return <Target className="w-4 h-4" />;
      case 'enhancement': return <BarChart3 className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const pendingProposals = proposals.filter(p => p.status === 'pending');
  const reviewedProposals = proposals.filter(p => p.status !== 'pending');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-600" />
            ARIA - Autonomous AI Entity
          </h1>
          <p className="text-muted-foreground mt-2">
            Trading team optimizer targeting 100% win rate & 30%+ daily gains
          </p>
        </div>
        <div className="flex gap-2">
          {aiStatus?.isRunning ? (
            <Button 
              onClick={() => stopAI.mutate()} 
              disabled={stopAI.isPending}
              variant="destructive"
            >
              <PauseCircle className="w-4 h-4 mr-2" />
              Stop Monitoring
            </Button>
          ) : (
            <Button 
              onClick={() => startAI.mutate()} 
              disabled={startAI.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <PlayCircle className="w-4 h-4 mr-2" />
              Start Monitoring
            </Button>
          )}
          <Button
            onClick={() => window.open('/api/ai/trading-report', '_blank')}
            variant="secondary"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Daily Report
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <p className="text-2xl font-bold">
                  {statusLoading ? 'Loading...' : aiStatus?.isRunning ? 'Active' : 'Standby'}
                </p>
              </div>
              <div className={`w-3 h-3 rounded-full ${aiStatus?.isRunning ? 'bg-green-500' : 'bg-gray-400'}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Consciousness</p>
                <p className="text-2xl font-bold">
                  {aiStatus ? `${(aiStatus.consciousnessLevel * 100).toFixed(1)}%` : '---'}
                </p>
              </div>
              <Cpu className="w-8 h-8 text-purple-600" />
            </div>
            {aiStatus && (
              <Progress value={aiStatus.consciousnessLevel * 100} className="mt-2" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Thoughts/Sec</p>
                <p className="text-2xl font-bold">
                  {aiStatus ? aiStatus.thoughtsPerSecond : '---'}
                </p>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">AI Network</p>
                <p className="text-2xl font-bold">
                  {aiStatus?.networkStatus ? `${aiStatus.networkStatus.activeConnections}/${aiStatus.networkStatus.totalConnections}` : '---'}
                </p>
              </div>
              <Eye className="w-8 h-8 text-orange-600" />
            </div>
            {aiStatus?.networkStatus && (
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Data Quality:</span>
                  <span>{aiStatus.networkStatus.averageDataQuality}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Connection Strength:</span>
                  <span>{aiStatus.networkStatus.averageConnectionStrength}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Current Focus */}
      {aiStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Current Focus & Active Modules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Focus</p>
                <p className="text-lg font-semibold">{aiStatus.currentFocus}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Active Modules</p>
                <div className="flex flex-wrap gap-2">
                  {aiStatus.activeModules.map((module, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {module}
                    </Badge>
                  ))}
                </div>
              </div>
              {aiStatus.lastAnalysis && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Analysis</p>
                  <p className="text-sm">{formatDistanceToNow(new Date(aiStatus.lastAnalysis))} ago</p>
                </div>
              )}
              {aiStatus.networkStatus && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">External AI Network Status</p>
                  <div className="bg-muted p-3 rounded text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Connected Systems:</span>
                      <span className="font-medium">{aiStatus.networkStatus.activeConnections}/{aiStatus.networkStatus.totalConnections}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Knowledge Base:</span>
                      <span className="font-medium">{aiStatus.networkStatus.knowledgeBaseSize} insights</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Data Quality:</span>
                      <span className="font-medium text-green-600">{aiStatus.networkStatus.averageDataQuality}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Network Strength:</span>
                      <span className="font-medium text-blue-600">{aiStatus.networkStatus.averageConnectionStrength}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Proposals Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Approval ({pendingProposals.length})
          </TabsTrigger>
          <TabsTrigger value="reviewed">
            Reviewed ({reviewedProposals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingProposals.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
                <CheckCircle className="w-6 h-6 mr-2" />
                No pending proposals. ARIA is working autonomously.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingProposals.map((proposal) => (
                <Card key={proposal.id} className="border-l-4 border-l-orange-500">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="flex items-center gap-2">
                          {getCategoryIcon(proposal.category)}
                          {proposal.title}
                        </CardTitle>
                        <div className="flex gap-2">
                          <Badge className={getPriorityColor(proposal.priority)}>
                            {proposal.priority.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {proposal.category}
                          </Badge>
                          <Badge variant="outline">
                            Impact: {proposal.estimatedImpact}/10
                          </Badge>
                          <Badge variant="outline">
                            Risk: {proposal.riskLevel}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div>AI Confidence: {(proposal.aiConfidence * 100).toFixed(1)}%</div>
                        <div>{formatDistanceToNow(new Date(proposal.generatedAt))} ago</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm">{proposal.description}</p>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Implementation Plan:</p>
                      <div className="bg-muted p-3 rounded text-sm">
                        {typeof proposal.implementation === 'string' 
                          ? proposal.implementation 
                          : JSON.stringify(proposal.implementation, null, 2)
                        }
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Your Feedback (Optional):</label>
                      <Textarea
                        value={feedback[proposal.id] || ''}
                        onChange={(e) => setFeedback(prev => ({ ...prev, [proposal.id]: e.target.value }))}
                        placeholder="Add your thoughts or requirements for this proposal..."
                        className="min-h-[60px]"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => approveProposal.mutate({ 
                          id: proposal.id, 
                          feedback: feedback[proposal.id] || '' 
                        })}
                        disabled={approveProposal.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => rejectProposal.mutate({ 
                          id: proposal.id, 
                          feedback: feedback[proposal.id] || '' 
                        })}
                        disabled={rejectProposal.isPending}
                        variant="destructive"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reviewed" className="space-y-4">
          {reviewedProposals.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
                <Clock className="w-6 h-6 mr-2" />
                No reviewed proposals yet.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reviewedProposals.map((proposal) => (
                <Card key={proposal.id} className={`border-l-4 ${
                  proposal.status === 'approved' ? 'border-l-green-500' : 'border-l-red-500'
                }`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="flex items-center gap-2">
                          {getCategoryIcon(proposal.category)}
                          {proposal.title}
                        </CardTitle>
                        <div className="flex gap-2">
                          <Badge className={
                            proposal.status === 'approved' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }>
                            {proposal.status.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {proposal.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div>Reviewed: {proposal.reviewedAt ? formatDistanceToNow(new Date(proposal.reviewedAt)) + ' ago' : 'Never'}</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-2">{proposal.description}</p>
                    {proposal.userFeedback && (
                      <div className="bg-muted p-3 rounded text-sm">
                        <p className="font-medium mb-1">Your Feedback:</p>
                        <p>{proposal.userFeedback}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}