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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface HealthStatus {
  status: string;
  timestamp: string;
  uptime: number;
  database: {
    status: string;
    responseTime: number;
  };
  performance: {
    responseTime: number;
  };
  statistics: {
    users: { total: number; active: number; admins: number };
    events: { total: number; active: number; upcoming: number };
    camels: { total: number; active: number };
    results: { total: number };
    news: { total: number; published: number };
    ads: { total: number; active: number };
  };
  issues: string[];
  version: string;
}

interface MaintenanceRecommendation {
  action: string;
  priority: string;
  description: string;
}

export default function SystemDashboard() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [recommendations, setRecommendations] = useState<MaintenanceRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [performing, setPerforming] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchHealthStatus = async () => {
    try {
      const response = await fetch("/api/system/health");
      const data = await response.json();
      setHealth(data);
    } catch (error) {
      setError("فشل في تحميل حالة النظام");
    }
  };

  const fetchMaintenanceRecommendations = async () => {
    try {
      const response = await fetch("/api/system/maintenance");
      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (error) {
      setError("فشل في تحميل توصيات الصيانة");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthStatus();
    fetchMaintenanceRecommendations();

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchHealthStatus();
      fetchMaintenanceRecommendations();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const performMaintenance = async (action: string) => {
    setPerforming(action);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/system/maintenance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action, confirm: true }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        await fetchHealthStatus();
        await fetchMaintenanceRecommendations();
        setTimeout(() => setSuccess(""), 5000);
      } else {
        setError(data.error || "فشل في تنفيذ عملية الصيانة");
      }
    } catch (error) {
      setError("فشل في تنفيذ عملية الصيانة");
    } finally {
      setPerforming(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'unhealthy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}د ${hours}س ${minutes}ق`;
  };

  if (loading) {
    return (
      <div className="flex flex-1 h-screen">
        <div className="p-2 md:p-5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
          <div className="text-center py-8">جاري التحميل...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 h-screen">
      <div className="p-2 md:p-5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
        <div className="flex flex-col gap-2 h-full">
          <div className="h-full w-full rounded-lg bg-gray-100 dark:bg-neutral-800 flex flex-col py-1 px-4">
            <div className="flex flex-row-reverse items-center justify-between">
              <h2 className="w-full flex justify-end text-3xl font-semibold my-2">
                : لوحة مراقبة النظام
              </h2>
            </div>
            <div className="w-full h-full bg-gray-200 rounded-lg p-4 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                
                {/* System Health Status */}
                <Card className="lg:col-span-2 xl:col-span-3">
                  <CardHeader>
                    <CardTitle className="text-right flex items-center gap-2">
                      حالة النظام
                      {health && (
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(health.status)}`}></div>
                      )}
                    </CardTitle>
                    <CardDescription className="text-right">
                      مراقبة حالة النظام والأداء
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {health ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{health.status === 'healthy' ? 'سليم' : health.status === 'warning' ? 'تحذير' : 'خطأ'}</div>
                          <div className="text-sm text-gray-500">حالة النظام</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{formatUptime(health.uptime)}</div>
                          <div className="text-sm text-gray-500">وقت التشغيل</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{health.database.responseTime}ms</div>
                          <div className="text-sm text-gray-500">استجابة قاعدة البيانات</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{health.performance.responseTime}ms</div>
                          <div className="text-sm text-gray-500">استجابة النظام</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500">لا توجد بيانات متاحة</div>
                    )}
                  </CardContent>
                </Card>

                {/* System Statistics */}
                {health && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-right">المستخدمون</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>{health.statistics.users.total}</span>
                            <span>المجموع</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{health.statistics.users.active}</span>
                            <span>نشط</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{health.statistics.users.admins}</span>
                            <span>مدير</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-right">الفعاليات</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>{health.statistics.events.total}</span>
                            <span>المجموع</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{health.statistics.events.active}</span>
                            <span>نشطة</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{health.statistics.events.upcoming}</span>
                            <span>قادمة</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-right">المطايا</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>{health.statistics.camels.total}</span>
                            <span>المجموع</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{health.statistics.camels.active}</span>
                            <span>نشطة</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{health.statistics.results.total}</span>
                            <span>النتائج</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Issues and Alerts */}
                {health && health.issues.length > 0 && (
                  <Card className="lg:col-span-2 xl:col-span-3">
                    <CardHeader>
                      <CardTitle className="text-right text-red-600">تنبيهات النظام</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {health.issues.map((issue, index) => (
                          <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg text-right">
                            {issue}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Maintenance Recommendations */}
                {recommendations.length > 0 && (
                  <Card className="lg:col-span-2 xl:col-span-3">
                    <CardHeader>
                      <CardTitle className="text-right">توصيات الصيانة</CardTitle>
                      <CardDescription className="text-right">
                        عمليات الصيانة المقترحة لتحسين أداء النظام
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {recommendations.map((rec, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex gap-2">
                              <Badge variant={getPriorityColor(rec.priority)}>
                                {rec.priority === 'high' ? 'عالي' : rec.priority === 'medium' ? 'متوسط' : 'منخفض'}
                              </Badge>
                              <Button
                                size="sm"
                                onClick={() => performMaintenance(rec.action)}
                                disabled={performing === rec.action}
                              >
                                {performing === rec.action ? "جاري التنفيذ..." : "تنفيذ"}
                              </Button>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{rec.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Manual Maintenance Actions */}
                <Card className="lg:col-span-2 xl:col-span-3">
                  <CardHeader>
                    <CardTitle className="text-right">عمليات الصيانة اليدوية</CardTitle>
                    <CardDescription className="text-right">
                      تنفيذ عمليات الصيانة والتحسين يدوياً
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      <Button
                        variant="outline"
                        onClick={() => performMaintenance('optimize_database')}
                        disabled={performing === 'optimize_database'}
                      >
                        {performing === 'optimize_database' ? "جاري التنفيذ..." : "تحسين قاعدة البيانات"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => performMaintenance('update_event_status')}
                        disabled={performing === 'update_event_status'}
                      >
                        {performing === 'update_event_status' ? "جاري التنفيذ..." : "تحديث حالة الفعاليات"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => performMaintenance('sync_participant_numbers')}
                        disabled={performing === 'sync_participant_numbers'}
                      >
                        {performing === 'sync_participant_numbers' ? "جاري التنفيذ..." : "مزامنة أرقام المشاركين"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => performMaintenance('validate_data_integrity')}
                        disabled={performing === 'validate_data_integrity'}
                      >
                        {performing === 'validate_data_integrity' ? "جاري التنفيذ..." : "فحص سلامة البيانات"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => performMaintenance('refresh_cache')}
                        disabled={performing === 'refresh_cache'}
                      >
                        {performing === 'refresh_cache' ? "جاري التنفيذ..." : "تحديث الذاكرة المؤقتة"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Status Messages */}
                {(error || success) && (
                  <Card className="lg:col-span-2 xl:col-span-3">
                    <CardContent className="pt-6">
                      {error && (
                        <div className="text-red-600 text-center p-3 bg-red-50 rounded-lg">
                          {error}
                        </div>
                      )}
                      {success && (
                        <div className="text-green-600 text-center p-3 bg-green-50 rounded-lg">
                          {success}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

