"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AboutUs {
  id: number;
  content: string;
  isRTL: boolean;
  fontSize: string;
  textAlign: string;
  createdAt: string;
  updatedAt: string;
  author: {
    FirstName: string;
    FamilyName: string;
    username: string;
  };
}

export default function AboutUsPage() {
  const [aboutUs, setAboutUs] = useState<AboutUs | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    content: "",
    isRTL: true,
    fontSize: "medium",
    textAlign: "right",
  });

  const fetchAboutUs = async () => {
    try {
      const response = await fetch("/api/about-us");
      const data = await response.json();
      if (data && data.id) {
        setAboutUs(data);
        setFormData({
          content: data.content,
          isRTL: data.isRTL,
          fontSize: data.fontSize,
          textAlign: data.textAlign,
        });
      }
    } catch (error) {
      setError("فشل في تحميل محتوى صفحة من نحن");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAboutUs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    
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
      };

      const method = aboutUs ? "PUT" : "POST";

      const response = await fetch("/api/about-us", {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setAboutUs(data);
        setSuccess("تم حفظ المحتوى بنجاح");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "فشل في حفظ المحتوى");
      }
    } catch (error) {
      setError("فشل في حفظ المحتوى");
    } finally {
      setSaving(false);
    }
  };

  const previewStyle = {
    direction: formData.isRTL ? 'rtl' : 'ltr',
    textAlign: formData.textAlign as 'left' | 'right' | 'center' | 'justify',
    fontSize: formData.fontSize === 'small' ? '14px' : 
              formData.fontSize === 'large' ? '18px' : '16px',
  };

  return (
    <div className="flex flex-1 h-screen">
      <div className="p-2 md:p-5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
        <div className="flex flex-col gap-2 h-full">
          <div className="h-full w-full rounded-lg bg-gray-100 dark:bg-neutral-800 flex flex-col py-1 px-4">
            <div className="flex flex-row-reverse items-center justify-between">
              <h2 className="w-full flex justify-end text-3xl font-semibold my-2">
                : إدارة صفحة من نحن
              </h2>
            </div>
            <div className="w-full h-full bg-gray-200 rounded-lg p-4 overflow-y-auto">
              {loading ? (
                <div className="text-center py-8">جاري التحميل...</div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                  {/* Editor Panel */}
                  <div className="bg-white rounded-lg p-4 shadow">
                    <h3 className="text-lg font-semibold mb-4 text-right">تحرير المحتوى</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="content">محتوى الصفحة</Label>
                        <Textarea
                          id="content"
                          value={formData.content}
                          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                          rows={12}
                          placeholder="اكتب محتوى صفحة من نحن هنا..."
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="fontSize">حجم الخط</Label>
                          <Select
                            value={formData.fontSize}
                            onValueChange={(value) => setFormData({ ...formData, fontSize: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="small">صغير</SelectItem>
                              <SelectItem value="medium">متوسط</SelectItem>
                              <SelectItem value="large">كبير</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="textAlign">محاذاة النص</Label>
                          <Select
                            value={formData.textAlign}
                            onValueChange={(value) => setFormData({ ...formData, textAlign: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="right">يمين</SelectItem>
                              <SelectItem value="left">يسار</SelectItem>
                              <SelectItem value="center">وسط</SelectItem>
                              <SelectItem value="justify">ضبط</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="isRTL"
                            checked={formData.isRTL}
                            onCheckedChange={(checked) => setFormData({ ...formData, isRTL: checked })}
                          />
                          <Label htmlFor="isRTL">نص من اليمين لليسار</Label>
                        </div>
                      </div>
                      
                      {error && (
                        <div className="text-red-600 text-sm">{error}</div>
                      )}
                      
                      {success && (
                        <div className="text-green-600 text-sm">{success}</div>
                      )}
                      
                      <Button type="submit" disabled={saving} className="w-full">
                        {saving ? "جاري الحفظ..." : "حفظ المحتوى"}
                      </Button>
                    </form>
                    
                    {aboutUs && (
                      <div className="mt-4 pt-4 border-t text-sm text-gray-500 text-right">
                        <div>آخر تحديث: {new Date(aboutUs.updatedAt).toLocaleDateString("ar-SA")}</div>
                        <div>بواسطة: {aboutUs.author.FirstName} {aboutUs.author.FamilyName}</div>
                      </div>
                    )}
                  </div>
                  
                  {/* Preview Panel */}
                  <div className="bg-white rounded-lg p-4 shadow">
                    <h3 className="text-lg font-semibold mb-4 text-right">معاينة</h3>
                    <div className="border rounded-lg p-4 min-h-[400px] bg-gray-50">
                      {formData.content ? (
                        <div style={previewStyle} className="whitespace-pre-wrap">
                          {formData.content}
                        </div>
                      ) : (
                        <div className="text-gray-400 text-center">
                          اكتب المحتوى لرؤية المعاينة
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

