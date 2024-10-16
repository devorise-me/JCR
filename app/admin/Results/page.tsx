"use client";
import { useEffect, useState } from "react";
import { ReportForm } from "@/components/Tabels/CamelsResultsTabe";

const Page = () => {
  const [error, setError] = useState<string | null>(null);
  const [Events, setEvents] = useState([]);

  useEffect(() => {
    fetch("/api/events/getEvents")
      .then((response) => response.json())
      .then((data) => {
        setEvents(data);
      })
      .catch((error) => setError("Error fetching events"));
  }, []);

  return (
    <div className="flex flex-1 h-screen">
      <div className="p-2 md:p-5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
        <div className="flex flex-col gap-2 h-full">
          <div className="h-full w-full rounded-lg bg-gray-100 dark:bg-neutral-800 flex flex-col py-1 px-4">
            <div className="flex flex-row-reverse items-center justify-between">
              <h2 className="w-full flex justify-end text-3xl font-semibold my-2">
                : النتائج
              </h2>
            </div>
            <div className="w-full h-full bg-gray-200 rounded-lg p-2 overflow-y-auto">
              {Events.length > 0 && <ReportForm />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
