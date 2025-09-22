"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AdsConfig {
  apiKey: string | null;
  apiEndpoint: string | null;
  isEnabled: boolean;
  status: string;
}

interface SyncStatus {
  isConfigured: boolean;
  isEnabled: boolean;
  lastSync: string | null;
  externalAdsCount: number;
  status: string;
}

export default function AdsConfigPage() {
  const [config, setConfig] = useState<AdsConfig | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    apiKey: "",
    apiEndpoint: "",
    isEnabled: false,
  });

  const fetchConfig = async () => {
    try {
      const [configResponse, syncResponse] = await Promise.all([
        fetch("/api/ads/config"),
        fetch("/api/ads/sync"),
      ]);

      const configData = await configResponse.json();
      const syncData = await syncResponse.json();

      setConfig(configData);
      setSyncStatus(syncData);

      if (configData.status === "configured") {
        setFormData({
          apiKey: "",
          apiEndpoint: configData.apiEndpoint || "",
          isEnabled: configData.isEnabled,
        });
      }
    } catch (error) {
      setError("فشل في تحميل إعدادات API");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/ads/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setConfig(data.config);
        setSuccess(`تم حفظ الإعدادات بنجاح. ${data.test.message}`);
        setTimeout(() => setSuccess(""), 5000);
      } else {
        setError(data.error || "فشل في حفظ الإعدادات");
      }
    } catch (error) {
      setError("فشل في حفظ الإعدادات");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEnabled = async () => {
    try {
      const response = await fetch("/api/ads/config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isEnabled: !config?.isEnabled }),
      });

      const data = await response.json();

      if (response.ok) {
        setConfig(data.config);
        await fetchConfig(); // Refresh sync status
      } else {
        setError("فشل في تحديث حالة API");
      }
    } catch (error) {
      setError("فشل في تحديث حالة API");
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/ads/sync", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`تم مزامنة ${data.syncedCount} إعلان من أصل ${data.totalFetched}`);
        await fetchConfig(); // Refresh sync status
        setTimeout(() => setSuccess(""), 5000);
      } else {
        setError(data.error || "فشل في المزامنة");
      }
    } catch (error) {
      setError("فشل في المزامنة");
    } finally {
      setSyncing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "configured":
        return <Badge className="bg-green-500">مُكوّن</Badge>;
      case "not_configured":
        return <Badge variant="destructive">غير مُكوّن</Badge>;
      default:
        return <Badge variant="secondary">غير معروف</Badge>;
    }
  };

  return (
    <div className="flex flex-1 h-screen">
      <div className="p-2 md:p-5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
        <div className="flex flex-col gap-2 h-full">
          <div className="h-full w-full rounded-lg bg-gray-100 dark:bg-neutral-800 flex flex-col py-1 px-4">
            <div className="flex flex-row-reverse items-center justify-between">
              <h2 className="w-full flex justify-end text-3xl font-semibold my-2">
                : إعدادات API الإعلانات
              </h2>
            </div>
            <div className="w-full h-full bg-gray-200 rounded-lg p-4 overflow-y-auto">
              {loading ? (
                <div className="text-center py-8">جاري التحميل...</div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Configuration Panel */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-right">تكوين API</CardTitle>
                      <CardDescription className="text-right">
                        قم بإعداد مفتاح API ونقطة النهاية للإعلانات الخارجية
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSaveConfig} className="space-y-4">
                        <div>
                          <Label htmlFor="apiKey">مفتاح API</Label>
                          <Input
                            id="apiKey"
                            type="password"
                            value={formData.apiKey}
                            onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                            placeholder={config?.apiKey ? "***configured***" : "أدخل مفتاح API"}
                            required={!config?.apiKey}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="apiEndpoint">نقطة النهاية</Label>
                          <Input
                            id="apiEndpoint"
                            type="url"
                            value={formData.apiEndpoint}
                            onChange={(e) => setFormData({ ...formData, apiEndpoint: e.target.value })}
                            placeholder="https://api.example.com/ads"
                            required
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="isEnabled"
                            checked={formData.isEnabled}
                            onCheckedChange={(checked) => setFormData({ ...formData, isEnabled: checked })}
                          />
                          <Label htmlFor="isEnabled">تفعيل API</Label>
                        </div>
                        
                        {error && (
                          <div className="text-red-600 text-sm">{error}</div>
                        )}
                        
                        {success && (
                          <div className="text-green-600 text-sm">{success}</div>
                        )}
                        
                        <Button type="submit" disabled={saving} className="w-full">
                          {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>

                  {/* Status Panel */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-right">حالة API</CardTitle>
                      <CardDescription className="text-right">
                        معلومات حول حالة API والمزامنة
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>حالة التكوين:</span>
                        {config && getStatusBadge(config.status)}
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span>حالة التفعيل:</span>
                        <div className="flex items-center gap-2">
                          {config && (
                            <Switch
                              checked={config.isEnabled}
                              onCheckedChange={handleToggleEnabled}
                              disabled={config.status !== "configured"}
                            />
                          )}
                          <Badge variant={config?.isEnabled ? "default" : "secondary"}>
                            {config?.isEnabled ? "مُفعّل" : "مُعطّل"}
                          </Badge>
                        </div>
                      </div>
                      
                      {syncStatus && (
                        <>
                          <div className="flex justify-between items-center">
                            <span>آخر مزامنة:</span>
                            <span className="text-sm text-gray-500">
                              {syncStatus.lastSync 
                                ? new Date(syncStatus.lastSync).toLocaleString("ar-SA")
                                : "لم تتم المزامنة بعد"
                              }
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span>الإعلانات الخارجية:</span>
                            <Badge variant="outline">{syncStatus.externalAdsCount}</Badge>
                          </div>
                        </>
                      )}
                      
                      <Button
                        onClick={handleSync}
                        disabled={syncing || !config?.isEnabled}
                        className="w-full"
                        variant="outline"
                      >
                        {syncing ? "جاري المزامنة..." : "مزامنة الإعلانات"}
                      </Button>
                      
                      <div className="text-xs text-gray-500 text-right">
                        <p>• تأكد من صحة مفتاح API ونقطة النهاية</p>
                        <p>• المزامنة تجلب الإعلانات من المصدر الخارجي</p>
                        <p>• يمكن تشغيل المزامنة يدوياً أو تلقائياً</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

