import { useState, useCallback } from "react";
import { Upload, FileSpreadsheet, X, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export interface MetaAdsData {
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  ctr: number;
  cpc: number;
  roas: number;
  campaigns: Array<{
    name: string;
    impressions: number;
    clicks: number;
    spend: number;
    conversions: number;
  }>;
}

interface MetaAdsImportProps {
  onDataImported: (data: MetaAdsData) => void;
  importedData: MetaAdsData | null;
}

// Expected CSV columns from Meta Ads export
const EXPECTED_COLUMNS = [
  "campaign_name",
  "impressions",
  "clicks",
  "spend",
  "conversions",
];

// Parse CSV handling both comma and semicolon as field separators
// Also handles quoted fields that may contain the separator
const parseCSV = (text: string): Array<Record<string, string>> => {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  // Detect separator - prefer semicolon if present (common in EU exports)
  const firstLine = lines[0];
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  const separator = semicolonCount > commaCount ? ";" : ",";
  
  console.log('[MetaAdsImport] Detected separator:', separator, 'semicolons:', semicolonCount, 'commas:', commaCount);
  console.log('[MetaAdsImport] First line:', firstLine);

  // Parse a single CSV line handling quoted fields
  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === separator && !inQuotes) {
        result.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim().replace(/^"|"$/g, ''));
    return result;
  };

  const headers = parseLine(lines[0]).map(h => 
    h.toLowerCase()
      .replace(/["\s]/g, "")
      .replace(/[àáâãäå]/g, "a")
      .replace(/[èéêë]/g, "e")
      .replace(/[ùúûü]/g, "u")
      .replace(/[ôö]/g, "o")
  );
  
  console.log('[MetaAdsImport] Parsed headers:', headers);

  const rows = lines.slice(1).map((line, idx) => {
    const values = parseLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = values[i] || "";
    });
    if (idx < 3) {
      console.log('[MetaAdsImport] Row', idx, ':', row);
    }
    return row;
  });

  return rows;
};

// Parse numeric value handling EU format (comma as decimal, space as thousand separator)
const parseNumericValue = (value: string | undefined): number => {
  if (!value) return 0;
  
  // Remove currency symbols, spaces, and normalize
  let cleaned = value
    .replace(/[$€£\s]/g, '') // Remove currency symbols and spaces
    .replace(/\u00A0/g, '')  // Remove non-breaking spaces
    .trim();
  
  // Handle EU format: 1.234,56 or 1 234,56
  // If there's a comma and it's the decimal separator (after a dot or near the end)
  if (cleaned.includes(',')) {
    // If format is like 1.234,56 (EU thousands with comma decimal)
    if (cleaned.includes('.') && cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.')) {
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    } 
    // If format is like 1234,56 (no thousands, comma decimal)
    else if (!cleaned.includes('.') && cleaned.match(/,\d{1,2}$/)) {
      cleaned = cleaned.replace(',', '.');
    }
    // If format is like 1,234.56 (US thousands with period decimal) - leave as is but remove commas
    else if (cleaned.includes('.') && cleaned.lastIndexOf('.') > cleaned.lastIndexOf(',')) {
      cleaned = cleaned.replace(/,/g, '');
    }
    // Default: treat comma as decimal
    else {
      cleaned = cleaned.replace(',', '.');
    }
  }
  
  // Remove any remaining non-numeric chars except decimal point and minus
  cleaned = cleaned.replace(/[^\d.\-]/g, '');
  
  const result = parseFloat(cleaned);
  return isNaN(result) ? 0 : result;
};

const normalizeColumnName = (name: string): string => {
  const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  
  // Map common variations from Meta Ads exports (French and English)
  // Campaign name variations
  if (normalized.includes("campagne") || normalized.includes("campaign") || normalized.includes("nomdelacampagne") || normalized.includes("campaignname")) return "campaign_name";
  
  // Impressions
  if (normalized.includes("impression")) return "impressions";
  
  // Clicks - handle "clicssurlelien" (link clicks) and variations
  if (normalized.includes("clic") || normalized.includes("click")) return "clicks";
  
  // Spend/Cost - handle "montantdepense", "cout", "amount spent", etc.
  if (normalized.includes("depense") || normalized.includes("spent") || normalized.includes("spend") || normalized.includes("cout") || normalized.includes("cost") || normalized.includes("montant") || normalized.includes("budget")) return "spend";
  
  // Conversions - handle "achat", "purchase", "resultats", etc.
  if (normalized.includes("conversion") || normalized.includes("achat") || normalized.includes("purchase") || normalized.includes("resultat") || normalized.includes("result")) return "conversions";
  
  // Other metrics
  if (normalized.includes("ctr")) return "ctr";
  if (normalized.includes("cpc") || normalized.includes("coutparclic")) return "cpc";
  if (normalized.includes("roas") || normalized.includes("retour")) return "roas";
  
  console.log('[MetaAdsImport] Unknown column:', name, '-> normalized:', normalized);
  return normalized;
};

