import { useCallback, useEffect, useState } from 'react';
import { chatAnalyticsService } from '@/services/chat-analytics-service';

interface ChatMetrics {
  totalInteractions: number;
  averageResponseTime: number;
  satisfactionRate: number;
  popularTopics: Array<{ topic: string; count: number }>;
  languageDistribution: Record<string, number>;
  sessionMetrics: {
    averageSessionLength: number;
    averageMessagesPerSession: number;
    totalSessions: number;
  };
}

interface ChatInsight {
  type: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
}

interface RealTimeStats {
  activeSessions: number;
  interactionsToday: number;
  averageResponseTimeToday: number;
  satisfactionToday: number;
}

export function useChatAnalytics() {
  const [metrics, setMetrics] = useState<ChatMetrics | null>(null);
  const [insights, setInsights] = useState<ChatInsight[]>([]);
  const [realTimeStats, setRealTimeStats] = useState<RealTimeStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Carregar métricas
  const loadMetrics = useCallback(async () => {
    setIsLoading(true);
    try {
      const metricsData = chatAnalyticsService.getMetrics();
      const insightsData = chatAnalyticsService.getInsights();
      
      setMetrics(metricsData);
      setInsights(insightsData);
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Carregar estatísticas em tempo real
  const loadRealTimeStats = useCallback(async () => {
    try {
      const stats = chatAnalyticsService.getRealTimeStats();
      setRealTimeStats(stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas em tempo real:', error);
    }
  }, []);

  // Rastrear nova interação
  const trackInteraction = useCallback((
    message: string,
    response: string,
    responseTime: number,
    language: string = 'pt-BR'
  ) => {
    chatAnalyticsService.trackInteraction(message, response, responseTime, language);
    // Atualizar estatísticas em tempo real
    loadRealTimeStats();
  }, [loadRealTimeStats]);

  // Rastrear feedback
  const trackFeedback = useCallback((
    messageId: string,
    helpful: boolean,
    rating?: number,
    comment?: string
  ) => {
    chatAnalyticsService.trackFeedback(messageId, helpful, rating, comment);
    // Atualizar métricas
    loadMetrics();
  }, [loadMetrics]);

  // Finalizar sessão atual
  const endCurrentSession = useCallback(() => {
    chatAnalyticsService.endCurrentSession();
    // Atualizar estatísticas
    loadRealTimeStats();
    loadMetrics();
  }, [loadRealTimeStats, loadMetrics]);

  // Exportar dados
  const exportData = useCallback(() => {
    try {
      const data = chatAnalyticsService.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-analytics-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
    }
  }, []);

  // Limpar dados (útil para testes)
  const clearData = useCallback(() => {
    chatAnalyticsService.clearAllData();
    setMetrics(null);
    setInsights([]);
    setRealTimeStats(null);
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    loadMetrics();
    loadRealTimeStats();
  }, [loadMetrics, loadRealTimeStats]);

  // Atualizar estatísticas em tempo real a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      loadRealTimeStats();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadRealTimeStats]);

  return {
    // Dados
    metrics,
    insights,
    realTimeStats,
    isLoading,
    
    // Ações
    trackInteraction,
    trackFeedback,
    endCurrentSession,
    loadMetrics,
    loadRealTimeStats,
    exportData,
    clearData,
    
    // Utilitários
    hasData: metrics !== null || realTimeStats !== null,
    hasInsights: insights.length > 0,
    criticalInsights: insights.filter(insight => insight.priority === 'high'),
    mediumInsights: insights.filter(insight => insight.priority === 'medium'),
    lowInsights: insights.filter(insight => insight.priority === 'low'),
  };
}
