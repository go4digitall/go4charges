import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Lightbulb, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, History, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { MetaAdsData } from "./MetaAdsImport";

interface MetaAdsHistoryItem {
  id: string;
  importedAt: string;
  data: MetaAdsData;
  analysis?: MetaAdsAnalysisResult;
}

interface MetaAdsAnalysisResult {
  summary: string;
  score: "good" | "warning" | "critical";
  insights: Array<{
    type: "success" | "warning" | "improvement";
    title: string;
    description: string;
  }>;
  recommendations: Array<{
    priority: "high" | "medium" | "low";
    title: string;
    action: string;
  }>;
  comparison?: {
    vsLastImport: {
      spendChange: number;
      roasChange: number;
      cpcChange: number;
      conversionsChange: number;
    };
  };
}

interface MetaAdsAnalysisProps {
  currentData: MetaAdsData | null;
  onHistorySelect?: (data: MetaAdsData) => void;
}

const HISTORY_KEY = "meta_ads_history";
const MAX_HISTORY_ITEMS = 10;

export const MetaAdsAnalysis = ({ currentData, onHistorySelect }: MetaAdsAnalysisProps) => {
  const [history, setHistory] = useState<MetaAdsHistoryItem[]>([]);
  const [analysis, setAnalysis] = useState<MetaAdsAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Load history from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setHistory(parsed);
      } catch {
        console.error("Failed to parse Meta Ads history");
      }
    }
  }, []);

  // Save current data to history when it changes
  useEffect(() => {
    if (currentData && currentData.impressions > 0) {
      const newItem: MetaAdsHistoryItem = {
        id: Date.now().toString(),
        importedAt: new Date().toISOString(),
        data: currentData,
      };

      // Check if this exact data already exists (avoid duplicates)
      const isDuplicate = history.some(
        h => h.data.impressions === currentData.impressions &&
             h.data.spend === currentData.spend &&
             h.data.clicks === currentData.clicks
      );

      if (!isDuplicate) {
        const newHistory = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
        setHistory(newHistory);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
        
        // Auto-analyze new import
        analyzeData(currentData, history[0]?.data);
      }
    }
  }, [currentData]);

  const analyzeData = async (data: MetaAdsData, previousData?: MetaAdsData) => {
    setIsAnalyzing(true);
    
    try {
      const { data: result, error } = await supabase.functions.invoke("analyze-meta-ads", {
        body: { 
          currentData: data,
          previousData: previousData || null,
        },
      });

      if (error) throw error;

      setAnalysis(result);
      
      // Update history item with analysis
      const updatedHistory = history.map((item, idx) => 
        idx === 0 ? { ...item, analysis: result } : item
      );
      setHistory(updatedHistory);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
      
    } catch (err) {
      console.error("Analysis error:", err);
      // Fallback to local analysis
      const localAnalysis = generateLocalAnalysis(data, previousData);
      setAnalysis(localAnalysis);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateLocalAnalysis = (data: MetaAdsData, previousData?: MetaAdsData): MetaAdsAnalysisResult => {
    const insights: MetaAdsAnalysisResult["insights"] = [];
    const recommendations: MetaAdsAnalysisResult["recommendations"] = [];
    
    // Analyze CTR
    if (data.ctr >= 2) {
      insights.push({
        type: "success",
        title: "Excellent CTR",
        description: `Votre CTR de ${data.ctr}% est supérieur à la moyenne du secteur (1-2%).`,
      });
    } else if (data.ctr < 1) {
      insights.push({
        type: "warning",
        title: "CTR faible",
        description: `Votre CTR de ${data.ctr}% est en dessous de la moyenne. Vos créatives méritent d'être optimisées.`,
      });
      recommendations.push({
        priority: "high",
        title: "Améliorer les créatives",
        action: "Testez de nouvelles images/vidéos avec un hook plus accrocheur dans les 3 premières secondes.",
      });
    }

    // Analyze CPC
    if (data.cpc > 2) {
      insights.push({
        type: "warning",
        title: "CPC élevé",
        description: `Un CPC de $${data.cpc} est au-dessus de la moyenne. Vérifiez votre ciblage.`,
      });
      recommendations.push({
        priority: "medium",
        title: "Optimiser le ciblage",
        action: "Élargissez votre audience ou utilisez des lookalikes basées sur vos meilleurs clients.",
      });
    } else if (data.cpc < 0.5) {
      insights.push({
        type: "success",
        title: "CPC très compétitif",
        description: `Excellent ! Un CPC de $${data.cpc} montre que votre ciblage est efficace.`,
      });
    }

    // Analyze ROAS
    if (data.roas >= 3) {
      insights.push({
        type: "success",
        title: "ROAS excellent",
        description: `Un ROAS de ${data.roas}x signifie que pour chaque $1 dépensé, vous générez $${data.roas} de revenus.`,
      });
    } else if (data.roas >= 2) {
      insights.push({
        type: "success",
        title: "ROAS rentable",
        description: `Un ROAS de ${data.roas}x est rentable. Vous pouvez scaler prudemment.`,
      });
    } else if (data.roas < 1) {
      insights.push({
        type: "warning",
        title: "ROAS déficitaire",
        description: `Attention ! Un ROAS de ${data.roas}x signifie que vous perdez de l'argent sur vos pubs.`,
      });
      recommendations.push({
        priority: "high",
        title: "Revoir la stratégie",
        action: "Pausez les campagnes non performantes et concentrez le budget sur celles avec le meilleur ROAS.",
      });
    }

    // Analyze conversion rate
    const conversionRate = data.clicks > 0 ? (data.conversions / data.clicks) * 100 : 0;
    if (conversionRate < 1 && data.clicks > 100) {
      insights.push({
        type: "improvement",
        title: "Taux de conversion à améliorer",
        description: `Seulement ${conversionRate.toFixed(2)}% de vos clics convertissent. La landing page peut être optimisée.`,
      });
      recommendations.push({
        priority: "high",
        title: "Optimiser la landing page",
        action: "Améliorez le hero section, ajoutez plus de preuves sociales et simplifiez le parcours d'achat.",
      });
    }

    // Compare with previous
    let comparison;
    if (previousData) {
      comparison = {
        vsLastImport: {
          spendChange: previousData.spend > 0 ? ((data.spend - previousData.spend) / previousData.spend) * 100 : 0,
          roasChange: previousData.roas > 0 ? ((data.roas - previousData.roas) / previousData.roas) * 100 : 0,
          cpcChange: previousData.cpc > 0 ? ((data.cpc - previousData.cpc) / previousData.cpc) * 100 : 0,
          conversionsChange: previousData.conversions > 0 ? ((data.conversions - previousData.conversions) / previousData.conversions) * 100 : 0,
        },
      };

      if (comparison.vsLastImport.roasChange > 10) {
        insights.push({
          type: "success",
          title: "ROAS en hausse",
          description: `+${comparison.vsLastImport.roasChange.toFixed(1)}% vs le dernier import. Vos optimisations portent leurs fruits !`,
        });
      } else if (comparison.vsLastImport.roasChange < -10) {
        insights.push({
          type: "warning",
          title: "ROAS en baisse",
          description: `${comparison.vsLastImport.roasChange.toFixed(1)}% vs le dernier import. Analysez les changements récents.`,
        });
      }
    }

    // Determine overall score
    let score: "good" | "warning" | "critical" = "good";
    if (data.roas < 1 || (data.ctr < 0.5 && data.clicks > 100)) {
      score = "critical";
    } else if (data.roas < 2 || data.cpc > 2) {
      score = "warning";
    }

    // Generate summary
    let summary = "";
    if (score === "good") {
      summary = `Vos campagnes Meta performent bien avec un ROAS de ${data.roas}x et un CTR de ${data.ctr}%. Continuez à scaler !`;
    } else if (score === "warning") {
      summary = `Vos campagnes sont rentables mais peuvent être optimisées. Focus sur l'amélioration du ${data.roas < 2 ? "ROAS" : "CPC"}.`;
    } else {
      summary = `Attention, vos campagnes nécessitent une intervention urgente. Le ROAS de ${data.roas}x indique des pertes.`;
    }

    return {
      summary,
      score,
      insights,
      recommendations,
      comparison,
    };
  };

  const getScoreColor = (score: string) => {
    switch (score) {
      case "good": return "text-green-600 bg-green-500/10 border-green-500/20";
      case "warning": return "text-yellow-600 bg-yellow-500/10 border-yellow-500/20";
      case "critical": return "text-red-600 bg-red-500/10 border-red-500/20";
      default: return "text-muted-foreground";
    }
  };

  const getScoreIcon = (score: string) => {
    switch (score) {
      case "good": return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "warning": return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "critical": return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default: return null;
    }
  };

  if (!currentData) return null;

  return (
    <div className="space-y-4">
      {/* Analysis Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Analyse & Recommandations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isAnalyzing ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
              <span className="text-sm text-muted-foreground">Analyse en cours...</span>
            </div>
          ) : analysis ? (
            <>
              {/* Summary */}
              <div className={`p-4 rounded-xl border ${getScoreColor(analysis.score)}`}>
                <div className="flex items-start gap-3">
                  {getScoreIcon(analysis.score)}
                  <p className="text-sm font-medium">{analysis.summary}</p>
                </div>
              </div>

              {/* Comparison with last import */}
              {analysis.comparison && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="p-2 bg-muted/50 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">Dépenses</p>
                    <p className={`text-sm font-bold ${analysis.comparison.vsLastImport.spendChange > 0 ? "text-red-500" : "text-green-500"}`}>
                      {analysis.comparison.vsLastImport.spendChange > 0 ? "+" : ""}
                      {analysis.comparison.vsLastImport.spendChange.toFixed(1)}%
                    </p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">ROAS</p>
                    <p className={`text-sm font-bold ${analysis.comparison.vsLastImport.roasChange > 0 ? "text-green-500" : "text-red-500"}`}>
                      {analysis.comparison.vsLastImport.roasChange > 0 ? "+" : ""}
                      {analysis.comparison.vsLastImport.roasChange.toFixed(1)}%
                    </p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">CPC</p>
                    <p className={`text-sm font-bold ${analysis.comparison.vsLastImport.cpcChange < 0 ? "text-green-500" : "text-red-500"}`}>
                      {analysis.comparison.vsLastImport.cpcChange > 0 ? "+" : ""}
                      {analysis.comparison.vsLastImport.cpcChange.toFixed(1)}%
                    </p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">Conversions</p>
                    <p className={`text-sm font-bold ${analysis.comparison.vsLastImport.conversionsChange > 0 ? "text-green-500" : "text-red-500"}`}>
                      {analysis.comparison.vsLastImport.conversionsChange > 0 ? "+" : ""}
                      {analysis.comparison.vsLastImport.conversionsChange.toFixed(1)}%
                    </p>
                  </div>
                </div>
              )}

              {/* Insights */}
              {analysis.insights.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    Insights
                  </p>
                  <div className="space-y-2">
                    {analysis.insights.map((insight, idx) => (
                      <div 
                        key={idx} 
                        className={`p-3 rounded-lg border text-sm ${
                          insight.type === "success" 
                            ? "bg-green-500/5 border-green-500/20" 
                            : insight.type === "warning"
                            ? "bg-yellow-500/5 border-yellow-500/20"
                            : "bg-blue-500/5 border-blue-500/20"
                        }`}
                      >
                        <p className="font-medium">{insight.title}</p>
                        <p className="text-muted-foreground text-xs mt-1">{insight.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {analysis.recommendations.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    Recommandations
                  </p>
                  <div className="space-y-2">
                    {analysis.recommendations.map((rec, idx) => (
                      <div key={idx} className="p-3 bg-muted/50 rounded-lg border">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge 
                            variant={rec.priority === "high" ? "destructive" : rec.priority === "medium" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {rec.priority === "high" ? "Priorité haute" : rec.priority === "medium" ? "Moyen" : "Optionnel"}
                          </Badge>
                          <span className="text-sm font-medium">{rec.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{rec.action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <Button 
              onClick={() => analyzeData(currentData, history[1]?.data)} 
              className="w-full"
              variant="outline"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Lancer l'analyse
            </Button>
          )}
        </CardContent>
      </Card>

      {/* History */}
      {history.length > 1 && (
        <Card>
          <CardHeader 
            className="pb-2 cursor-pointer" 
            onClick={() => setShowHistory(!showHistory)}
          >
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2">
                <History className="h-5 w-5 text-muted-foreground" />
                Historique des imports
                <Badge variant="secondary" className="text-xs">{history.length}</Badge>
              </span>
              {showHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CardTitle>
          </CardHeader>
          {showHistory && (
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {history.map((item, idx) => (
                  <div 
                    key={item.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                      idx === 0 ? "bg-primary/5 border-primary/20" : ""
                    }`}
                    onClick={() => onHistorySelect?.(item.data)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium flex items-center gap-2">
                          {new Date(item.importedAt).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                          {idx === 0 && <Badge variant="default" className="text-xs">Actuel</Badge>}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.data.impressions.toLocaleString()} impressions • ${item.data.spend.toFixed(2)} dépensés
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${item.data.roas >= 2 ? "text-green-600" : item.data.roas >= 1 ? "text-yellow-600" : "text-red-600"}`}>
                          {item.data.roas}x ROAS
                        </p>
                        <p className="text-xs text-muted-foreground">{item.data.conversions} conv.</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
};
