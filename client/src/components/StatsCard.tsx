import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  trend: "up" | "down";
  bgColor: string;
}

export function StatsCard({ title, value, change, icon, trend, bgColor }: StatsCardProps) {
  return (
    <Card className="bg-[var(--trading-slate)] border-gray-700">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
          </div>
          <div className={`${bgColor} p-3 rounded-lg`}>
            <div className="text-white">
              {icon}
            </div>
          </div>
        </div>
        <div className="mt-2 flex items-center">
          {trend === "up" ? (
            <TrendingUp className="h-3 w-3 text-[var(--profit-green)]" />
          ) : (
            <TrendingDown className="h-3 w-3 text-[var(--loss-red)]" />
          )}
          <span className={`text-xs ml-1 ${
            trend === "up" ? "text-[var(--profit-green)]" : "text-[var(--loss-red)]"
          }`}>
            {change}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
