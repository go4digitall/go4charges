import { useState } from "react";
import { 
  Sparkles, RefreshCw, Copy, Check, ChevronDown, ChevronUp,
  TrendingUp, AlertTriangle, Lightbulb, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Recommendation {
  id: string;
  title: string;
  impact: "high" | "medium" | "low";
  problem: string;
  solution: string;
  prompt: string;
}

interface RecommendationsData {
  summary: string;
  recommendations: Recommendation[];
}

interface AnalyticsContext {
  sessions?: number;
  pageViews?: number;
  clicks?: number;
  addToCart?: number;
  avgTimeOnPage?: number;
  avgScrollDepth?: number;
}

interface SalesContext {
  totalRevenue?: number;
  totalOrders?: number;
  avgOrderValue?: number;
}

interface MetaAdsContext {
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  ctr: number;
  cpc: number;
  roas: number;
}

interface SiteRecommendationsProps {
  analyticsData: AnalyticsContext;
  salesData: SalesContext;
  metaAdsData: MetaAdsContext | null;
}

const RECOMMENDATIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/site-recommendations`;

const impactColors = {
  high: "bg-red-500/10 text-red-600 border-red-500/20",
  medium: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  low: "bg-blue-500/10 text-blue-600 border-blue-500/20",
};

const impactLabels = {
  high: "Impact Élevé",
  medium: "Impact Moyen",
  low: "Impact Faible",
};

export const SiteRecommendations = ({ 
  analyticsData, 
  salesData, 
  metaAdsData 
}: SiteRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<RecommendationsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const generateRecommendations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(RECOMMENDATIONS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          analyticsData,
          salesData,
          metaAdsData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate recommendations");
      }

      const data = await response.json();
      setRecommendations(data);
      toast.success("Recommandations générées !");
    } catch (error) {
      console.error("Error generating recommendations:", error);
      toast.error("Erreur lors de la génération des recommandations");
    } finally {
      setIsLoading(false);
    }
  };

  const copyPrompt = async (id: string, prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopiedId(id);
      toast.success("Prompt copié ! Collez-le dans le chat Lovable");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Erreur lors de la copie");
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-purple-500/5">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          🎯 Recommandations IA
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!recommendations ? (
          <div className="text-center py-8">
            <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-2">
              Analyse tes données et ton site pour générer des recommandations personnalisées
            </p>
            <p className="text-xs text-muted-foreground mb-6">
              L'IA va comparer tes KPIs avec les benchmarks du secteur et proposer des améliorations
            </p>
            <Button 
              onClick={generateRecommendations} 
              disabled={isLoading}
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Analyse en cours...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Générer des recommandations
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="p-4 bg-muted/50 rounded-xl">
              <p className="text-sm">{recommendations.summary}</p>
            </div>

            {/* Refresh Button */}
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={generateRecommendations}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
            </div>

            {/* Recommendations List */}
            <div className="space-y-3">
              {recommendations.recommendations.map((rec, index) => (
                <div 
                  key={rec.id} 
                  className="border rounded-xl overflow-hidden bg-card"
                >
                  {/* Header - Always visible */}
                  <button
                    onClick={() => toggleExpand(rec.id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-muted-foreground">
                        #{index + 1}
                      </span>
                      <div className="text-left">
                        <p className="font-medium">{rec.title}</p>
                        <Badge 
                          variant="outline" 
                          className={`mt-1 ${impactColors[rec.impact]}`}
                        >
                          {rec.impact === "high" && <TrendingUp className="h-3 w-3 mr-1" />}
                          {rec.impact === "medium" && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {impactLabels[rec.impact]}
                        </Badge>
                      </div>
                    </div>
                    {expandedId === rec.id ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>

                  {/* Expanded Content */}
                  {expandedId === rec.id && (
                    <div className="px-4 pb-4 space-y-4 border-t">
                      {/* Problem */}
                      <div className="pt-4">
                        <p className="text-xs font-semibold text-muted-foreground mb-1">
                          🔍 PROBLÈME DÉTECTÉ
                        </p>
                        <p className="text-sm">{rec.problem}</p>
                      </div>

                      {/* Solution */}
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">
                          💡 SOLUTION PROPOSÉE
                        </p>
                        <p className="text-sm">{rec.solution}</p>
                      </div>

                      {/* Prompt to Copy */}
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-2">
                          📋 PROMPT À COPIER POUR LOVABLE
                        </p>
                        <div className="relative">
                          <div className="p-3 bg-muted rounded-lg text-sm font-mono whitespace-pre-wrap border-2 border-dashed border-primary/30">
                            {rec.prompt}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => copyPrompt(rec.id, rec.prompt)}
                            className="absolute top-2 right-2"
                            variant={copiedId === rec.id ? "default" : "secondary"}
                          >
                            {copiedId === rec.id ? (
                              <>
                                <Check className="h-4 w-4 mr-1" />
                                Copié !
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4 mr-1" />
                                Copier
                              </>
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          👆 Copiez ce prompt et collez-le dans le chat Lovable pour appliquer cette modification
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
