import { Bell, Settings, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Analytics } from "@shared/schema";

interface HeaderProps {
  analytics?: Analytics;
}

export function Header({ analytics }: HeaderProps) {
  return (
    <header className="bg-[var(--trading-slate)] border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Bot className="text-blue-400 h-8 w-8" />
              <h1 className="text-xl font-bold text-blue-200">AI Trading Master</h1>
            </div>
            <div className="hidden md:flex items-center space-x-2">
              <div className="w-2 h-2 bg-[var(--profit-green)] rounded-full animate-pulse"></div>
              <span className="text-sm text-emerald-300">Live Market Data</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-sm">
                <span className="text-slate-300">Portfolio Value:</span>
                <span className="text-[var(--profit-green)] font-semibold ml-1">
                  ${analytics?.portfolioValue?.toLocaleString() || '127,450.23'}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-slate-300">Today's P&L:</span>
                <span className="text-[var(--profit-green)] font-semibold ml-1">
                  +${analytics?.todayPnL?.toLocaleString() || '2,847.92'} 
                  ({analytics?.todayPnLPercent?.toFixed(2) || '2.29'}%)
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-cyan-100 hover:bg-gray-700">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--loss-red)] rounded-full"></span>
              </Button>
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-cyan-100 hover:bg-gray-700">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
