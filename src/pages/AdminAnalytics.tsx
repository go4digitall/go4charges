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
  DollarSign, Package, CreditCard, Globe, ExternalLink, MapPin,
  ShoppingCart, MousePointerClick
} from "lucide-react";
import { MarketingChatBot } from "@/components/admin/MarketingChatBot";
import { MetaAdsImport, type MetaAdsData } from "@/components/admin/MetaAdsImport";
import { MetaAdsAnalysis } from "@/components/admin/MetaAdsAnalysis";
import { SiteRecommendations } from "@/components/admin/SiteRecommendations";

interface LovableAnalyticsData {
  totalVisitors: number;
  totalPageViews: number;
  avgSessionDuration: number;
  bounceRate: number;
  avgPageviewsPerVisit: number;
  addToCartCount: number;
  checkoutStartCount: number;
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
  totalCablesSold: number;
  usbcCablesSold: number;
  lightningCablesSold: number;
  totalChargersSold: number;
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
    addToCart: data?.addToCartCount || 0,
    checkoutStarts: data?.checkoutStartCount || 0,
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
      // Fetch historical daily analytics data
      const { data: dailyData, error: dailyError } = await supabase
        .from('lovable_analytics_daily')
        .select('*')
        .order('date', { ascending: true });

      // Fetch real-time analytics events to supplement historical data (limited to page_view/scroll for traffic)
      const { data: realtimeEvents, error: realtimeError } = await supabase
        .from('analytics_events')
        .select('*')
        .in('event_type', ['page_view', 'scroll_depth'])
        .order('created_at', { ascending: false });

