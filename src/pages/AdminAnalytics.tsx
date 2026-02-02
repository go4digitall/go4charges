import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";
import { 
  Users, Eye, MousePointer, ShoppingCart, Clock, 
  Smartphone, Monitor, Tablet, TrendingUp, ArrowDown
} from "lucide-react";

interface AnalyticsData {
  totalSessions: number;
  totalPageViews: number;
  totalClicks: number;
  totalAddToCart: number;
  avgTimeOnPage: number;
  avgScrollDepth: number;
  deviceBreakdown: { name: string; value: number }[];
  hourlyTraffic: { hour: string; views: number }[];
  topPages: { page: string; views: number }[];
  scrollDepthDistribution: { depth: string; count: number }[];
  conversionFunnel: { step: string; count: number; rate: string }[];
  recentEvents: Array<{
    id: string;
    event_type: string;
    page_url: string;
    device_type: string;
    created_at: string;
    event_data: Record<string, unknown>;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AdminAnalytics = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'today' | '7days' | '30days'>('7days');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const getDateFilter = () => {
    const now = new Date();
    switch (dateRange) {
      case 'today':
        return new Date(now.setHours(0, 0, 0, 0)).toISOString();
      case '7days':
        return new Date(now.setDate(now.getDate() - 7)).toISOString();
      case '30days':
        return new Date(now.setDate(now.getDate() - 30)).toISOString();
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const startDate = getDateFilter();
      
      const { data: events, error } = await supabase
        .from('analytics_events')
        .select('*')
        .gte('created_at', startDate)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!events || events.length === 0) {
        setData({
          totalSessions: 0,
          totalPageViews: 0,
          totalClicks: 0,
          totalAddToCart: 0,
          avgTimeOnPage: 0,
          avgScrollDepth: 0,
          deviceBreakdown: [],
          hourlyTraffic: [],
          topPages: [],
          scrollDepthDistribution: [],
          conversionFunnel: [],
          recentEvents: [],
        });
        setLoading(false);
        return;
      }

      // Process data
      const sessions = new Set(events.map(e => e.session_id)).size;
      const pageViews = events.filter(e => e.event_type === 'page_view').length;
      const clicks = events.filter(e => e.event_type === 'click').length;
      const addToCart = events.filter(e => e.event_type === 'add_to_cart').length;
      
      // Average time on page
      const exitEvents = events.filter(e => e.event_type === 'page_exit');
      const avgTime = exitEvents.length > 0 
        ? exitEvents.reduce((acc, e) => {
            const data = e.event_data as Record<string, unknown>;
            return acc + (typeof data?.time_spent_seconds === 'number' ? data.time_spent_seconds : 0);
          }, 0) / exitEvents.length
        : 0;

      // Average scroll depth
      const avgScroll = exitEvents.length > 0
        ? exitEvents.reduce((acc, e) => {
            const data = e.event_data as Record<string, unknown>;
            return acc + (typeof data?.max_scroll_depth === 'number' ? data.max_scroll_depth : 0);
          }, 0) / exitEvents.length
        : 0;

      // Device breakdown
      const deviceCounts: Record<string, number> = {};
      events.forEach(e => {
        const device = e.device_type || 'unknown';
        deviceCounts[device] = (deviceCounts[device] || 0) + 1;
      });
      const deviceBreakdown = Object.entries(deviceCounts).map(([name, value]) => ({ name, value }));

      // Hourly traffic
      const hourlyCounts: Record<string, number> = {};
      events.filter(e => e.event_type === 'page_view').forEach(e => {
        const hour = new Date(e.created_at).getHours().toString().padStart(2, '0') + ':00';
        hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1;
      });
      const hourlyTraffic = Object.entries(hourlyCounts)
        .map(([hour, views]) => ({ hour, views }))
        .sort((a, b) => a.hour.localeCompare(b.hour));

      // Top pages
      const pageCounts: Record<string, number> = {};
      events.filter(e => e.event_type === 'page_view').forEach(e => {
        const page = e.page_url || '/';
        pageCounts[page] = (pageCounts[page] || 0) + 1;
      });
      const topPages = Object.entries(pageCounts)
        .map(([page, views]) => ({ page, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);

      // Scroll depth distribution
      const scrollEvents = events.filter(e => e.event_type === 'scroll_depth');
      const depthCounts: Record<string, number> = { '25%': 0, '50%': 0, '75%': 0, '90%': 0 };
      scrollEvents.forEach(e => {
        const data = e.event_data as Record<string, unknown>;
        const depth = data?.depth;
        if (typeof depth === 'number') {
          depthCounts[`${depth}%`] = (depthCounts[`${depth}%`] || 0) + 1;
        }
      });
      const scrollDepthDistribution = Object.entries(depthCounts).map(([depth, count]) => ({ depth, count }));

      // Conversion funnel
      const checkoutStarts = events.filter(e => e.event_type === 'checkout_start').length;
      const conversionFunnel = [
        { step: 'Page Views', count: pageViews, rate: '100%' },
        { step: 'Clicks', count: clicks, rate: pageViews > 0 ? `${Math.round((clicks / pageViews) * 100)}%` : '0%' },
        { step: 'Add to Cart', count: addToCart, rate: pageViews > 0 ? `${Math.round((addToCart / pageViews) * 100)}%` : '0%' },
        { step: 'Checkout', count: checkoutStarts, rate: pageViews > 0 ? `${Math.round((checkoutStarts / pageViews) * 100)}%` : '0%' },
      ];

      setData({
        totalSessions: sessions,
        totalPageViews: pageViews,
        totalClicks: clicks,
        totalAddToCart: addToCart,
        avgTimeOnPage: Math.round(avgTime),
        avgScrollDepth: Math.round(avgScroll),
        deviceBreakdown,
        hourlyTraffic,
        topPages,
        scrollDepthDistribution,
        conversionFunnel,
        recentEvents: events.slice(0, 20).map(e => ({
          id: e.id,
          event_type: e.event_type,
          page_url: e.page_url || '',
          device_type: e.device_type || '',
          created_at: e.created_at,
          event_data: e.event_data as Record<string, unknown>,
        })),
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
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

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'tablet': return <Tablet className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">📊 Analytics Dashboard</h1>
            <p className="text-muted-foreground">Analyse comportementale de vos visiteurs</p>
          </div>
          <div className="flex gap-2">
            {(['today', '7days', '30days'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dateRange === range 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {range === 'today' ? "Aujourd'hui" : range === '7days' ? '7 jours' : '30 jours'}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Users className="h-4 w-4" />
                <span className="text-xs">Sessions</span>
              </div>
              <p className="text-2xl font-bold">{data.totalSessions}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Eye className="h-4 w-4" />
                <span className="text-xs">Pages vues</span>
              </div>
              <p className="text-2xl font-bold">{data.totalPageViews}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <MousePointer className="h-4 w-4" />
                <span className="text-xs">Clics</span>
              </div>
              <p className="text-2xl font-bold">{data.totalClicks}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <ShoppingCart className="h-4 w-4" />
                <span className="text-xs">Add to Cart</span>
              </div>
              <p className="text-2xl font-bold">{data.totalAddToCart}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-xs">Temps moyen</span>
              </div>
              <p className="text-2xl font-bold">{data.avgTimeOnPage}s</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <ArrowDown className="h-4 w-4" />
                <span className="text-xs">Scroll moyen</span>
              </div>
              <p className="text-2xl font-bold">{data.avgScrollDepth}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="traffic" className="space-y-4">
          <TabsList>
            <TabsTrigger value="traffic">Trafic</TabsTrigger>
            <TabsTrigger value="behavior">Comportement</TabsTrigger>
            <TabsTrigger value="funnel">Funnel</TabsTrigger>
            <TabsTrigger value="events">Événements</TabsTrigger>
          </TabsList>

          <TabsContent value="traffic" className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Trafic par heure</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.hourlyTraffic}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="views" stroke="#0088FE" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Répartition par appareil</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.deviceBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
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
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Top Pages</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.topPages} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="page" type="category" width={150} />
                    <Tooltip />
                    <Bar dataKey="views" fill="#0088FE" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="behavior" className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Profondeur de scroll</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.scrollDepthDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="depth" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">💡 Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.avgScrollDepth < 50 && (
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <p className="text-sm font-medium text-yellow-600">⚠️ Scroll faible</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Seulement {data.avgScrollDepth}% des visiteurs scrollent en moyenne. 
                      Considérez déplacer le CTA plus haut.
                    </p>
                  </div>
                )}
                {data.avgTimeOnPage < 30 && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-sm font-medium text-red-600">🚨 Temps court</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Temps moyen de {data.avgTimeOnPage}s. Les visiteurs partent vite.
                      Améliorez le hook du hero.
                    </p>
                  </div>
                )}
                {data.totalAddToCart > 0 && data.totalPageViews > 0 && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-sm font-medium text-green-600">✅ Taux d'ajout panier</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.round((data.totalAddToCart / data.totalPageViews) * 100)}% des visiteurs ajoutent au panier.
                    </p>
                  </div>
                )}
                {data.avgScrollDepth >= 75 && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-sm font-medium text-green-600">🎯 Excellent engagement</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {data.avgScrollDepth}% de scroll moyen montre un fort intérêt.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="funnel">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Funnel de conversion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.conversionFunnel.map((step, index) => (
                    <div key={step.step} className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{step.step}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold">{step.count}</span>
                          <Badge variant={index === 0 ? "default" : "secondary"}>{step.rate}</Badge>
                        </div>
                      </div>
                      <div className="h-8 bg-muted rounded-lg overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-500"
                          style={{ 
                            width: data.conversionFunnel[0].count > 0 
                              ? `${(step.count / data.conversionFunnel[0].count) * 100}%` 
                              : '0%' 
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Événements récents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {data.recentEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getDeviceIcon(event.device_type)}
                        <div>
                          <Badge variant="outline" className="text-xs">
                            {event.event_type}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">{event.page_url}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.created_at).toLocaleString('fr-FR')}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminAnalytics;
