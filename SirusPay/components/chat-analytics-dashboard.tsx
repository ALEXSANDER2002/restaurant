"use client"

import React, { useState, useEffect } from 'react';
import { BarChart3, Users, MessageSquare, Clock, TrendingUp, Download, RefreshCw, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { chatAnalyticsService } from '@/services/chat-analytics-service';

interface AnalyticsData {
  metrics: any;
  insights: any[];
  realTimeStats: any;
}

export function ChatAnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadAnalytics = () => {
    setIsLoading(true);
    try {
      const metrics = chatAnalyticsService.getMetrics();
      const insights = chatAnalyticsService.getInsights();
      const realTimeStats = chatAnalyticsService.getRealTimeStats();

      setData({ metrics, insights, realTimeStats });
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(loadAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  const exportData = () => {
    try {
      const exportString = chatAnalyticsService.exportData();
      const blob = new Blob([exportString], { type: 'application/json' });
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
  };

  const clearData = () => {
    if (confirm('Tem certeza que deseja limpar todos os dados de analytics? Esta ação não pode ser desfeita.')) {
      chatAnalyticsService.clearAllData();
      loadAnalytics();
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Info className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando analytics...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center p-8 text-gray-500">
        Nenhum dado disponível. Inicie uma conversa no chatbot para gerar métricas.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard do Chatbot</h1>
          <p className="text-gray-600">
            Métricas e insights em tempo real do assistente virtual
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadAnalytics} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={clearData} variant="outline" size="sm" className="text-red-600 hover:text-red-700">
            Limpar Dados
          </Button>
        </div>
      </div>

      <div className="text-sm text-gray-500 text-right">
        Última atualização: {lastUpdated.toLocaleTimeString('pt-BR')}
      </div>

      {/* Métricas em Tempo Real */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões Ativas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.realTimeStats.activeSessions}</div>
            <p className="text-xs text-muted-foreground">
              Usuários conversando agora
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interações Hoje</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.realTimeStats.interactionsToday}</div>
            <p className="text-xs text-muted-foreground">
              Mensagens processadas hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(data.realTimeStats.averageResponseTimeToday)}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Tempo de resposta médio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfação</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(data.realTimeStats.satisfactionToday * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Taxa de satisfação hoje
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Métricas Gerais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estatísticas Gerais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Estatísticas Gerais (7 dias)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                                 <div className="text-2xl font-bold text-blue-600">
                   {data.metrics.totalInteractions || 0}
                 </div>
                <div className="text-sm text-blue-600">Total de Interações</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                                 <div className="text-2xl font-bold text-green-600">
                   {Math.round((data.metrics.satisfactionRate as number) * 100)}%
                 </div>
                <div className="text-sm text-green-600">Taxa de Satisfação</div>
              </div>
            </div>
            
                         <div className="space-y-2">
               <div className="flex justify-between text-sm">
                 <span>Tempo médio de resposta:</span>
                 <span className="font-medium">{Math.round((data.metrics.averageResponseTime as number) || 0)}ms</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span>Total de sessões:</span>
                 <span className="font-medium">{(data.metrics.sessionMetrics?.totalSessions as number) || 0}</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span>Mensagens por sessão:</span>
                 <span className="font-medium">
                   {Math.round((data.metrics.sessionMetrics?.averageMessagesPerSession as number) || 0)}
                 </span>
               </div>
             </div>
          </CardContent>
        </Card>

        {/* Tópicos Populares */}
        <Card>
          <CardHeader>
            <CardTitle>Tópicos Mais Populares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.metrics.popularTopics.slice(0, 5).map((topic: any, index: number) => (
                <div key={topic.topic} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                      {index + 1}
                    </div>
                    <span className="capitalize">{topic.topic.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(topic.count / ((data.metrics.totalInteractions as number) || 1)) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-600">{topic.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Insights e Recomendações
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.insights.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <p>Tudo está funcionando bem! Nenhuma recomendação necessária no momento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.insights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getPriorityColor(insight.priority)}`}
                >
                  <div className="flex items-start gap-3">
                    {getPriorityIcon(insight.priority)}
                    <div>
                      <h4 className="font-medium capitalize">
                        {insight.type.replace('_', ' ')}
                      </h4>
                      <p className="text-sm mt-1">{insight.message}</p>
                      <div className="mt-2">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          (insight.priority as string) === 'high' ? 'bg-red-100 text-red-800' :
                          (insight.priority as string) === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          Prioridade: {(insight.priority as string) === 'high' ? 'Alta' : 
                                     (insight.priority as string) === 'medium' ? 'Média' : 'Baixa'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Distribuição de Idiomas */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Idiomas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(data.metrics.languageDistribution).map(([language, count]) => (
              <div key={language} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-600 capitalize">
                  {language === 'pt-BR' ? 'Português' : 
                   language === 'en-US' ? 'Inglês' : 
                   language === 'es' ? 'Espanhol' : 
                   language === 'fr' ? 'Francês' : language}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