export const MetaAdsImport = ({ onDataImported, importedData }: MetaAdsImportProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      const text = await file.text();
      const rows = parseCSV(text);

      if (rows.length === 0) {
        throw new Error("Le fichier est vide ou mal formaté");
      }

      // Normalize column names
      const normalizedRows = rows.map(row => {
        const normalized: Record<string, string> = {};
        Object.entries(row).forEach(([key, value]) => {
          normalized[normalizeColumnName(key)] = value;
        });
        return normalized;
      });

      // Aggregate data
      let totalImpressions = 0;
      let totalClicks = 0;
      let totalSpend = 0;
      let totalConversions = 0;
      const campaigns: MetaAdsData["campaigns"] = [];

      normalizedRows.forEach((row, idx) => {
        const impressions = parseNumericValue(row.impressions);
        const clicks = parseNumericValue(row.clicks);
        const spend = parseNumericValue(row.spend);
        const conversions = parseNumericValue(row.conversions);

        if (idx < 3) {
          console.log('[MetaAdsImport] Parsed row', idx, ':', {
            raw: { impressions: row.impressions, clicks: row.clicks, spend: row.spend, conversions: row.conversions },
            parsed: { impressions, clicks, spend, conversions }
          });
        }

        totalImpressions += impressions;
        totalClicks += clicks;
        totalSpend += spend;
        totalConversions += conversions;

        if (row.campaign_name) {
          campaigns.push({
            name: row.campaign_name,
            impressions,
            clicks,
            spend,
            conversions,
          });
        }
      });

      console.log('[MetaAdsImport] Totals:', { totalImpressions, totalClicks, totalSpend, totalConversions });

      // Calculate derived metrics
      const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
      const cpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
      // Assuming average order value of $35 for ROAS calculation (can be adjusted)
      const estimatedRevenue = totalConversions * 35;
      const roas = totalSpend > 0 ? estimatedRevenue / totalSpend : 0;

      const data: MetaAdsData = {
        impressions: totalImpressions,
        clicks: totalClicks,
        spend: totalSpend,
        conversions: totalConversions,
        ctr: parseFloat(ctr.toFixed(2)),
        cpc: parseFloat(cpc.toFixed(2)),
        roas: parseFloat(roas.toFixed(2)),
        campaigns: campaigns.sort((a, b) => b.spend - a.spend).slice(0, 10),
      };

      onDataImported(data);
      toast.success("Données Meta Ads importées avec succès !");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de l'import";
      setError(message);
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  }, [onDataImported]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && (file.type === "text/csv" || file.name.endsWith(".csv"))) {
      processFile(file);
    } else {
      setError("Veuillez importer un fichier CSV");
    }
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const clearData = () => {
    onDataImported(null as unknown as MetaAdsData);
    setError(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-blue-500" />
          Import Meta Ads
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!importedData ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              isDragging 
                ? "border-blue-500 bg-blue-500/10" 
                : "border-border hover:border-muted-foreground/50"
            }`}
          >
            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm font-medium mb-2">
              Glissez votre export CSV Meta Ads ici
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              ou cliquez pour sélectionner un fichier
            </p>
            <label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isProcessing}
              />
              <Button variant="outline" size="sm" disabled={isProcessing} asChild>
                <span>{isProcessing ? "Traitement..." : "Parcourir"}</span>
              </Button>
            </label>

            {error && (
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="mt-6 text-left">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Colonnes attendues :
              </p>
              <div className="flex flex-wrap gap-1">
                {["Campaign Name", "Impressions", "Clicks", "Spend", "Conversions"].map((col) => (
                  <span key={col} className="text-xs px-2 py-0.5 bg-muted rounded">
                    {col}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Données importées</span>
              </div>
              <Button variant="ghost" size="sm" onClick={clearData}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Impressions</p>
                <p className="text-lg font-bold">{importedData.impressions.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Clics</p>
                <p className="text-lg font-bold">{importedData.clicks.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Dépenses</p>
                <p className="text-lg font-bold">${importedData.spend.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Conversions</p>
                <p className="text-lg font-bold">{importedData.conversions}</p>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-blue-500/10 rounded-lg">
                <p className="text-xs text-muted-foreground">CTR</p>
                <p className="font-bold text-blue-600">{importedData.ctr}%</p>
              </div>
              <div className="text-center p-2 bg-purple-500/10 rounded-lg">
                <p className="text-xs text-muted-foreground">CPC</p>
                <p className="font-bold text-purple-600">${importedData.cpc}</p>
              </div>
              <div className="text-center p-2 bg-green-500/10 rounded-lg">
                <p className="text-xs text-muted-foreground">ROAS</p>
                <p className="font-bold text-green-600">{importedData.roas}x</p>
              </div>
            </div>

            {/* Top Campaigns */}
            {importedData.campaigns.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Top Campagnes</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {importedData.campaigns.slice(0, 5).map((campaign, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-muted/30 rounded text-xs">
                      <span className="truncate max-w-[60%]">{campaign.name}</span>
                      <span className="font-medium">${campaign.spend.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
