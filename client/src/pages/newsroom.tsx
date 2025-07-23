import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { LivePrice } from '@/components/LivePrice';
import { 
  Newspaper,
  TrendingUp,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  BarChart3
} from 'lucide-react';

interface NewsRoomStatus {
  isActive: boolean;
  lastScan: string;
  tradingTeamSize: number;
  scanInterval: string;
  criteria: {
    priceRange: string;
    maxFloat: string;
    minVolumeRatio: string;
    minPriceMove: string;
    requiredCriteria: string;
  };
}

export default function NewsRoomPage() {
  const { data: newsStatus, isLoading } = useQuery({
    queryKey: ['/api/newsroom/status'],
    refetchInterval: 5000
  });

  const { data: analytics } = useQuery({
    queryKey: ['/api/analytics'],
    refetchInterval: 30000
  });

  const status = newsStatus as NewsRoomStatus | undefined;

  return (
    <div className="min-h-screen bg-black text-gray-100">
      <Header analytics={analytics} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8 space-y-6" style={{background: 'linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #1a1a1a 100%)'}}>
          {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-6 rounded-lg border border-gray-800/50 backdrop-blur-md" style={{background: 'linear-gradient(90deg, rgba(30,58,138,0.3) 0%, rgba(88,28,135,0.3) 100%)'}}>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
            <Newspaper className="w-8 h-8 text-blue-400" />
            News Room - Live Catalyst Monitoring
          </h1>
          <p className="text-gray-300 mt-2">
            Real-time news analysis with trading team coordination for profitable opportunities
          </p>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="news-card border-green-500/30 hover:border-green-400/50 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Status</p>
                <p className="text-2xl font-bold text-white">
                  {isLoading ? 'Loading...' : status?.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div className={`w-4 h-4 rounded-full shadow-lg ${status?.isActive ? 'bg-green-500 shadow-green-500/50' : 'bg-gray-400'}`} />
            </div>
          </CardContent>
        </Card>

        <Card className="news-card border-blue-500/30 hover:border-blue-400/50 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Trading Team</p>
                <p className="text-2xl font-bold text-white">
                  {status?.tradingTeamSize || 6}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="news-card border-orange-500/30 hover:border-orange-400/50 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Scan Interval</p>
                <p className="text-2xl font-bold text-white">
                  {status?.scanInterval || '2 min'}
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="news-card border-purple-500/30 hover:border-purple-400/50 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Last Scan</p>
                <p className="text-sm text-white">
                  {status?.lastScan ? new Date(status.lastScan).toLocaleTimeString() : 'Never'}
                </p>
              </div>
              <Eye className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trading Criteria */}
      {status && (
        <Card className="news-card border-cyan-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              Trading Criteria & Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-300">Price Range</p>
                <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">{status.criteria.priceRange}</Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-300">Maximum Float</p>
                <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">{status.criteria.maxFloat}</Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-300">Volume Ratio</p>
                <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/30">{status.criteria.minVolumeRatio}+ avg</Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-300">Price Movement</p>
                <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">{status.criteria.minPriceMove}+ change</Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-300">Required Criteria</p>
                <Badge variant="outline" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">{status.criteria.requiredCriteria}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trading Team Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Trading Team Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Momentum Mike</h3>
                <Badge className="bg-green-100 text-green-800">87.3%</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Low-float momentum specialist</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Biotech Betty</h3>
                <Badge className="bg-yellow-100 text-yellow-800">79.6%</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Healthcare catalyst expert</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Scalp Sam</h3>
                <Badge className="bg-green-100 text-green-800">91.2%</Badge>
              </div>
              <p className="text-sm text-muted-foreground">High-frequency scalping master</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Pattern Pete</h3>
                <Badge className="bg-green-100 text-green-800">84.1%</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Technical analysis guru</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">News Nancy</h3>
                <Badge className="bg-yellow-100 text-yellow-800">76.8%</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Catalyst trading specialist</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Volatility Vic</h3>
                <Badge className="bg-green-100 text-green-800">82.4%</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Options and volatility expert</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent News Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Recent News Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border-l-4 border-l-green-500 bg-green-50">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium">ATER - Battery Technology Breakthrough</h3>
                <Badge className="bg-red-100 text-red-800">CRITICAL</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Aterian announces major advancement in lithium-ion battery efficiency
              </p>
              <div className="flex gap-2 text-xs">
                <Badge variant="outline">Team Consensus: 5/6 BUY</Badge>
                <Badge variant="outline">Avg Confidence: 84%</Badge>
                <Badge variant="outline">A- Grade</Badge>
              </div>
            </div>
            
            <div className="p-4 border-l-4 border-l-blue-500 bg-blue-50">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium">BBIG - Strategic Partnership</h3>
                <Badge className="bg-orange-100 text-orange-800">HIGH</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Vinco Ventures announces exclusive technology licensing deal
              </p>
              <div className="flex gap-2 text-xs">
                <Badge variant="outline">Team Consensus: 4/6 BUY</Badge>
                <Badge variant="outline">Avg Confidence: 72%</Badge>
                <Badge variant="outline">B+ Grade</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
        </main>
      </div>
    </div>
  );
}