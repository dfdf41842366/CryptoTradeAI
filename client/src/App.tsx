import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import ScannerPage from "@/pages/scanner";
import SentimentPage from "@/pages/sentiment";
import APIStatusPage from "@/pages/api-status";
import { SwarmPage } from "@/pages/swarm";
import { PortfolioPage } from "@/pages/portfolio";
import { BacktestingPage } from "@/pages/backtesting";
import { RiskManagementPage } from "@/pages/risk-management";
import { AlertsPage } from "@/pages/alerts";
import { NewsPage } from "@/pages/news";
import NewsRoomPage from "@/pages/newsroom";
import StrategyRoomEnhanced from "@/pages/strategy-room-enhanced";
import { ChatPage } from "@/pages/chat";
import { AIPredictionsPage } from "@/pages/ai-predictions";
import { QuantumAnalysisPage } from "@/pages/quantum-analysis";
import { DarkPoolsPage } from "@/pages/dark-pools";
import { OptionsFlowPage } from "@/pages/options-flow";
import TradingTeamPage from "@/pages/trading-team";
import QuantumMarketPage from "@/pages/quantum-market";
import AdaptiveAIPage from "@/pages/adaptive-ai";
import AutonomousAIPage from "@/pages/autonomous-ai";
import SwingMastersPage from "@/pages/swing-masters";
import AICouncilPage from "@/pages/ai-council";
import AnomalyHuntersPage from "@/pages/anomaly-hunters";
import NeuralNexusPage from "@/pages/neural-nexus";
import MetaTradingPage from "@/pages/meta-trading";
import TimeChamberPage from "@/pages/time-chamber";
import HiveMindPage from "@/pages/hive-mind";
import ChartsPage from "@/pages/charts";
import SuperChartsPage from "@/pages/super-charts";
import PreMarketScanner from "@/pages/pre-market-scanner";
import AIProvidersPage from "@/pages/ai-providers";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/scanner" component={ScannerPage} />
      <Route path="/sentiment" component={SentimentPage} />
      <Route path="/swarm" component={SwarmPage} />
      <Route path="/portfolio" component={PortfolioPage} />
      <Route path="/backtesting" component={BacktestingPage} />
      <Route path="/risk-management" component={RiskManagementPage} />
      <Route path="/alerts" component={AlertsPage} />
      <Route path="/news" component={NewsPage} />
      <Route path="/newsroom" component={NewsRoomPage} />
      <Route path="/strategy-room" component={StrategyRoomEnhanced} />
      <Route path="/strategy-room-enhanced" component={StrategyRoomEnhanced} />
      <Route path="/chat" component={ChatPage} />
      <Route path="/ai-predictions" component={AIPredictionsPage} />
      <Route path="/quantum-analysis" component={QuantumAnalysisPage} />
      <Route path="/dark-pools" component={DarkPoolsPage} />
      <Route path="/options-flow" component={OptionsFlowPage} />
      <Route path="/trading-team" component={TradingTeamPage} />
      <Route path="/quantum-market" component={QuantumMarketPage} />
      <Route path="/adaptive-ai" component={AdaptiveAIPage} />
      <Route path="/autonomous-ai" component={AutonomousAIPage} />
      <Route path="/swing-masters" component={SwingMastersPage} />
      <Route path="/ai-council" component={AICouncilPage} />
      <Route path="/anomaly-hunters" component={AnomalyHuntersPage} />
      <Route path="/neural-nexus" component={NeuralNexusPage} />
      <Route path="/meta-trading" component={MetaTradingPage} />
      <Route path="/time-chamber" component={TimeChamberPage} />
      <Route path="/hive-mind" component={HiveMindPage} />
      <Route path="/charts" component={ChartsPage} />
      <Route path="/super-charts" component={SuperChartsPage} />
      <Route path="/pre-market-scanner" component={PreMarketScanner} />
      <Route path="/api-status" component={APIStatusPage} />
      <Route path="/ai-providers" component={AIProvidersPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
