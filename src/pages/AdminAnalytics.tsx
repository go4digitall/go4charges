import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area
} from "recharts";
import { 
  Users, Eye, Clock, 
  Smartphone, Monitor, Tablet, TrendingUp, TrendingDown,
  DollarSign, Package, CreditCard, Globe, ExternalLink, MapPin
} from "lucide-react";
import { MarketingChatBot } from "@/components/admin/MarketingChatBot";
import { MetaAdsImport, type MetaAdsData } from "@/components/admin/MetaAdsImport";
import { SiteRecommendations } from "@/components/admin/SiteRecommendations";

interface LovableAnalyticsData {
  totalVisitors: number;
  totalPageViews: number;
  avgSessionDuration: number;
  bounceRate: number;
  avgPageviewsPerVisit: number;
  dailyTraffic: { date: string; visitors: number; pageviews: number }[];
  deviceBreakdown: { name: string; value: number }[];
  topPages: { page: string; views: number }[];
  trafficSources: { source: string; visits: number }[];
  countries: { country: string; visits: number }[];
}

interface SalesData {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  currency: string;
  recentOrders: Array<{
    id: string;
    order_number: string;
    total_price: number;
    currency: string;
    financial_status: string;
    items_count: number;
    customer_data: { first_name?: string; city?: string; country?: string };
    created_at: string;
  }>;
  dailyRevenue: { date: string; revenue: number; orders: number }[];
  topProducts: { name: string; quantity: number; revenue: number }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const AdminAnalytics = () => {
  const [data, setData] = useState<LovableAnalyticsData | null>(null);
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [metaAdsData, setMetaAdsData] = useState<MetaAdsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Build context for the marketing chatbot
  const analyticsContext = useMemo(() => ({
    sessions: data?.totalVisitors || 0,
    pageViews: data?.totalPageViews || 0,
    addToCart: 0, // Not tracked in Lovable Analytics
    avgTimeOnPage: data?.avgSessionDuration || 0,
    avgScrollDepth: 0, // Not tracked in Lovable Analytics
    totalRevenue: salesData?.totalRevenue || 0,
    totalOrders: salesData?.totalOrders || 0,
    avgOrderValue: salesData?.avgOrderValue || 0,
    conversionRate: data?.totalPageViews && data.totalPageViews > 0 
      ? `${((salesData?.totalOrders || 0) / data.totalVisitors * 100).toFixed(1)}%` 
      : "0%",
    bounceRate: data?.bounceRate || 0,
    metaAdsData: metaAdsData,
  }), [data, salesData, metaAdsData]);

  useEffect(() => {
    fetchLovableAnalytics();
    fetchSalesData();
  }, []);

  const fetchLovableAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch daily analytics data
      const { data: dailyData, error: dailyError } = await supabase
        .from('lovable_analytics_daily')
        .select('*')
        .order('date', { ascending: true });

      // Fetch traffic sources
      const { data: sourcesData, error: sourcesError } = await supabase
        .from('lovable_analytics_sources')
        .select('*')
        .order('visits', { ascending: false });

      // Fetch device breakdown
      const { data: devicesData, error: devicesError } = await supabase
        .from('lovable_analytics_devices')
        .select('*')
        .order('visits', { ascending: false });

      // Fetch countries
      const { data: countriesData, error: countriesError } = await supabase
        .from('lovable_analytics_countries')
        .select('*')
        .order('visits', { ascending: false });

      // Fetch top pages
      const { data: pagesData, error: pagesError } = await supabase
        .from('lovable_analytics_pages')
        .select('*')
        .order('views', { ascending: false });

      if (dailyError || sourcesError || devicesError || countriesError || pagesError) {
        console.error('Error fetching analytics:', { dailyError, sourcesError, devicesError, countriesError, pagesError });
        throw new Error('Failed to fetch analytics data');
      }

      // Calculate totals from daily data
      const totalVisitors = dailyData?.reduce((sum, d) => sum + (d.visitors || 0), 0) || 0;
      const totalPageViews = dailyData?.reduce((sum, d) => sum + (d.pageviews || 0), 0) || 0;
      const avgSessionDuration = dailyData && dailyData.length > 0
        ? dailyData.reduce((sum, d) => sum + (parseFloat(String(d.session_duration_seconds)) || 0), 0) / dailyData.length
        : 0;
      const bounceRate = dailyData && dailyData.length > 0
        ? dailyData.reduce((sum, d) => sum + (d.bounce_rate || 0), 0) / dailyData.length
        : 0;
      const avgPageviewsPerVisit = dailyData && dailyData.length > 0
        ? dailyData.reduce((sum, d) => sum + (parseFloat(String(d.pageviews_per_visit)) || 0), 0) / dailyData.length
        : 0;

      setData({
        totalVisitors,
        totalPageViews,
        avgSessionDuration: Math.round(avgSessionDuration),
        bounceRate: Math.round(bounceRate),
        avgPageviewsPerVisit: parseFloat(avgPageviewsPerVisit.toFixed(2)),
        dailyTraffic: dailyData?.map(d => ({
          date: new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
          visitors: d.visitors || 0,
          pageviews: d.pageviews || 0,
        })) || [],
        deviceBreakdown: devicesData?.map(d => ({
          name: d.device_type,
          value: d.visits,
        })) || [],
        topPages: pagesData?.map(p => ({
          page: p.page_path,
          views: p.views,
        })) || [],
        trafficSources: sourcesData?.map(s => ({
          source: s.source_name,
          visits: s.visits,
        })) || [],
        countries: countriesData?.map(c => ({
          country: c.country_code,
          visits: c.visits,
        })) || [],
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesData = async () => {
    try {
      const { data: orders, error } = await supabase
        .from('shopify_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!orders || orders.length === 0) {
        setSalesData({
          totalRevenue: 0,
          totalOrders: 0,
          avgOrderValue: 0,
          currency: 'USD',
          recentOrders: [],
          dailyRevenue: [],
          topProducts: [],
        });
        return;
      }

      // Calculate totals
      const totalRevenue = orders.reduce((sum, o) => sum + (parseFloat(String(o.total_price)) || 0), 0);
      const totalOrders = orders.length;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const currency = orders[0]?.currency || 'USD';

      // Daily revenue
      const dailyMap: Record<string, { revenue: number; orders: number }> = {};
      orders.forEach(o => {
        const date = new Date(o.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
        if (!dailyMap[date]) dailyMap[date] = { revenue: 0, orders: 0 };
        dailyMap[date].revenue += parseFloat(String(o.total_price)) || 0;
        dailyMap[date].orders += 1;
      });
      const dailyRevenue = Object.entries(dailyMap)
        .map(([date, data]) => ({ date, ...data }))
        .reverse();

      // Top products
      const productMap: Record<string, { quantity: number; revenue: number }> = {};
      orders.forEach(o => {
        const lineItems = o.line_items as Array<{ title: string; quantity: number; price: string }> || [];
        lineItems.forEach(item => {
          const name = item.title || 'Unknown';
          if (!productMap[name]) productMap[name] = { quantity: 0, revenue: 0 };
          productMap[name].quantity += item.quantity || 1;
          productMap[name].revenue += (parseFloat(item.price) || 0) * (item.quantity || 1);
        });
      });
      const topProducts = Object.entries(productMap)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      setSalesData({
        totalRevenue,
        totalOrders,
        avgOrderValue,
        currency,
        recentOrders: orders.slice(0, 10).map(o => ({
          id: o.id,
          order_number: o.order_number || '',
          total_price: parseFloat(String(o.total_price)) || 0,
          currency: o.currency || 'USD',
          financial_status: o.financial_status || '',
          items_count: o.items_count || 0,
          customer_data: o.customer_data as { first_name?: string; city?: string; country?: string } || {},
          created_at: o.created_at,
        })),
        dailyRevenue,
        topProducts,
      });
    } catch (error) {
      console.error('Error fetching sales data:', error);
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'tablet': return <Tablet className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Erreur de chargement des données</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">📊 Analytics Dashboard</h1>
            <p className="text-muted-foreground text-sm">Données depuis le 23 janvier 2026</p>
          </div>
          <Badge variant="outline" className="w-fit">
            Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}
          </Badge>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Users className="h-4 w-4" />
                <span className="text-xs">Visiteurs</span>
              </div>
              <p className="text-xl md:text-2xl font-bold">{data.totalVisitors.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Eye className="h-4 w-4" />
                <span className="text-xs">Pages vues</span>
              </div>
              <p className="text-xl md:text-2xl font-bold">{data.totalPageViews.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-xs">Durée session</span>
              </div>
              <p className="text-xl md:text-2xl font-bold">{data.avgSessionDuration}s</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingDown className="h-4 w-4" />
                <span className="text-xs">Taux rebond</span>
              </div>
              <p className="text-xl md:text-2xl font-bold">{data.bounceRate}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs">Pages/visite</span>
              </div>
              <p className="text-xl md:text-2xl font-bold">{data.avgPageviewsPerVisit}</p>
            </CardContent>
          </Card>
        </div>

        {/* AI Recommendations Section */}
        <SiteRecommendations 
          analyticsData={{
            sessions: data.totalVisitors,
            pageViews: data.totalPageViews,
            clicks: 0,
            addToCart: 0,
            avgTimeOnPage: data.avgSessionDuration,
            avgScrollDepth: 0,
          }}
          salesData={{
            totalRevenue: salesData?.totalRevenue || 0,
            totalOrders: salesData?.totalOrders || 0,
            avgOrderValue: salesData?.avgOrderValue || 0,
          }}
          metaAdsData={metaAdsData}
        />

        {/* Charts */}
        <Tabs defaultValue="traffic" className="space-y-4">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="traffic" className="text-xs md:text-sm">📈 Trafic</TabsTrigger>
            <TabsTrigger value="sources" className="text-xs md:text-sm">🔗 Sources</TabsTrigger>
            <TabsTrigger value="sales" className="text-xs md:text-sm">💰 Ventes</TabsTrigger>
            <TabsTrigger value="meta" className="text-xs md:text-sm">📱 Meta Ads</TabsTrigger>
          </TabsList>

          {/* Traffic Tab */}
          <TabsContent value="traffic" className="space-y-6">
            {/* Daily Traffic Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Évolution du trafic</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.dailyTraffic}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="visitors" stackId="1" stroke="#0088FE" fill="#0088FE" fillOpacity={0.6} name="Visiteurs" />
                    <Area type="monotone" dataKey="pageviews" stackId="2" stroke="#00C49F" fill="#00C49F" fillOpacity={0.4} name="Pages vues" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Device Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Répartition par appareil
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={data.deviceBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {data.deviceBreakdown.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 mt-4">
                    {data.deviceBreakdown.map((device, index) => (
                      <div key={device.name} className="flex items-center gap-2">
                        {getDeviceIcon(device.name)}
                        <span className="text-sm">{device.name}: {device.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Countries */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Top Pays
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.countries.slice(0, 6).map((country, index) => (
                      <div key={country.country} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-muted-foreground w-6">#{index + 1}</span>
                          <span className="font-medium">{country.country}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary"
                              style={{ width: `${(country.visits / data.countries[0].visits) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12 text-right">{country.visits}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Pages */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Top Pages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={data.topPages.slice(0, 6)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="page" type="category" width={200} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="views" fill="#0088FE" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sources Tab */}
          <TabsContent value="sources" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Traffic Sources Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ExternalLink className="h-5 w-5" />
                    Sources de trafic
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={data.trafficSources}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ source, percent }) => `${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="visits"
                        nameKey="source"
                      >
                        {data.trafficSources.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Sources List */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Détail des sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.trafficSources.map((source, index) => (
                      <div key={source.source} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium truncate max-w-[180px]">{source.source}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold">{source.visits}</span>
                          <span className="text-xs text-muted-foreground ml-1">visites</span>
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
                <CardTitle className="text-lg">💡 Insights Sources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.trafficSources.length > 0 && data.trafficSources[0].source.includes('facebook') && (
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-sm font-medium text-blue-600">📱 Facebook domine votre trafic</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.round((data.trafficSources[0].visits / data.totalVisitors) * 100)}% de votre trafic vient de Facebook. Continuez à optimiser vos pubs Meta !
                    </p>
                  </div>
                )}
                {data.bounceRate > 75 && (
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <p className="text-sm font-medium text-yellow-600">⚠️ Taux de rebond élevé ({data.bounceRate}%)</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      La majorité des visiteurs quittent après une page. Améliorez votre hook et vos CTA.
                    </p>
                  </div>
                )}
                {data.avgSessionDuration > 60 && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-sm font-medium text-green-600">✅ Bon temps de session ({data.avgSessionDuration}s)</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Les visiteurs passent du temps sur votre site. Votre contenu engage !
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sales Tab */}
          <TabsContent value="sales" className="space-y-6">
            {/* Sales KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 text-green-600 mb-2">
                    <DollarSign className="h-5 w-5" />
                    <span className="text-sm font-medium">Revenu Total</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground">
                    ${(salesData?.totalRevenue || 0).toFixed(2)}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <Package className="h-5 w-5" />
                    <span className="text-sm font-medium">Commandes</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground">{salesData?.totalOrders || 0}</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 text-purple-600 mb-2">
                    <CreditCard className="h-5 w-5" />
                    <span className="text-sm font-medium">Panier Moyen</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground">
                    ${(salesData?.avgOrderValue || 0).toFixed(2)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {salesData?.recentOrders && salesData.recentOrders.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Revenu Journalier</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={salesData.dailyRevenue}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="revenue" fill="#00C49F" name="Revenu ($)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Top Produits</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {salesData.topProducts.length > 0 ? (
                        <div className="space-y-4">
                          {salesData.topProducts.map((product, index) => (
                            <div key={product.name} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                                <div>
                                  <p className="font-medium truncate max-w-[200px]">{product.name}</p>
                                  <p className="text-xs text-muted-foreground">{product.quantity} vendus</p>
                                </div>
                              </div>
                              <span className="font-bold text-green-600">${product.revenue.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground py-8">Aucun produit vendu</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Orders */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Commandes Récentes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {salesData.recentOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium">{order.order_number}</p>
                            <p className="text-xs text-muted-foreground">
                              {order.customer_data?.first_name || 'Client'} 
                              {order.customer_data?.city && ` • ${order.customer_data.city}`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">${order.total_price.toFixed(2)}</p>
                            <Badge 
                              variant={order.financial_status === 'paid' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {order.financial_status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Aucune commande reçue</h3>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto">
                    Configurez le webhook Shopify pour recevoir vos commandes automatiquement.
                    Allez dans Shopify Admin → Settings → Notifications → Webhooks.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Meta Ads Tab */}
          <TabsContent value="meta" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <MetaAdsImport 
                onDataImported={setMetaAdsData} 
                importedData={metaAdsData} 
              />

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📊 Analyse Meta Ads</CardTitle>
                </CardHeader>
                <CardContent>
                  {metaAdsData ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Coût/conversion:</span>
                            <span className="font-bold ml-2">
                              ${metaAdsData.conversions > 0 
                                ? (metaAdsData.spend / metaAdsData.conversions).toFixed(2) 
                                : "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Taux conv.:</span>
                            <span className="font-bold ml-2">
                              {metaAdsData.clicks > 0 
                                ? ((metaAdsData.conversions / metaAdsData.clicks) * 100).toFixed(2) 
                                : 0}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {metaAdsData.roas >= 2 ? (
                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                          <p className="text-sm text-green-600">
                            ✅ ROAS de {metaAdsData.roas}x - Vos campagnes sont rentables !
                          </p>
                        </div>
                      ) : (
                        <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                          <p className="text-sm text-yellow-600">
                            ⚠️ ROAS de {metaAdsData.roas}x - Optimisation recommandée
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Importez vos données Meta Ads</p>
                      <p className="text-xs mt-2">
                        Meta Business Suite → Rapports → Exporter CSV
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {metaAdsData?.campaigns && metaAdsData.campaigns.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance par campagne</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={metaAdsData.campaigns}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 10 }} 
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="spend" fill="#8884d8" name="Dépenses ($)" />
                      <Bar yAxisId="right" dataKey="conversions" fill="#82ca9d" name="Conversions" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Marketing ChatBot */}
      <MarketingChatBot analyticsContext={analyticsContext} />
    </div>
  );
};

export default AdminAnalytics;
