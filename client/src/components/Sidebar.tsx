import { Link, useLocation } from "wouter";
import { useState } from "react";
import { 
  LayoutDashboard, 
  Search, 
  TrendingUp, 
  BarChart3, 
  Brain, 
  Newspaper,
  Radio,
  Settings,
  Shield,
  Bell,
  MessageCircle,
  PieChart,
  Atom,
  EyeOff,
  Zap,
  Target,
  Users,
  Eye,
  AlertTriangle,
  Network,
  Infinity,
  Clock,
  Globe,
  Activity,
  Sunrise,
  ChevronDown,
  ChevronRight,
  Home,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navigationCategories = [
  {
    name: "Core Trading",
    icon: LayoutDashboard,
    expanded: true,
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
      { name: "Strategy Room", href: "/strategy-room", icon: Target },
      { name: "Portfolio", href: "/portfolio", icon: PieChart },
      { name: "Risk Management", href: "/risk-management", icon: Shield },
    ]
  },
  {
    name: "Market Analysis",
    icon: Search,
    expanded: false,
    items: [
      { name: "Market Scanner", href: "/scanner", icon: Search },
      { name: "Pre-Market Scanner", href: "/pre-market-scanner", icon: Sunrise },
      { name: "Charts", href: "/charts", icon: BarChart3 },
      { name: "SuperCharts Pro", href: "/super-charts", icon: Activity },
      { name: "Sentiment Analysis", href: "/sentiment", icon: TrendingUp },
    ]
  },
  {
    name: "AI Intelligence",
    icon: Brain,
    expanded: false,
    items: [
      { name: "AI Swarm", href: "/swarm", icon: Brain },
      { name: "Trading Team", href: "/trading-team", icon: Users },
      { name: "AI Council", href: "/ai-council", icon: Users },
      { name: "AI Predictions", href: "/ai-predictions", icon: Brain },
      { name: "Autonomous AI", href: "/autonomous-ai", icon: Eye },
      { name: "Neural Nexus", href: "/neural-nexus", icon: Network },
    ]
  },
  {
    name: "Advanced Analytics",
    icon: Atom,
    expanded: false,
    items: [
      { name: "Quantum Analysis", href: "/quantum-analysis", icon: Atom },
      { name: "Dark Pools", href: "/dark-pools", icon: EyeOff },
      { name: "Options Flow", href: "/options-flow", icon: Zap },
      { name: "Anomaly Hunters", href: "/anomaly-hunters", icon: AlertTriangle },
      { name: "Quantum Market", href: "/quantum-market", icon: Atom },
    ]
  },
  {
    name: "Trading Operations",
    icon: TrendingUp,
    expanded: false,
    items: [
      { name: "Backtesting", href: "/backtesting", icon: BarChart3 },
      { name: "Swing Masters", href: "/swing-masters", icon: TrendingUp },
      { name: "Alerts", href: "/alerts", icon: Bell },
    ]
  },
  {
    name: "News & Research",
    icon: Newspaper,
    expanded: false,
    items: [
      { name: "News Room", href: "/newsroom", icon: Radio },
      { name: "News", href: "/news", icon: Newspaper },
      { name: "Chat", href: "/chat", icon: MessageCircle },
    ]
  },
  {
    name: "Future Tech",
    icon: Infinity,
    expanded: false,
    items: [
      { name: "Meta-Trading", href: "/meta-trading", icon: Infinity },
      { name: "Time Chamber", href: "/time-chamber", icon: Clock },
      { name: "Hive Mind", href: "/hive-mind", icon: Globe },
      { name: "Adaptive AI", href: "/adaptive-ai", icon: Brain },
    ]
  },
  {
    name: "System",
    icon: Settings,
    expanded: false,
    items: [
      { name: "API Status", href: "/api-status", icon: Settings },
      { name: "AI Providers", href: "/ai-providers", icon: Brain },
    ]
  },
];