      // Fetch funnel counts separately with exact counts (avoids 1000-row limit)
      const { count: addToCartTotal, error: atcError } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'add_to_cart');

      const { count: checkoutTotal, error: csError } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'checkout_start');

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

      if (dailyError || sourcesError || devicesError || countriesError || pagesError || realtimeError || atcError || csError) {
        console.error('Error fetching analytics:', { dailyError, sourcesError, devicesError, countriesError, pagesError, realtimeError, atcError, csError });
        throw new Error('Failed to fetch analytics data');
      }

      // Use exact counts from dedicated queries
      const addToCartCount = addToCartTotal || 0;
      const checkoutStartCount = checkoutTotal || 0;

      // Get the last date from historical data
      const lastHistoricalDate = dailyData && dailyData.length > 0 
        ? new Date(dailyData[dailyData.length - 1].date) 
        : new Date('2026-01-01');

      // Process real-time events to get daily counts for dates AFTER historical data
      const realtimeDailyMap: Record<string, { visitors: Set<string>; pageviews: number }> = {};
      const realtimeDeviceMap: Record<string, number> = {};
      const realtimePageMap: Record<string, number> = {};
      
      realtimeEvents?.forEach(event => {
        const eventDate = new Date(event.created_at);
        const dateKey = eventDate.toISOString().split('T')[0];
        
        if (eventDate > lastHistoricalDate) {
          if (!realtimeDailyMap[dateKey]) {
            realtimeDailyMap[dateKey] = { visitors: new Set(), pageviews: 0 };
          }
          
          if (event.event_type === 'page_view') {
            realtimeDailyMap[dateKey].visitors.add(event.session_id);
            realtimeDailyMap[dateKey].pageviews += 1;
          }
          
          if (event.device_type) {
            realtimeDeviceMap[event.device_type] = (realtimeDeviceMap[event.device_type] || 0) + 1;
          }
          
          if (event.page_url && event.event_type === 'page_view') {
            realtimePageMap[event.page_url] = (realtimePageMap[event.page_url] || 0) + 1;
          }
        }
      });

      // Convert real-time daily map to array format
      const realtimeDailyData = Object.entries(realtimeDailyMap)
        .map(([date, data]) => ({
          date,
          visitors: data.visitors.size,
          pageviews: data.pageviews,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Combine historical and real-time daily traffic
      const historicalTraffic = dailyData?.map(d => ({
        date: new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        rawDate: d.date,
        visitors: d.visitors || 0,
        pageviews: d.pageviews || 0,
      })) || [];

      const realtimeTraffic = realtimeDailyData.map(d => ({
        date: new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        rawDate: d.date,
        visitors: d.visitors,
        pageviews: d.pageviews,
      }));

      const combinedTraffic = [...historicalTraffic, ...realtimeTraffic];

      // Calculate totals from both historical and real-time
      const historicalVisitors = dailyData?.reduce((sum, d) => sum + (d.visitors || 0), 0) || 0;
      const historicalPageViews = dailyData?.reduce((sum, d) => sum + (d.pageviews || 0), 0) || 0;
      const realtimeVisitors = realtimeDailyData.reduce((sum, d) => sum + d.visitors, 0);
      const realtimePageViews = realtimeDailyData.reduce((sum, d) => sum + d.pageviews, 0);

      const totalVisitors = historicalVisitors + realtimeVisitors;
      const totalPageViews = historicalPageViews + realtimePageViews;

      const avgSessionDuration = dailyData && dailyData.length > 0
        ? dailyData.reduce((sum, d) => sum + (parseFloat(String(d.session_duration_seconds)) || 0), 0) / dailyData.length
        : 0;
      const bounceRate = dailyData && dailyData.length > 0
        ? dailyData.reduce((sum, d) => sum + (d.bounce_rate || 0), 0) / dailyData.length
        : 0;
      const avgPageviewsPerVisit = dailyData && dailyData.length > 0
        ? dailyData.reduce((sum, d) => sum + (parseFloat(String(d.pageviews_per_visit)) || 0), 0) / dailyData.length
        : 0;

      // Combine device breakdown (historical + real-time)
      const combinedDevices: Record<string, number> = {};
      devicesData?.forEach(d => {
        combinedDevices[d.device_type] = (combinedDevices[d.device_type] || 0) + d.visits;
      });
      Object.entries(realtimeDeviceMap).forEach(([device, count]) => {
        combinedDevices[device] = (combinedDevices[device] || 0) + count;
      });

      // Combine page views (historical + real-time)
      const combinedPages: Record<string, number> = {};
      pagesData?.forEach(p => {
        combinedPages[p.page_path] = (combinedPages[p.page_path] || 0) + p.views;
      });
      Object.entries(realtimePageMap).forEach(([page, count]) => {
        combinedPages[page] = (combinedPages[page] || 0) + count;
      });

      setData({
        totalVisitors,
        totalPageViews,
        avgSessionDuration: Math.round(avgSessionDuration),
        bounceRate: Math.round(bounceRate),
        avgPageviewsPerVisit: parseFloat(avgPageviewsPerVisit.toFixed(2)),
        addToCartCount,
        checkoutStartCount,
        dailyTraffic: combinedTraffic.map(d => ({
          date: d.date,
          visitors: d.visitors,
          pageviews: d.pageviews,
        })),
        deviceBreakdown: Object.entries(combinedDevices).map(([name, value]) => ({
          name,
          value,
        })),
        topPages: Object.entries(combinedPages)
          .map(([page, views]) => ({ page, views }))
          .sort((a, b) => b.views - a.views)
          .slice(0, 10),
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
          totalCablesSold: 0,
          usbcCablesSold: 0,
          lightningCablesSold: 0,
          totalChargersSold: 0,
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

      // Daily revenue - use ISO date as key for proper sorting
      const dailyMap: Record<string, { revenue: number; orders: number; rawDate: string }> = {};
      orders.forEach(o => {
        const orderDate = new Date(o.processed_at || o.created_at);
        const rawDate = orderDate.toISOString().split('T')[0]; // YYYY-MM-DD for sorting
        const displayDate = orderDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
        if (!dailyMap[rawDate]) dailyMap[rawDate] = { revenue: 0, orders: 0, rawDate };
        dailyMap[rawDate].revenue += parseFloat(String(o.total_price)) || 0;
        dailyMap[rawDate].orders += 1;
      });
      const dailyRevenue = Object.entries(dailyMap)
        .sort(([a], [b]) => a.localeCompare(b)) // Sort by ISO date ascending
        .map(([rawDate, data]) => ({ 
          date: new Date(rawDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
          rawDate,
          revenue: data.revenue, 
          orders: data.orders 
        }));

      // Top products + count cables & chargers
      const productMap: Record<string, { quantity: number; revenue: number }> = {};
      let totalCablesSold = 0;
      let usbcCablesSold = 0;
      let lightningCablesSold = 0;
      let totalChargersSold = 0;

      orders.forEach(o => {
        const lineItems = o.line_items as Array<{ title: string; quantity: number; price: string }> || [];
        lineItems.forEach(item => {
          const name = item.title || 'Unknown';
          const qty = item.quantity || 1;
          if (!productMap[name]) productMap[name] = { quantity: 0, revenue: 0 };
          productMap[name].quantity += qty;
          productMap[name].revenue += (parseFloat(item.price) || 0) * qty;

          const titleLower = name.toLowerCase();
          const isLightning = titleLower.includes('lightning');
          
          if (titleLower.includes('wall charger') || titleLower.includes('chargeur')) {
            totalChargersSold += qty;
          } else if (titleLower.includes('family') || titleLower.includes('famille')) {
            const units = 3 * qty;
            totalCablesSold += units;
            if (isLightning) lightningCablesSold += units; else usbcCablesSold += units;
          } else if (titleLower.includes('duo')) {
            const units = 2 * qty;
            totalCablesSold += units;
            if (isLightning) lightningCablesSold += units; else usbcCablesSold += units;
          } else if (titleLower.includes('chargestand')) {
            totalCablesSold += qty;
            if (isLightning) lightningCablesSold += qty; else usbcCablesSold += qty;
          }
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
        totalCablesSold,
        usbcCablesSold,
        lightningCablesSold,
        totalChargersSold,
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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-4">
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
          <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-1">
                <ShoppingCart className="h-4 w-4" />
                <span className="text-xs">Ajouts panier</span>
              </div>
              <p className="text-xl md:text-2xl font-bold text-amber-700 dark:text-amber-300">{data.addToCartCount}</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                <MousePointerClick className="h-4 w-4" />
                <span className="text-xs">Checkout</span>
              </div>
              <p className="text-xl md:text-2xl font-bold text-blue-700 dark:text-blue-300">{data.checkoutStartCount}</p>
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
            clicks: data.checkoutStartCount,
            addToCart: data.addToCartCount,
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
        <Tabs defaultValue="traffic" className="space-y-6">
          <TabsList className="w-full grid grid-cols-4 h-14 p-1.5 bg-muted/80 border border-border rounded-xl shadow-sm">
            <TabsTrigger 
              value="traffic" 
              className="text-sm md:text-base font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg transition-all"
            >
              📈 Trafic
            </TabsTrigger>
            <TabsTrigger 
              value="sources" 
              className="text-sm md:text-base font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg transition-all"
            >
              🔗 Sources
            </TabsTrigger>
            <TabsTrigger 
              value="sales" 
              className="text-sm md:text-base font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg transition-all"
            >
              💰 Ventes
            </TabsTrigger>
            <TabsTrigger 
              value="meta" 
              className="text-sm md:text-base font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg transition-all"
            >
              📱 Meta Ads
            </TabsTrigger>
          </TabsList>

          {/* Traffic Tab */}
          <TabsContent value="traffic" className="space-y-6">
            {/* Daily Traffic Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Évolution du trafic (par jour)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Total période: <span className="font-semibold text-foreground">{data.totalVisitors.toLocaleString()} visiteurs</span> • <span className="font-semibold text-foreground">{data.totalPageViews.toLocaleString()} pages vues</span>
                </p>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.dailyTraffic}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(value) => value.toLocaleString()} />
                    <Tooltip 
                      formatter={(value: number, name: string) => [value.toLocaleString(), name]}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
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
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={data.trafficSources.slice(0, 5)}
                        cx="50%"
                        cy="45%"
                        labelLine={false}
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="visits"
                        nameKey="source"
                      >
                        {data.trafficSources.slice(0, 5).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`${value} visites`, 'Visites']} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Légende custom sans chevauchement */}
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {data.trafficSources.slice(0, 5).map((source, index) => (
                      <div key={source.source} className="flex items-center gap-1.5 text-xs">
                        <div 
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="truncate max-w-[80px]" title={source.source}>
                          {source.source.length > 12 ? source.source.slice(0, 12) + '...' : source.source}
                        </span>
                      </div>
                    ))}
                  </div>
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center gap-2 text-green-600 mb-2">
                    <DollarSign className="h-5 w-5" />
                    <span className="text-sm font-medium">Revenu Total</span>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-foreground">
                    ${(salesData?.totalRevenue || 0).toFixed(2)}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <Package className="h-5 w-5" />
                    <span className="text-sm font-medium">Commandes</span>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-foreground">{salesData?.totalOrders || 0}</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center gap-2 text-purple-600 mb-2">
                    <CreditCard className="h-5 w-5" />
                    <span className="text-sm font-medium">Panier Moyen</span>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-foreground">
                    ${(salesData?.avgOrderValue || 0).toFixed(2)}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center gap-2 text-amber-600 mb-2">
                    <span className="text-lg">🔌</span>
                    <span className="text-sm font-medium">Câbles USB-C</span>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-foreground">{salesData?.usbcCablesSold || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">240W • unités vendues</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center gap-2 text-orange-600 mb-2">
                    <span className="text-lg">🍎</span>
                    <span className="text-sm font-medium">Câbles Lightning</span>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-foreground">{salesData?.lightningCablesSold || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">30W • unités vendues</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-teal-500/10 to-teal-600/5 border-teal-500/20">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center gap-2 text-teal-600 mb-2">
                    <span className="text-lg">⚡</span>
                    <span className="text-sm font-medium">Chargeurs vendus</span>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-foreground">{salesData?.totalChargersSold || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">Wall Charger 240W</p>
                </CardContent>
              </Card>
            </div>

            {salesData?.recentOrders && salesData.recentOrders.length > 0 ? (
              <>
                <div className="space-y-6">
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        Évolution des Ventes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={salesData.dailyRevenue}>
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#00C49F" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#00C49F" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                          <YAxis yAxisId="left" orientation="left" stroke="#00C49F" />
                          <YAxis yAxisId="right" orientation="right" stroke="#0088FE" />
                          <Tooltip 
                            formatter={(value: number, name: string) => [
                              name === 'revenue' ? `$${value.toFixed(2)}` : value,
                              name === 'revenue' ? 'Revenu' : 'Commandes'
                            ]}
                          />
                          <Legend />
                          <Area 
                            yAxisId="left"
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#00C49F" 
                            fill="url(#colorRevenue)" 
                            name="Revenu ($)"
                          />
                          <Line 
                            yAxisId="right"
                            type="monotone" 
                            dataKey="orders" 
                            stroke="#0088FE" 
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            name="Commandes"
                          />
                        </AreaChart>
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
              <Card className="border-2 border-dashed border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 to-orange-500/5">
                <CardContent className="py-8 text-center">
                  <Package className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
                  <h3 className="text-lg font-medium mb-2">⚙️ Configuration requise</h3>
                  <p className="text-muted-foreground text-sm max-w-lg mx-auto mb-4">
                    Pour recevoir automatiquement vos commandes Shopify, vous devez configurer un webhook dans votre boutique.
                  </p>
                  
                  <div className="bg-muted rounded-lg p-4 text-left max-w-xl mx-auto space-y-3 text-sm">
                    <p className="font-semibold text-foreground">📋 Instructions :</p>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                      <li>Ouvrez <a href="https://admin.shopify.com/store/gu1ybs-es/settings/notifications/webhooks" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">Shopify Admin → Notifications → Webhooks</a></li>
                      <li>Cliquez sur "Create webhook"</li>
                      <li>Sélectionnez l'événement: <code className="bg-background px-1.5 py-0.5 rounded text-xs">Order creation</code></li>
                      <li>Format: <code className="bg-background px-1.5 py-0.5 rounded text-xs">JSON</code></li>
                      <li>URL du webhook:</li>
                    </ol>
                    <div className="mt-2">
                      <code className="block bg-background p-2 rounded text-xs break-all border select-all">
                        {import.meta.env.VITE_SUPABASE_URL}/functions/v1/shopify-webhook
                      </code>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      💡 Les futures commandes apparaîtront automatiquement ici !
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Meta Ads Tab */}
          <TabsContent value="meta" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <MetaAdsImport 
                  onDataImported={setMetaAdsData} 
                  importedData={metaAdsData} 
                />
                
                {/* Quick Stats Card */}
                {metaAdsData && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">📊 Métriques clés</CardTitle>
                    </CardHeader>
                    <CardContent>
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
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Analysis & Recommendations */}
              <MetaAdsAnalysis 
                currentData={metaAdsData} 
                onHistorySelect={setMetaAdsData}
              />
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
