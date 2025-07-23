import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, XCircle, AlertCircle, Zap, DollarSign, Brain, Clock, TrendingUp, Settings, TestTube, Key, Eye, EyeOff, Trophy, Target, Globe, Cpu, Database, LineChart } from 'lucide-react';

interface AIProvider {
  name: string;
  available: boolean;
  priority: number;
  costPerToken: number;
  strengths: string[];
  status?: string;
  responseTime?: number;
  successRate?: number;
  model: string;
  description: string;
  hasKey?: boolean;
  setupUrl?: string;
  priceRange?: string;
}

export default function AIProvidersPage() {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [configuringAPI, setConfiguringAPI] = useState<string | null>(null);

  useEffect(() => {
    fetchProviderStatus();
  }, []);

  // Configuration handlers for World-Class APIs
  const handleConfigureAPI = (apiName: string) => {
    setConfiguringAPI(apiName);
    // For now, just show an alert with next steps
    alert(`Configuration for ${apiName}:\n\n1. Sign up for the service\n2. Get your API key\n3. Add to environment variables\n4. Restart the system\n\nCheck the setup documentation for detailed instructions.`);
    setConfiguringAPI(null);
  };

  const handleTierAction = (tierName: string) => {
    switch(tierName) {
      case 'immediate':
        alert('Priority Tier 1 Actions:\n\n1. Add $100 credits to OpenAI account\n2. Sign up for Anthropic Claude API\n3. Register for IEX Cloud Pro\n4. Get Twitter API Premium access\n\nTotal investment: $1,150/month');
        break;
      case 'game-changer':
        alert('Institutional Tier 2 Requirements:\n\n1. Contact Bloomberg for Terminal API access\n2. Apply for Kensho AI Analytics\n3. Register for Nasdaq TotalView\n4. Get Refinitiv data license\n\nTotal investment: $15,000/month');
        break;
      case 'revolutionary':
        alert('Hedge Fund Killer Tier 3:\n\n1. Contact satellite imagery providers\n2. Apply for Palantir Foundry access\n3. Quantum computing partnerships\n4. Alternative data licensing\n\nTotal investment: $75,000/month');
        break;
    }
  };

  const fetchProviderStatus = async () => {
    try {
      const response = await fetch('/api/ai-providers/status');
      const data = await response.json();
      setProviders(data);
    } catch (error) {
      console.error('Failed to fetch provider status:', error);
    } finally {
      setLoading(false);
    }
  };

  const testProvider = async (providerName: string) => {
    setTestingProvider(providerName);
    try {
      const response = await fetch('/api/ai-providers/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          provider: providerName,
          testQuery: 'Analyze AAPL stock for trading opportunities. Keep response under 100 words.'
        })
      });
      const result = await response.json();
      setTestResults(prev => ({ ...prev, [providerName]: result }));
      await fetchProviderStatus(); // Refresh status
    } catch (error) {
      console.error('Provider test failed:', error);
      setTestResults(prev => ({ ...prev, [providerName]: { error: error.message } }));
    } finally {
      setTestingProvider(null);
    }
  };

  const saveApiKey = async (providerName: string) => {
    const key = apiKeys[providerName];
    if (!key) return;

    try {
      const response = await fetch('/api/ai-providers/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: providerName, apiKey: key })
      });
      const result = await response.json();
      
      if (response.ok) {
        // Show success message or toast
        console.log(`${providerName} API key configured:`, result.message);
        await fetchProviderStatus();
      } else {
        console.error('Configuration failed:', result.error);
      }
    } catch (error) {
      console.error('Failed to save API key:', error);
    }
  };

  const toggleKeyVisibility = (provider: string) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-yellow-500';
      case 2: return 'bg-blue-500';
      case 3: return 'bg-green-500';
      case 4: return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (available: boolean) => {
    return available ? 
      <CheckCircle2 className="w-5 h-5 text-green-500" /> : 
      <XCircle className="w-5 h-5 text-red-500" />;
  };

  if (loading) {
    return (
      <div className="p-8 bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-white">AI Providers Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="animate-pulse bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="h-6 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-gray-700 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center gap-3">
            <Brain className="w-10 h-10 text-blue-400" />
            AI Providers Dashboard
          </h1>
          <p className="text-lg text-gray-300">
            Professional multi-AI trading system with automatic failover and real-time configuration
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Available Providers</p>
                  <p className="text-2xl font-bold text-green-400">
                    {providers.filter(p => p.available).length}/{providers.length}
                  </p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Best Cost/Token</p>
                  <p className="text-2xl font-bold text-blue-400">
                    ${Math.min(...providers.map(p => p.costPerToken)).toFixed(4)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Avg Response Time</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {providers.filter(p => p.responseTime).length > 0 
                      ? Math.round(providers.filter(p => p.responseTime).reduce((sum, p) => sum + (p.responseTime || 0), 0) / providers.filter(p => p.responseTime).length)
                      : 0}ms
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Success Rate</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {providers.filter(p => p.successRate).length > 0 
                      ? Math.round(providers.filter(p => p.successRate).reduce((sum, p) => sum + (p.successRate || 0), 0) / providers.filter(p => p.successRate).length)
                      : 0}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="providers" className="space-y-6">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="providers" className="data-[state=active]:bg-gray-700 text-gray-300">
              <Brain className="w-4 h-4 mr-2" />
              Current Providers
            </TabsTrigger>
            <TabsTrigger value="configuration" className="data-[state=active]:bg-gray-700 text-gray-300">
              <Settings className="w-4 h-4 mr-2" />
              Configuration
            </TabsTrigger>
            <TabsTrigger value="world-class" className="data-[state=active]:bg-gray-700 text-gray-300">
              <Trophy className="w-4 h-4 mr-2" />
              World-Class APIs
            </TabsTrigger>
            <TabsTrigger value="testing" className="data-[state=active]:bg-gray-700 text-gray-300">
              <TestTube className="w-4 h-4 mr-2" />
              Testing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="providers" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((provider) => (
                <Card key={provider.name} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-white flex items-center gap-2">
                          {getStatusIcon(provider.available)}
                          {provider.name}
                        </CardTitle>
                        <CardDescription className="text-gray-400 mt-1">
                          {provider.model} • Priority #{provider.priority}
                        </CardDescription>
                      </div>
                      <Badge 
                        className={`${getPriorityColor(provider.priority)} text-white text-xs px-2 py-1`}
                        variant="secondary"
                      >
                        #{provider.priority}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Cost Information */}
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-gray-300">Cost per token</span>
                      </div>
                      <span className="text-sm font-bold text-green-400">
                        ${provider.costPerToken.toFixed(4)}
                      </span>
                    </div>

                    {/* Performance Metrics */}
                    {provider.responseTime && (
                      <div className="flex items-center justify-between p-2 bg-gray-700 rounded">
                        <span className="text-sm text-gray-300">Response Time</span>
                        <span className="text-sm font-medium text-yellow-400">{provider.responseTime}ms</span>
                      </div>
                    )}

                    {provider.successRate && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">Success Rate</span>
                          <span className="text-sm font-medium text-purple-400">{provider.successRate}%</span>
                        </div>
                        <Progress value={provider.successRate} className="h-2 bg-gray-700" />
                      </div>
                    )}

                    {/* Strengths */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-300">Strengths:</p>
                      <div className="flex flex-wrap gap-1">
                        {provider.strengths.map((strength, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs border-gray-600 text-gray-300">
                            {strength}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Test Button */}
                    <Button 
                      onClick={() => testProvider(provider.name)}
                      disabled={testingProvider === provider.name || !provider.available}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      size="sm"
                    >
                      {testingProvider === provider.name ? (
                        <>
                          <AlertCircle className="w-4 h-4 mr-2 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <TestTube className="w-4 h-4 mr-2" />
                          Test Provider
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="configuration" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  API Key Configuration
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Configure API keys for AI providers. Keys are securely stored and encrypted.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {providers.map((provider) => (
                  <div key={provider.name} className="space-y-4 p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-white">{provider.name}</h3>
                        <p className="text-sm text-gray-400">{provider.description || 'Professional AI analysis provider'}</p>
                      </div>
                      <Badge className={provider.hasKey ? 'bg-green-600' : 'bg-red-600'}>
                        {provider.hasKey ? 'Configured' : 'Missing'}
                      </Badge>
                    </div>
                    
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Input
                          type={showKeys[provider.name] ? 'text' : 'password'}
                          placeholder={`Enter ${provider.name} API key...`}
                          value={apiKeys[provider.name] || ''}
                          onChange={(e) => setApiKeys(prev => ({ ...prev, [provider.name]: e.target.value }))}
                          className="bg-gray-600 border-gray-500 text-white placeholder-gray-400 pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                          onClick={() => toggleKeyVisibility(provider.name)}
                        >
                          {showKeys[provider.name] ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      <Button
                        onClick={() => saveApiKey(provider.name)}
                        disabled={!apiKeys[provider.name]}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Save
                      </Button>
                    </div>

                    {provider.setupUrl && (
                      <p className="text-sm text-blue-400">
                        Get API key: <a href={provider.setupUrl} target="_blank" rel="noopener noreferrer" className="underline">{provider.setupUrl}</a>
                      </p>
                    )}

                    {provider.priceRange && (
                      <p className="text-sm text-gray-400">Pricing: {provider.priceRange}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="world-class" className="space-y-6">
            <div className="space-y-8">
              {/* Header */}
              <Card className="bg-gradient-to-r from-blue-900 to-purple-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-3">
                    <Trophy className="w-8 h-8 text-yellow-400" />
                    World-Class API Enhancement Strategy
                  </CardTitle>
                  <CardDescription className="text-gray-200">
                    Transform your trading platform into an institutional-grade system that exceeds hedge funds and investment banks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-400">34</div>
                      <div className="text-sm text-gray-300">Critical APIs</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-400">6</div>
                      <div className="text-sm text-gray-300">Investment Tiers</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="text-2xl font-bold text-purple-400">$100K+</div>
                      <div className="text-sm text-gray-300">Max Monthly</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Investment Tiers */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Tier 1: Immediate Impact */}
                <Card className="bg-gray-800 border-green-500 border-2">
                  <CardHeader>
                    <CardTitle className="text-green-400 flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Tier 1: Immediate Impact
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Week 1 - $1,150/month
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                        <div>
                          <div className="font-medium text-white">Fix OpenAI Quota</div>
                          <div className="text-sm text-gray-400">Restore full AI capabilities</div>
                        </div>
                        <Badge className="bg-red-600 text-white">$100/mo</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                        <div>
                          <div className="font-medium text-white">Anthropic Claude</div>
                          <div className="text-sm text-gray-400">Superior financial reasoning</div>
                        </div>
                        <Badge className="bg-green-600 text-white">$50/mo</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                        <div>
                          <div className="font-medium text-white">IEX Cloud Pro</div>
                          <div className="text-sm text-gray-400">Institutional market data</div>
                        </div>
                        <Badge className="bg-blue-600 text-white">$500/mo</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                        <div>
                          <div className="font-medium text-white">Twitter API Premium</div>
                          <div className="text-sm text-gray-400">Real-time social sentiment</div>
                        </div>
                        <Badge className="bg-purple-600 text-white">$500/mo</Badge>
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => handleTierAction('immediate')}
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Start Here (Priority 1)
                    </Button>
                  </CardContent>
                </Card>

                {/* Tier 2: Game Changer */}
                <Card className="bg-gray-800 border-blue-500 border-2">
                  <CardHeader>
                    <CardTitle className="text-blue-400 flex items-center gap-2">
                      <Database className="w-5 h-5" />
                      Tier 2: Game Changer
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Month 1 - $15,000/month
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                        <div>
                          <div className="font-medium text-white">Bloomberg Terminal</div>
                          <div className="text-sm text-gray-400">Wall Street's gold standard</div>
                        </div>
                        <Badge className="bg-yellow-600 text-white">$2K/mo</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                        <div>
                          <div className="font-medium text-white">Kensho AI Analytics</div>
                          <div className="text-sm text-gray-400">Goldman Sachs-level AI</div>
                        </div>
                        <Badge className="bg-red-600 text-white">$10K/mo</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                        <div>
                          <div className="font-medium text-white">Nasdaq TotalView</div>
                          <div className="text-sm text-gray-400">Level II order book</div>
                        </div>
                        <Badge className="bg-orange-600 text-white">$1.5K/mo</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                        <div>
                          <div className="font-medium text-white">Refinitiv Data</div>
                          <div className="text-sm text-gray-400">Global institutional coverage</div>
                        </div>
                        <Badge className="bg-indigo-600 text-white">$3K/mo</Badge>
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleTierAction('game-changer')}
                    >
                      <LineChart className="w-4 h-4 mr-2" />
                      Institutional Grade
                    </Button>
                  </CardContent>
                </Card>

                {/* Tier 3: Revolutionary */}
                <Card className="bg-gray-800 border-purple-500 border-2">
                  <CardHeader>
                    <CardTitle className="text-purple-400 flex items-center gap-2">
                      <Cpu className="w-5 h-5" />
                      Tier 3: Revolutionary
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Quarter 1 - $75,000/month
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                        <div>
                          <div className="font-medium text-white">Satellite Imagery</div>
                          <div className="text-sm text-gray-400">Predict earnings from space</div>
                        </div>
                        <Badge className="bg-green-600 text-white">$25K/mo</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                        <div>
                          <div className="font-medium text-white">Palantir Foundry</div>
                          <div className="text-sm text-gray-400">Hedge fund data platform</div>
                        </div>
                        <Badge className="bg-red-600 text-white">$20K/mo</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                        <div>
                          <div className="font-medium text-white">Quantum Computing</div>
                          <div className="text-sm text-gray-400">Advanced optimization</div>
                        </div>
                        <Badge className="bg-blue-600 text-white">$40K/yr</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                        <div>
                          <div className="font-medium text-white">Credit Card Data</div>
                          <div className="text-sm text-gray-400">Consumer spending analytics</div>
                        </div>
                        <Badge className="bg-purple-600 text-white">$10K/mo</Badge>
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      onClick={() => handleTierAction('revolutionary')}
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      Hedge Fund Killer
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Complete API Breakdown */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Database className="w-6 h-6 text-blue-400" />
                    Complete API Breakdown (34 APIs)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Tier 1: Market Data */}
                  <div>
                    <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center gap-2">
                      <LineChart className="w-5 h-5" />
                      Institutional Market Data (5 APIs)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { name: "Bloomberg Terminal API", cost: "$2,000/mo", desc: "Institutional-grade real-time data", status: "Not integrated" },
                        { name: "Refinitiv Real-Time", cost: "$3,000/mo", desc: "Global market coverage", status: "Not integrated" },
                        { name: "IEX Cloud Pro", cost: "$500/mo", desc: "High-frequency microsecond data", status: "Not integrated" },
                        { name: "Nasdaq TotalView", cost: "$1,500/mo", desc: "Level II order book depth", status: "Not integrated" },
                        { name: "Quandl Data Link", cost: "$1,000/mo", desc: "Alternative datasets", status: "Not integrated" }
                      ].map((api, i) => (
                        <div key={i} className="bg-gray-700 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium text-white">{api.name}</div>
                            <Badge variant="outline" className="text-green-400 border-green-400">{api.cost}</Badge>
                          </div>
                          <div className="text-sm text-gray-400 mb-2">{api.desc}</div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-red-400">{api.status}</span>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
                              onClick={() => handleConfigureAPI(api.name)}
                              disabled={configuringAPI === api.name}
                            >
                              {configuringAPI === api.name ? 'Configuring...' : 'Configure'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tier 2: AI Analytics */}
                  <div>
                    <h3 className="text-lg font-semibold text-purple-400 mb-3 flex items-center gap-2">
                      <Brain className="w-5 h-5" />
                      Advanced AI Analytics (8 APIs)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { name: "Kensho AI Analytics", cost: "$10,000/mo", desc: "S&P Global AI used by Goldman Sachs", status: "Not integrated" },
                        { name: "Palantir Foundry", cost: "$20,000/mo", desc: "Data integration platform", status: "Not integrated" },
                        { name: "Anthropic Claude Opus", cost: "$75/mo", desc: "Advanced financial reasoning", status: "Partially integrated" },
                        { name: "Google Vertex AI", cost: "$500/mo", desc: "Custom financial models", status: "Not integrated" },
                        { name: "Cohere Enterprise", cost: "$2,000/mo", desc: "Financial NLP specialist", status: "Not integrated" },
                        { name: "OpenAI GPT-4 Turbo", cost: "$30/mo", desc: "Function calling for automation", status: "Quota exceeded" },
                        { name: "xAI Grok 2.0", cost: "$50/mo", desc: "Real-time social data", status: "Not integrated" },
                        { name: "DeepSeek R1", cost: "$20/mo", desc: "Ultra-budget high performance", status: "Not integrated" }
                      ].map((api, i) => (
                        <div key={i} className="bg-gray-700 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium text-white">{api.name}</div>
                            <Badge variant="outline" className="text-purple-400 border-purple-400">{api.cost}</Badge>
                          </div>
                          <div className="text-sm text-gray-400 mb-2">{api.desc}</div>
                          <div className="flex items-center justify-between">
                            <span className={`text-xs ${api.status.includes('integrated') ? 'text-green-400' : api.status.includes('exceeded') ? 'text-red-400' : 'text-yellow-400'}`}>{api.status}</span>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white"
                              onClick={() => handleConfigureAPI(api.name)}
                              disabled={configuringAPI === api.name}
                            >
                              {configuringAPI === api.name ? 'Configuring...' : 'Configure'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Competitive Advantages */}
                  <div className="bg-gradient-to-r from-green-900 to-blue-900 p-6 rounded-lg">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Trophy className="w-6 h-6 text-yellow-400" />
                      Competitive Advantages
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="text-green-400 font-semibold">Exceeds Bloomberg Terminal</div>
                        <div className="text-sm text-gray-300">More AI-driven with real-time learning</div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-blue-400 font-semibold">Beats Hedge Funds</div>
                        <div className="text-sm text-gray-300">Faster processing, more data sources</div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-purple-400 font-semibold">Surpasses Retail Platforms</div>
                        <div className="text-sm text-gray-300">Institutional-grade data and analysis</div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-yellow-400 font-semibold">Outperforms Banks</div>
                        <div className="text-sm text-gray-300">More comprehensive alternative data</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Plan */}
                  <div className="bg-gray-700 p-6 rounded-lg">
                    <h3 className="text-xl font-bold text-white mb-4">Implementation Roadmap</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Badge className="bg-green-600 text-white px-3 py-1">Week 1</Badge>
                        <div className="text-gray-300">Fix OpenAI, add Claude, integrate IEX Cloud, Twitter API</div>
                        <Badge variant="outline" className="text-green-400 border-green-400">$1,150/mo</Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className="bg-blue-600 text-white px-3 py-1">Month 1</Badge>
                        <div className="text-gray-300">Bloomberg Terminal, Kensho AI, Level II data</div>
                        <Badge variant="outline" className="text-blue-400 border-blue-400">$15,000/mo</Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className="bg-purple-600 text-white px-3 py-1">Quarter 1</Badge>
                        <div className="text-gray-300">Satellite data, Palantir, quantum computing</div>
                        <Badge variant="outline" className="text-purple-400 border-purple-400">$75,000/mo</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="testing" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TestTube className="w-5 h-5" />
                  Provider Testing Results
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Real-time testing results for each AI provider with actual trading analysis.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(testResults).map(([provider, result]) => (
                  <div key={provider} className="p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-white">{provider}</h3>
                      <Badge className={result.error ? 'bg-red-600' : 'bg-green-600'}>
                        {result.error ? 'Failed' : 'Success'}
                      </Badge>
                    </div>
                    
                    {result.error ? (
                      <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded border border-red-800">
                        Error: {result.error}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {result.response && (
                          <div className="text-gray-300 text-sm bg-gray-600 p-3 rounded">
                            <strong>Response:</strong> {result.response}
                          </div>
                        )}
                        {result.responseTime && (
                          <div className="text-sm text-gray-400">
                            Response time: <span className="text-yellow-400">{result.responseTime}ms</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                
                {Object.keys(testResults).length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    No test results yet. Use the "Test Provider" buttons in the Providers tab to run tests.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}