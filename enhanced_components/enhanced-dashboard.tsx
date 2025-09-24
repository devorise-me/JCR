"use client";
import { useState, useEffect } from "react";
import { CreateEventForm } from "../components/event/EventsForm";
import { FaPlus, FaUsers, FaCalendarAlt, FaUserShield, FaChartLine } from "react-icons/fa";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { RedirectButton } from "../components/auth/redirect-button";
import SearchBar from "../components/admin/SearchBar";
import { ShowUsers } from "../components/Tabels/users";
import { ShowEvents } from "../components/Tabels/show-events";
import ShowSupers from "../components/Tabels/getSuper";

interface DashboardProps {
  role: string;
}

const EnhancedAdminDashboard: React.FC<DashboardProps> = ({ role }) => {
  const [isEventFormOpen, setEventFormOpen] = useState(false);
  const [eventAdded, setEventAdded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [eventSearch, setEventSearch] = useState("");
  const [supervisorSearch, setSupervisorSearch] = useState("");

  useEffect(() => {
    if (isEventFormOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "auto";
      document.body.style.touchAction = "auto";
    }
  }, [isEventFormOpen]);

  const toggleEventForm = () => {
    setEventFormOpen((prev) => !prev);
  };

  const handleEventAdded = () => {
    setEventAdded(true);
    setEventFormOpen(false);
  };

  useEffect(() => {
    if (eventAdded) {
      setEventAdded(false);
    }
  }, [eventAdded]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 text-right">لوحة التحكم الإدارية</h1>
          <p className="text-blue-100 text-right">إدارة شاملة لنظام سباقات الهجن الأردنية</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-6 -mt-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-right">
                  <p className="text-green-100 text-sm">إجمالي المستخدمين</p>
                  <p className="text-2xl font-bold">150+</p>
                </div>
                <FaUsers className="text-3xl text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-right">
                  <p className="text-blue-100 text-sm">الفعاليات النشطة</p>
                  <p className="text-2xl font-bold">25</p>
                </div>
                <FaCalendarAlt className="text-3xl text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-right">
                  <p className="text-purple-100 text-sm">المشرفين</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <FaUserShield className="text-3xl text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-right">
                  <p className="text-orange-100 text-sm">معدل النشاط</p>
                  <p className="text-2xl font-bold">94%</p>
                </div>
                <FaChartLine className="text-3xl text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Users and Supervisors */}
          <div className="space-y-8">
            {/* Users Section */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
                <CardTitle className="text-right flex items-center justify-between">
                  <FaUsers className="text-xl" />
                  <span>إدارة المستخدمين</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                    <RedirectButton path="/auth/register">
                      <Button size="sm" className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md">
                        <FaPlus className="ml-2" /> إنشاء مستخدم جديد
                      </Button>
                    </RedirectButton>
                    <SearchBar 
                      value={searchTerm} 
                      onChange={setSearchTerm} 
                      placeholder="البحث في المستخدمين..." 
                      className="flex-1" 
                    />
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 h-80 overflow-hidden">
                    <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      <ShowUsers searchTerm={searchTerm} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Supervisors Section */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="text-right flex items-center justify-between">
                  <FaUserShield className="text-xl" />
                  <span>إدارة المشرفين</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  <SearchBar 
                    value={supervisorSearch} 
                    onChange={setSupervisorSearch} 
                    placeholder="البحث في المشرفين..." 
                    className="w-full" 
                  />
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 h-80 overflow-hidden">
                    <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      <ShowSupers searchTerm={supervisorSearch} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Events Section */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
              <CardTitle className="text-right flex items-center justify-between">
                <FaCalendarAlt className="text-xl" />
                <span>إدارة الفعاليات</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                  <Button 
                    onClick={toggleEventForm} 
                    size="sm" 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md"
                  >
                    <FaPlus className="ml-2" /> 
                    {isEventFormOpen ? "إغلاق النموذج" : "إضافة فعالية جديدة"}
                  </Button>
                  <SearchBar 
                    value={eventSearch} 
                    onChange={setEventSearch} 
                    placeholder="البحث في الفعاليات..." 
                    className="flex-1" 
                  />
                </div>
                
                {isEventFormOpen && (
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <CreateEventForm onClose={toggleEventForm} onEventAdded={handleEventAdded} />
                  </div>
                )}
                
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 h-96 overflow-hidden">
                  <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    <ShowEvents 
                      eventAdded={eventAdded} 
                      setEventAdded={setEventAdded} 
                      searchTerm={eventSearch} 
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAdminDashboard;

