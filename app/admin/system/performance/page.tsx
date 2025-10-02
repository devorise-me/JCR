"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface PerformanceMetrics {
  database: {
    queryTime: number;
    status: string;
    recordCounts: {
      users: number;
      events: number;
      camels: number;
      results: number;
      news: number;
      ads: number;
      activities: number;
    };
  };
  system: {
    uptime: number;
    memoryUsage: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
    };
    nodeVersion: string;
    platform: string;
  };
  activity: {
    last24Hours: number;
    averagePerHour: number;
    lastActivity: string | null;
  };
  recommendations: Array<{
    type: string;
    severity: string;
    message: string;
  }>;
}

interface CacheStats {
  totalEntries: number;
  entries: Array<{
    key: string;
    size: number;
    age: number;
    ttl: number;
    expired: boolean;
  }>;
}

export default function PerformancePage() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchMetrics = async () => {
    try {
      const [metricsResponse, cacheResponse] = await Promise.all([
        fetch("/api/system/performance"),
        fetch("/api/system/cache?action=stats"),
      ]);

      const metricsData = await metricsResponse.json();
      const cacheData = await cacheResponse.json();

      setMetrics(metricsData);
      setCacheStats(cacheData);
    } catch (error) {
      setError("فشل في تحميل مقاييس الأداء");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleOptimization = async (action: string) => {
    setOptimizing(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/system/performance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        await fetchMetrics(); // Refresh metrics
        setTimeout(() => setSuccess(""), 5000);
      } else {
        setError(data.error || "فشل في تنفيذ العملية");
      }
    } catch (error) {
      setError("فشل في تنفيذ العملية");
    } finally {
      setOptimizing(false);
    }
  };

  const handleCacheAction = async (action: string, pattern?: string) => {
    try {
      const response = await fetch("/api/system/cache", {
        method: action === "clear_all" ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: action !== "clear_all" ? JSON.stringify({ action, pattern }) : undefined,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        await fetchMetrics(); // Refresh cache stats
        setTimeout(() => setSuccess(""), 5000);
      } else {
        setError(data.error || "فشل في تنفيذ عملية التخزين المؤقت");
      }
    } catch (error) {
      setError("فشل في تنفيذ عملية التخزين المؤقت");
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "good":
        return <Badge className="bg-green-500">جيد</Badge>;
      case "warning":
        return <Badge className="bg-yellow-500">تحذير</Badge>;
      case "critical":
        return <Badge variant="destructive">حرج</Badge>;
      default:
        return <Badge variant="secondary">غير معروف</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return <Badge variant="destructive">عالي</Badge>;
      case "medium":
        return <Badge className="bg-yellow-500">متوسط</Badge>;
      case "low":
        return <Badge variant="secondary">منخفض</Badge>;
      default:
        return <Badge variant="outline">عادي</Badge>;
    }
  };

  return (
    <div className="flex flex-1 h-screen">
      <div className="p-2 md:p-5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
        <div className="flex flex-col gap-2 h-full">
          <div className="h-full w-full rounded-lg bg-gray-100 dark:bg-neutral-800 flex flex-col py-1 px-4">
            <div className="flex flex-row-reverse items-center justify-between">
              <h2 className="w-full flex justify-end text-3xl font-semibold my-2">
                : مراقبة الأداء والتحسين
              </h2>
              <Button onClick={fetchMetrics} disabled={loading}>
                {loading ? "جاري التحديث..." : "تحديث"}
              </Button>
            </div>
            <div className="w-full h-full bg-gray-200 rounded-lg p-4 overflow-y-auto">
              {loading ? (
                <div className="text-center py-8">جاري التحميل...</div>
              ) : error ? (
                <div className="text-red-600 text-center py-8">{error}</div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Database Performance */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-right">أداء قاعدة البيانات</CardTitle>
                      <CardDescription className="text-right">
                        مقاييس أداء قاعدة البيانات والاستعلامات
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>حالة الأداء:</span>
                        {metrics && getStatusBadge(metrics.database.status)}
                      </div>
                      <div className="flex justify-between items-center">
                        <span>وقت الاستعلام:</span>
                        <span>{metrics?.database.queryTime}ms</span>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-right">عدد السجلات:</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>المستخدمون: {metrics?.database.recordCounts.users}</div>
                          <div>الفعاليات: {metrics?.database.recordCounts.events}</div>
                          <div>المطايا: {metrics?.database.recordCounts.camels}</div>
                          <div>النتائج: {metrics?.database.recordCounts.results}</div>
                          <div>الأخبار: {metrics?.database.recordCounts.news}</div>
                          <div>الإعلانات: {metrics?.database.recordCounts.ads}</div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleOptimization("optimize_database")}
                        disabled={optimizing}
                        className="w-full"
                        variant="outline"
                      >
                        {optimizing ? "جاري التحسين..." : "تحسين قاعدة البيانات"}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* System Resources */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-right">موارد النظام</CardTitle>
                      <CardDescription className="text-right">
                        استخدام الذاكرة ومعلومات النظام
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>وقت التشغيل:</span>
                        <span>{metrics && formatUptime(metrics.system.uptime)}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>استخدام الذاكرة:</span>
                          <span>
                            {metrics && formatBytes(metrics.system.memoryUsage.heapUsed)} / {metrics && formatBytes(metrics.system.memoryUsage.heapTotal)}
                          </span>
                        </div>
                        <Progress 
                          value={metrics ? (metrics.system.memoryUsage.heapUsed / metrics.system.memoryUsage.heapTotal) * 100 : 0} 
                          className="w-full"
                        />
                      </div>
                      <div className="text-sm text-gray-500">
                        <div>Node.js: {metrics?.system.nodeVersion}</div>
                        <div>المنصة: {metrics?.system.platform}</div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Activity Monitoring */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-right">مراقبة النشاط</CardTitle>
                      <CardDescription className="text-right">
                        نشاط النظام والمستخدمين
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>النشاط في 24 ساعة:</span>
                        <Badge variant="outline">{metrics?.activity.last24Hours}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>متوسط النشاط/ساعة:</span>
                        <span>{metrics?.activity.averagePerHour}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>آخر نشاط:</span>
                        <span className="text-sm">
                          {metrics?.activity.lastActivity 
                            ? new Date(metrics.activity.lastActivity).toLocaleString("ar-SA")
                            : "لا يوجد"
                          }
                        </span>
                      </div>
                      <div className="space-y-2">
                        <Button
                          onClick={() => handleOptimization("cleanup_old_activities")}
                          disabled={optimizing}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          تنظيف الأنشطة القديمة
                        </Button>
                        <Button
                          onClick={() => handleOptimization("cleanup_expired_events")}
                          disabled={optimizing}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          تنظيف الفعاليات المنتهية
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Cache Management */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-right">إدارة التخزين المؤقت</CardTitle>
                      <CardDescription className="text-right">
                        حالة وإدارة ذاكرة التخزين المؤقت
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>العناصر المخزنة:</span>
                        <Badge variant="outline">{cacheStats?.totalEntries || 0}</Badge>
                      </div>
                      <div className="space-y-2">
                        <Button
                          onClick={() => handleCacheAction("preload")}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          تحميل مسبق للبيانات
                        </Button>
                        <Button
                          onClick={() => handleCacheAction("cleanup")}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          تنظيف المنتهية الصلاحية
                        </Button>
                        <Button
                          onClick={() => handleCacheAction("clear_all")}
                          variant="destructive"
                          size="sm"
                          className="w-full"
                        >
                          مسح جميع التخزين المؤقت
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recommendations */}
                  {metrics?.recommendations && metrics.recommendations.length > 0 && (
                    <Card className="lg:col-span-2">
                      <CardHeader>
                        <CardTitle className="text-right">توصيات التحسين</CardTitle>
                        <CardDescription className="text-right">
                          اقتراحات لتحسين أداء النظام
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {metrics.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                              {getSeverityBadge(rec.severity)}
                              <div className="flex-1 text-right">
                                <div className="font-medium">{rec.type}</div>
                                <div className="text-sm text-gray-600">{rec.message}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Status Messages */}
                  {(error || success) && (
                    <Card className="lg:col-span-2">
                      <CardContent className="pt-6">
                        {error && (
                          <div className="text-red-600 text-center">{error}</div>
                        )}
                        {success && (
                          <div className="text-green-600 text-center">{success}</div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

