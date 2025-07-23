import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { SentimentDashboard } from "@/components/SentimentDashboard";
import { AlertCenter } from "@/components/AlertCenter";
import { useQuery } from "@tanstack/react-query";
import { Analytics } from "@shared/schema";

export default function SentimentPage() {
  const { data: analytics } = useQuery<Analytics>({
    queryKey: ["/api/analytics"],
  });

  return (
    <div className="min-h-screen bg-[var(--trading-dark)] text-gray-100">
      <Header analytics={analytics} />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6 space-y-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white">Sentiment Analysis & Alerts</h1>
              <p className="text-gray-400 mt-2">Market sentiment indicators and real-time alerts</p>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <SentimentDashboard />
              </div>
              <div className="xl:col-span-1">
                <AlertCenter />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}