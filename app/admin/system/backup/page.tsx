"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface BackupFile {
  filename: string;
  size: number;
  created: string;
  modified: string;
}

interface BackupStats {
  totalUsers: number;
  totalEvents: number;
  totalCamels: number;
  totalResults: number;
  totalNews: number;
  totalAds: number;
  totalAnnouncements: number;
  totalActivities: number;
}

export default function BackupPage() {
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [includeTestData, setIncludeTestData] = useState(false);
  const [restoreMode, setRestoreMode] = useState("merge");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);

  const fetchBackups = async () => {
    try {
      const response = await fetch("/api/system/backup?action=list");
      const data = await response.json();
      setBackups(data.backups || []);
    } catch (error) {
      setError("فشل في تحميل قائمة النسخ الاحتياطية");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateBackup = async () => {
    setCreating(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/system/backup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "create", includeTestData }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`تم إنشاء النسخة الاحتياطية بنجاح: ${data.filename}`);
        await fetchBackups(); // Refresh the list
        setTimeout(() => setSuccess(""), 5000);
      } else {
        setError(data.error || "فشل في إنشاء النسخة الاحتياطية");
      }
    } catch (error) {
      setError("فشل في إنشاء النسخة الاحتياطية");
    } finally {
      setCreating(false);
    }
  };

  const handleDownloadBackup = async (filename: string) => {
    try {
      const response = await fetch(`/api/system/backup?action=download&filename=${filename}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError("فشل في تحميل النسخة الاحتياطية");
      }
    } catch (error) {
      setError("فشل في تحميل النسخة الاحتياطية");
    }
  };

  const handleRestoreBackup = async () => {
    if (!selectedFile) {
      setError("يرجى اختيار ملف النسخة الاحتياطية");
      return;
    }

    setRestoring(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append('backup', selectedFile);
      formData.append('mode', restoreMode);

      const response = await fetch("/api/system/backup", {
        method: "PUT",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`تم استعادة البيانات بنجاح. المستخدمون: ${data.stats.users}، الفعاليات: ${data.stats.events}`);
        setIsRestoreDialogOpen(false);
        setSelectedFile(null);
        setTimeout(() => setSuccess(""), 10000);
      } else {
        setError(data.error || "فشل في استعادة النسخة الاحتياطية");
      }
    } catch (error) {
      setError("فشل في استعادة النسخة الاحتياطية");
    } finally {
      setRestoring(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="flex flex-1 h-screen">
      <div className="p-2 md:p-5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
        <div className="flex flex-col gap-2 h-full">
          <div className="h-full w-full rounded-lg bg-gray-100 dark:bg-neutral-800 flex flex-col py-1 px-4">
            <div className="flex flex-row-reverse items-center justify-between">
              <h2 className="w-full flex justify-end text-3xl font-semibold my-2">
                : النسخ الاحتياطي والاستعادة
              </h2>
            </div>
            <div className="w-full h-full bg-gray-200 rounded-lg p-4 overflow-y-auto">
              {loading ? (
                <div className="text-center py-8">جاري التحميل...</div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Create Backup Panel */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-right">إنشاء نسخة احتياطية</CardTitle>
                      <CardDescription className="text-right">
                        إنشاء نسخة احتياطية شاملة من بيانات النظام
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="includeTestData"
                          checked={includeTestData}
                          onCheckedChange={setIncludeTestData}
                        />
                        <Label htmlFor="includeTestData">تضمين البيانات التجريبية</Label>
                      </div>
                      
                      <div className="text-sm text-gray-600 text-right">
                        <p>• سيتم حفظ جميع البيانات في ملف JSON</p>
                        <p>• يشمل: المستخدمين، الفعاليات، المطايا، النتائج، الأخبار</p>
                        <p>• يمكن استخدام النسخة لاستعادة البيانات لاحقاً</p>
                      </div>
                      
                      <Button
                        onClick={handleCreateBackup}
                        disabled={creating}
                        className="w-full"
                      >
                        {creating ? "جاري الإنشاء..." : "إنشاء نسخة احتياطية"}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Restore Backup Panel */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-right">استعادة نسخة احتياطية</CardTitle>
                      <CardDescription className="text-right">
                        استعادة البيانات من ملف نسخة احتياطية
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="restoreMode">وضع الاستعادة</Label>
                        <Select value={restoreMode} onValueChange={setRestoreMode}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="merge">دمج مع البيانات الحالية</SelectItem>
                            <SelectItem value="replace">استبدال البيانات الحالية</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="text-sm text-gray-600 text-right">
                        <p>• <strong>الدمج:</strong> يحافظ على البيانات الحالية ويضيف الجديدة</p>
                        <p>• <strong>الاستبدال:</strong> يحذف البيانات الحالية ويستبدلها</p>
                        <p className="text-red-600">⚠️ الاستبدال عملية لا يمكن التراجع عنها</p>
                      </div>
                      
                      <Dialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="w-full">
                            استعادة من ملف
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>استعادة نسخة احتياطية</DialogTitle>
                            <DialogDescription>
                              اختر ملف النسخة الاحتياطية لاستعادة البيانات
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="backupFile">ملف النسخة الاحتياطية</Label>
                              <input
                                id="backupFile"
                                type="file"
                                accept=".json"
                                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                className="w-full p-2 border rounded-md"
                              />
                            </div>
                            
                            {selectedFile && (
                              <div className="text-sm text-gray-600">
                                <p>الملف المختار: {selectedFile.name}</p>
                                <p>الحجم: {formatFileSize(selectedFile.size)}</p>
                              </div>
                            )}
                            
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                onClick={() => setIsRestoreDialogOpen(false)}
                              >
                                إلغاء
                              </Button>
                              <Button
                                onClick={handleRestoreBackup}
                                disabled={restoring || !selectedFile}
                              >
                                {restoring ? "جاري الاستعادة..." : "استعادة"}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>

                  {/* Backup Files List */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-right">النسخ الاحتياطية المتاحة</CardTitle>
                      <CardDescription className="text-right">
                        قائمة بجميع النسخ الاحتياطية المحفوظة
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {backups.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          لا توجد نسخ احتياطية متاحة
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {backups.map((backup, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDownloadBackup(backup.filename)}
                                >
                                  تحميل
                                </Button>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">{backup.filename}</div>
                                <div className="text-sm text-gray-500">
                                  الحجم: {formatFileSize(backup.size)} | 
                                  تاريخ الإنشاء: {new Date(backup.created).toLocaleString("ar-SA")}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Status Messages */}
                  {(error || success) && (
                    <Card className="lg:col-span-2">
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

