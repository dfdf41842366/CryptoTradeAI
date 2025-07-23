import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Analytics } from "@shared/schema";
import { MessageCircle, Send, Users, TrendingUp, Bot, User } from "lucide-react";

interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'community';
  author: string;
  content: string;
  timestamp: Date;
  symbol?: string;
  likes?: number;
}

export function ChatPage() {
  const [message, setMessage] = useState('');
  const [activeChat, setActiveChat] = useState<'ai' | 'community'>('ai');

  const { data: analytics } = useQuery<Analytics>({
    queryKey: ['/api/analytics'],
  });

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      author: 'AI Assistant',
      content: 'Welcome to the trading chat! I can help you analyze stocks, explain market conditions, or discuss trading strategies. What would you like to know?',
      timestamp: new Date(Date.now() - 300000),
    },
    {
      id: '2',
      type: 'community',
      author: 'TraderMike',
      content: 'Anyone watching TSLA today? The volume is crazy high and it just broke above resistance at $240',
      timestamp: new Date(Date.now() - 240000),
      symbol: 'TSLA',
      likes: 12
    },
    {
      id: '3',
      type: 'community',
      author: 'StockGuru88',
      content: 'NVDA earnings coming up next week. The options activity suggests big moves expected. IV is through the roof.',
      timestamp: new Date(Date.now() - 180000),
      symbol: 'NVDA',
      likes: 8
    },
    {
      id: '4',
      type: 'ai',
      author: 'AI Assistant',
      content: 'Based on current market data, TSLA is showing strong momentum with RSI at 68.4 and volume 2.3x average. The breakout above $240 is confirmed with good volume support.',
      timestamp: new Date(Date.now() - 120000),
      symbol: 'TSLA'
    },
    {
      id: '5',
      type: 'community',
      author: 'DayTrader99',
      content: 'Just took profits on my AAPL calls. Market feels toppy here, might see some pullback into close.',
      timestamp: new Date(Date.now() - 60000),
      symbol: 'AAPL',
      likes: 5
    }
  ]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      author: 'You',
      content: message,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    // Simulate AI response for AI chat
    if (activeChat === 'ai') {
      setTimeout(() => {
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          author: 'AI Assistant',
          content: getAIResponse(message),
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);
    }
  };

  const getAIResponse = (userMessage: string): string => {
    const responses = [
      "I'm analyzing that stock for you. Based on current technical indicators and market sentiment, here's what I see...",
      "That's an interesting question about market conditions. Let me check the latest data and provide you with insights...",
      "Based on the AI swarm analysis, here are the key factors to consider for your trading decision...",
      "The current market sentiment suggests caution. Here are the risk factors you should be aware of...",
      "Great question! The technical analysis shows several important patterns that could impact your trade..."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return timestamp.toLocaleDateString();
  };

  const filteredMessages = messages.filter(msg => {
    if (activeChat === 'ai') return msg.type === 'user' || msg.type === 'ai';
    return msg.type === 'community' || msg.type === 'user';
  });

  return (
    <div className="min-h-screen bg-[var(--trading-dark)]">
      <Header analytics={analytics} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 ml-64">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Trading Chat & Community</h1>
                <p className="text-gray-400">Get AI insights and connect with other traders</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-green-400 border-green-400">
                  <Users className="h-3 w-3 mr-1" />
                  247 Online
                </Badge>
                <Badge variant="outline" className="text-blue-400 border-blue-400">
                  AI Ready
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Chat Selection */}
              <div className="lg:col-span-1">
                <Card className="bg-[var(--trading-slate)] border-gray-700">
                  <CardHeader className="border-b border-gray-700">
                    <h2 className="text-lg font-semibold text-white">Chat Rooms</h2>
                  </CardHeader>
                  
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <button
                        onClick={() => setActiveChat('ai')}
                        className={`w-full flex items-center space-x-2 p-3 rounded-lg transition-colors ${
                          activeChat === 'ai' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        <Bot className="h-4 w-4" />
                        <span>AI Assistant</span>
                      </button>
                      
                      <button
                        onClick={() => setActiveChat('community')}
                        className={`w-full flex items-center space-x-2 p-3 rounded-lg transition-colors ${
                          activeChat === 'community' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>Community</span>
                        <Badge size="sm" className="ml-auto bg-red-600">15</Badge>
                      </button>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-gray-400 mb-3">Trending Topics</h3>
                      <div className="space-y-2">
                        {['TSLA Breakout', 'NVDA Earnings', 'Fed Meeting', 'Tech Rotation'].map((topic, index) => (
                          <div key={index} className="flex items-center space-x-2 text-xs">
                            <TrendingUp className="h-3 w-3 text-green-400" />
                            <span className="text-gray-300">{topic}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Chat Messages */}
              <div className="lg:col-span-3">
                <Card className="bg-[var(--trading-slate)] border-gray-700 h-[600px] flex flex-col">
                  <CardHeader className="border-b border-gray-700 flex-shrink-0">
                    <div className="flex items-center space-x-2">
                      {activeChat === 'ai' ? (
                        <>
                          <Bot className="h-5 w-5 text-blue-400" />
                          <h2 className="text-lg font-semibold text-white">AI Trading Assistant</h2>
                        </>
                      ) : (
                        <>
                          <MessageCircle className="h-5 w-5 text-green-400" />
                          <h2 className="text-lg font-semibold text-white">Trading Community</h2>
                        </>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col p-0">
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {filteredMessages.map((msg) => (
                          <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                              msg.type === 'user' 
                                ? 'bg-blue-600 text-white' 
                                : msg.type === 'ai'
                                ? 'bg-gray-800 text-gray-300'
                                : 'bg-gray-700 text-gray-300'
                            }`}>
                              <div className="flex items-center space-x-2 mb-1">
                                {msg.type === 'ai' && <Bot className="h-3 w-3 text-blue-400" />}
                                {msg.type === 'community' && <User className="h-3 w-3 text-green-400" />}
                                <span className="text-xs font-medium">
                                  {msg.author}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {formatTimestamp(msg.timestamp)}
                                </span>
                              </div>
                              
                              <p className="text-sm">{msg.content}</p>
                              
                              {msg.symbol && (
                                <Badge size="sm" className="mt-2 text-xs">
                                  ${msg.symbol}
                                </Badge>
                              )}
                              
                              {msg.likes && msg.likes > 0 && (
                                <div className="flex items-center space-x-1 mt-2">
                                  <TrendingUp className="h-3 w-3 text-gray-400" />
                                  <span className="text-xs text-gray-400">{msg.likes}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    
                    {/* Message Input */}
                    <div className="border-t border-gray-700 p-4 flex-shrink-0">
                      <div className="flex space-x-2">
                        <Input
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder={activeChat === 'ai' ? "Ask the AI about market conditions..." : "Share your trading thoughts..."}
                          className="flex-1 bg-gray-800 border-gray-600"
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        />
                        <Button onClick={sendMessage} size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}