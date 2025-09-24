"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface Announcement {
  id: number;
  title: string;
  content: string;
  expiryDate: string | null;
  isVisible: boolean;
  attachmentUrl: string | null;
  createdAt: string;
  updatedAt: string;
  author: {
    FirstName: string;
    FamilyName: string;
    username: string;
  };
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    expiryDate: "",
    isVisible: true,
    attachmentUrl: "",
  });

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch("/api/announcements?includeHidden=true&includeExpired=true");
      const data = await response.json();
      setAnnouncements(data);
    } catch (error) {
      setError("فشل في تحميل الإعلانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem("authToken");
      const userId = localStorage.getItem("userId");
      
      if (!userId) {
        setError("يجب تسجيل الدخول أولاً");
        return;
      }

      const payload = {
        ...formData,
        authorId: userId,
        expiryDate: formData.expiryDate || null,
        attachmentUrl: formData.attachmentUrl || null,
      };

      const url = editingAnnouncement 
        ? `/api/announcements/${editingAnnouncement.id}`
        : "/api/announcements";
      
      const method = editingAnnouncement ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchAnnouncements();
        setIsCreateDialogOpen(false);
        setEditingAnnouncement(null);
        setFormData({
          title: "",
          content: "",
          expiryDate: "",
          isVisible: true,
          attachmentUrl: "",
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || "فشل في حفظ الإعلان");
      }
    } catch (error) {
      setError("فشل في حفظ الإعلان");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا الإعلان؟")) return;

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/announcements/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchAnnouncements();
      } else {
        setError("فشل في حذف الإعلان");
      }
    } catch (error) {
      setError("فشل في حذف الإعلان");
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      expiryDate: announcement.expiryDate ? announcement.expiryDate.split('T')[0] : "",
      isVisible: announcement.isVisible,
      attachmentUrl: announcement.attachmentUrl || "",
    });
    setIsCreateDialogOpen(true);
  };

  const isExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="flex flex-1 h-screen">
      <div className="p-2 md:p-5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
        <div className="flex flex-col gap-2 h-full">
          <div className="h-full w-full rounded-lg bg-gray-100 dark:bg-neutral-800 flex flex-col py-1 px-4">
            <div className="flex flex-row-reverse items-center justify-between">
              <h2 className="w-full flex justify-end text-3xl font-semibold my-2">
                : إدارة الإعلانات
              </h2>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => {
                      setEditingAnnouncement(null);
                      setFormData({
                        title: "",
                        content: "",
                        expiryDate: "",
                        isVisible: true,
                        attachmentUrl: "",
                      });
                    }}
                  >
                    إضافة إعلان جديد
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingAnnouncement ? "تعديل الإعلان" : "إضافة إعلان جديد"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="title">العنوان</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="content">المحتوى</Label>
                      <Textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        rows={6}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="expiryDate">تاريخ الانتهاء (اختياري)</Label>
                      <Input
                        id="expiryDate"
                        type="date"
                        value={formData.expiryDate}
                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="attachmentUrl">رابط المرفق (PDF/Word) - اختياري</Label>
                      <Input
                        id="attachmentUrl"
                        type="url"
                        value={formData.attachmentUrl}
                        onChange={(e) => setFormData({ ...formData, attachmentUrl: e.target.value })}
                        placeholder="https://example.com/document.pdf"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isVisible"
                        checked={formData.isVisible}
                        onCheckedChange={(checked) => setFormData({ ...formData, isVisible: checked })}
                      />
                      <Label htmlFor="isVisible">مرئي للجمهور</Label>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        إلغاء
                      </Button>
                      <Button type="submit">
                        {editingAnnouncement ? "تحديث" : "إنشاء"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="w-full h-full bg-gray-200 rounded-lg p-2 overflow-y-auto">
              {loading ? (
                <div className="text-center py-8">جاري التحميل...</div>
              ) : error ? (
                <div className="text-red-600 text-center py-8">{error}</div>
              ) : (
                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <div key={announcement.id} className="bg-white rounded-lg p-4 shadow">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex gap-2">
                          {!announcement.isVisible && (
                            <Badge variant="secondary">مخفي</Badge>
                          )}
                          {isExpired(announcement.expiryDate) && (
                            <Badge variant="destructive">منتهي الصلاحية</Badge>
                          )}
                          {announcement.attachmentUrl && (
                            <Badge variant="outline">يحتوي على مرفق</Badge>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-right">{announcement.title}</h3>
                      </div>
                      <p className="text-gray-600 mb-3 text-right">{announcement.content}</p>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(announcement)}
                          >
                            تعديل
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(announcement.id)}
                          >
                            حذف
                          </Button>
                        </div>
                        <div className="text-right">
                          <div>
                            بواسطة: {announcement.author.FirstName} {announcement.author.FamilyName}
                          </div>
                          <div>
                            تاريخ الإنشاء: {new Date(announcement.createdAt).toLocaleDateString("ar-SA")}
                          </div>
                          {announcement.expiryDate && (
                            <div>
                              ينتهي في: {new Date(announcement.expiryDate).toLocaleDateString("ar-SA")}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {announcements.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      لا توجد إعلانات حالياً
                    </div>
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