const systemStatus = [
  { name: "Market Scanner", status: "online" },
  { name: "AI Engine", status: "online" },
  { name: "Data Feed", status: "warning" },
];

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ isCollapsed = false, onToggle }: SidebarProps) {
  const [location] = useLocation();
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "Core Trading": true,
  });

  const toggleCategory = (categoryName: string) => {
    if (!isCollapsed) {
      setExpandedCategories(prev => ({
        ...prev,
        [categoryName]: !prev[categoryName]
      }));
    }
  };

  return (
    <aside className={cn(
      "bg-[var(--trading-slate)] border-r border-gray-700 flex-shrink-0 transition-all duration-300 relative",
      isCollapsed ? "w-16" : "w-72",
      "hidden lg:block"
    )}>
      {/* Toggle Button */}
      <Button
        onClick={onToggle}
        variant="ghost"
        size="sm"
        className="absolute -right-3 top-4 z-10 bg-[var(--trading-slate)] border border-gray-700 text-slate-300 hover:text-cyan-100 hover:bg-gray-700 rounded-full w-6 h-6 p-0"
      >
        {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </Button>

      <div className="h-full overflow-y-auto">
        {/* Home Button */}
        <div className="p-4 border-b border-gray-700">
          <Link href="/">
            <Button
              variant={location === "/" ? "default" : "ghost"}
              className={cn(
                "w-full justify-start",
                location === "/" 
                  ? "bg-blue-600 text-cyan-100" 
                  : "text-slate-200 hover:bg-gray-700 hover:text-white",
                isCollapsed && "justify-center px-2"
              )}
            >
              <Home className="w-4 h-4" />
              {!isCollapsed && <span className="ml-2">Home</span>}
            </Button>
          </Link>
        </div>

        <nav className="p-4 space-y-1">
          {navigationCategories.map((category) => {
            const isExpanded = expandedCategories[category.name] && !isCollapsed;
            return (
              <div key={category.name} className="mb-2">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.name)}
                  className={cn(
                    "w-full flex items-center rounded-lg transition-colors hover:bg-gray-700 group",
                    isCollapsed ? "justify-center px-2 py-2" : "justify-between px-3 py-2"
                  )}
                  title={isCollapsed ? category.name : undefined}
                >
                  <div className={cn(
                    "flex items-center",
                    isCollapsed ? "justify-center" : "space-x-3"
                  )}>
                    <category.icon className="w-4 h-4 text-blue-400" />
                    {!isCollapsed && (
                      <span className="text-sm font-medium text-slate-200 group-hover:text-cyan-200">
                        {category.name}
                      </span>
                    )}
                  </div>
                  {!isCollapsed && (
                    isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )
                  )}
                </button>

                {/* Category Items */}
                {isExpanded && !isCollapsed && (
                  <div className="ml-6 mt-1 space-y-1">
                    {category.items.map((item) => {
                      const isActive = location === item.href;
                      return (
                        <Link key={item.name} href={item.href}>
                          <div className={cn(
                            "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors cursor-pointer text-sm",
                            isActive 
                              ? "bg-blue-600 text-cyan-100" 
                              : "text-slate-300 hover:bg-gray-700 hover:text-white"
                          )}>
                            <item.icon className="w-4 h-4" />
                            <span>{item.name}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
                
                {/* Collapsed view - show first few items */}
                {isCollapsed && (
                  <div className="mt-1 space-y-1">
                    {category.items.slice(0, 2).map((item) => {
                      const isActive = location === item.href;
                      return (
                        <Link key={item.name} href={item.href}>
                          <div 
                            className={cn(
                              "flex items-center justify-center px-2 py-2 rounded-md transition-colors cursor-pointer",
                              isActive 
                                ? "bg-blue-600 text-cyan-100" 
                                : "text-slate-300 hover:bg-gray-700 hover:text-white"
                            )}
                            title={item.name}
                          >
                            <item.icon className="w-4 h-4" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          
          {/* System Status Section */}
          {!isCollapsed && (
            <div className="pt-4 mt-6 border-t border-gray-700">
              <div className="px-3 py-2 mb-2">
                <p className="text-xs font-semibold text-amber-300 uppercase tracking-wide">System Status</p>
              </div>
              <div className="space-y-2">
                {systemStatus.map((system) => (
                  <div key={system.name} className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-700">
                    <span className="text-sm text-emerald-200">{system.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        system.status === "online" ? "bg-[var(--profit-green)]" : "bg-[var(--warning-yellow)]"
                      )}></span>
                      <span className={cn(
                        "text-xs capitalize",
                        system.status === "online" ? "text-emerald-300" : "text-yellow-300"
                      )}>
                        {system.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Collapsed Status Indicators */}
          {isCollapsed && (
            <div className="pt-4 mt-6 border-t border-gray-700">
              <div className="space-y-2">
                {systemStatus.map((system) => (
                  <div 
                    key={system.name} 
                    className="flex justify-center px-2 py-2"
                    title={`${system.name}: ${system.status}`}
                  >
                    <span className={cn(
                      "w-3 h-3 rounded-full",
                      system.status === "online" ? "bg-[var(--profit-green)]" : "bg-[var(--warning-yellow)]"
                    )}></span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </nav>
      </div>
    </aside>
  );
}
