"use client";
import { useState, useEffect } from "react";
import { CreateEventForm } from "../event/EventsForm";
import { FaPlus } from "react-icons/fa";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { RedirectButton } from "../auth/redirect-button";
import SearchBar from "./SearchBar";
import { ShowUsers } from "../Tabels/users";
import { ShowEvents } from "../Tabels/show-events";
import ShowSupers from "../Tabels/getSuper";

interface DashboardProps {
  role: string;
}

const AdminDashboard: React.FC<DashboardProps> = ({ role }) => {
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
    <div className="flex flex-1 w-full">
      <div className="p-2 sm:p-4 md:p-5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 w-full">
          {/* Left Column - Users and Supervisors */}
          <div className="flex flex-col gap-2">
            {/* Users Section */}
            <Card className="h-full w-full">
              <CardHeader />
              <CardContent>
                <div className="flex flex-col gap-4 w-full">
                  <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center w-full">
                    <RedirectButton path="/auth/register">
                      <Button size="sm" variant="default" className="w-full sm:w-auto">
                        <FaPlus /> انشاء مستخدم
                      </Button>
                    </RedirectButton>
                    <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="ابحث عن المستخدمين..." className="w-full" />
                  </div>
                  <div className="h-[20rem] w-full rounded-lg bg-gray-100 dark:bg-neutral-800 flex flex-col items-end py-1 px-2 sm:px-4 mt-2">
                    <h2 className="w-full flex justify-end text-lg font-semibold my-2">المستخدمين</h2>
                    <div className="w-full h-full bg-gray-200 rounded-lg p-2 overflow-y-scroll">
                      <ShowUsers searchTerm={searchTerm} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Supervisors Section */}
            <Card className="h-full w-full">
              <CardHeader />
              <CardContent>
                <div className="flex flex-col gap-4 w-full">
                  <SearchBar value={supervisorSearch} onChange={setSupervisorSearch} placeholder="ابحث عن المشرفين..." className="w-full" />
                  <div className="h-[20rem] w-full rounded-lg bg-gray-100 dark:bg-neutral-800 flex flex-col items-end py-1 px-2 sm:px-4">
                    <h2 className="w-full flex justify-end text-lg font-semibold my-2">المشرفين</h2>
                    <div className="w-full h-full bg-gray-200 rounded-lg p-2 overflow-y-scroll">
                      <ShowSupers searchTerm={supervisorSearch} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Events Section */}
          <Card className="h-full w-full">
            <CardHeader />
            <CardContent>
              <div className="flex flex-col gap-4 w-full">
                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center w-full">
                  <Button onClick={toggleEventForm} size="sm" variant="default" className="w-full sm:w-auto">
                    <FaPlus /> {isEventFormOpen ? "إغلاق" : "إضافة فعالية"}
                  </Button>
                  <SearchBar value={eventSearch} onChange={setEventSearch} placeholder="ابحث عن الفعاليات..." className="w-full" />
                </div>
                {isEventFormOpen && (
                  <div className="my-2">
                    <CreateEventForm onClose={toggleEventForm} onEventAdded={handleEventAdded} />
                  </div>
                )}
                <div className="h-[42rem] w-full rounded-lg bg-gray-100 dark:bg-neutral-800 flex flex-col items-end py-1 px-2 sm:px-4 mt-2">
                  <h2 className="w-full flex justify-end text-lg font-semibold my-2">الفعاليات</h2>
                  <div className="w-full h-full bg-gray-200 rounded-lg  overflow-y-scroll">
                    <ShowEvents eventAdded={eventAdded} setEventAdded={setEventAdded} searchTerm={eventSearch} />
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

export default AdminDashboard;