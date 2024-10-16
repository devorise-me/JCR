"use client";

import React, { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

type CalendarEvent = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
};

type CalendarProps = {
  events: CalendarEvent[];
};

const Calendar: React.FC<CalendarProps> = ({ events }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [days, setDays] = useState<Date[]>([]);

  // Utility function to normalize the date to "00:00:00" to avoid time-based discrepancies
  const normalizeDate = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  // Utility function to check if a date is within the event range
  const isDateInRange = (date: Date, startDate: Date, endDate: Date) => {
    const normalizedDate = normalizeDate(date);
    const normalizedStartDate = normalizeDate(startDate);
    const normalizedEndDate = normalizeDate(endDate);
    return normalizedDate >= normalizedStartDate && normalizedDate <= normalizedEndDate;
  };

  useEffect(() => {
    const generateDaysArray = (month: number, year: number) => {
      const daysInMonth = new Date(year, month, 0).getDate();
      return Array.from({ length: daysInMonth }, (_, i) => new Date(year, month - 1, i + 1));
    };

    setDays(generateDaysArray(currentMonth.getMonth() + 1, currentMonth.getFullYear()));
  }, [currentMonth]);

  const changeMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === "prev" ? -1 : 1));
      return newDate;
    });
  };

  const getEventsForDay = (day: Date) => {
    return events.filter((event) =>
      isDateInRange(normalizeDate(day), new Date(event.startDate), new Date(event.endDate))
    );
  };

  const getEventStatus = (day: Date, event: CalendarEvent) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    if (endDate < now) {
      return "ended"; // Event has ended
    } else if (startDate <= now && endDate >= now && isDateInRange(day, startDate, endDate)) {
      return "ongoing"; // Event is currently ongoing
    } else if (startDate > now) {
      return "upcoming"; // Event is upcoming
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => changeMonth("prev")}
          className={buttonVariants({ variant: "outline" }) + " h-10 w-10 flex items-center justify-center"}
        >
          <FaChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-xl font-semibold">
          {currentMonth.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </span>
        <button
          onClick={() => changeMonth("next")}
          className={buttonVariants({ variant: "outline" }) + " h-10 w-10 flex items-center justify-center"}
        >
          <FaChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 md:gap-4">
        {days.map((day) => {
          const dayKey = day.toISOString().split("T")[0];
          const eventsForDay = getEventsForDay(day);
          const hasEvents = eventsForDay.length > 0;

          let backgroundColor = "bg-gray-200"; // Default color

          if (hasEvents) {
            const statusColors = eventsForDay.map((event) => getEventStatus(day, event));

            if (statusColors.includes("ended")) {
              backgroundColor = "bg-red-500"; // Event has ended
            } else if (statusColors.includes("ongoing")) {
              backgroundColor = "bg-green-500"; // Ongoing event
            } else if (statusColors.includes("upcoming")) {
              backgroundColor = "bg-yellow-400"; // Upcoming event
            }
          }

          return (
            <div
              key={dayKey}
              className={cn(
                "relative p-4 md:p-5 lg:p-6 border rounded-lg text-center cursor-pointer",
                {
                  [backgroundColor]: hasEvents,
                }
              )}
              onClick={() => setSelectedDay(day)}
            >
              <div className="text-base md:text-lg font-semibold">{day.getDate()}</div>
              {hasEvents && (
                <div className="text-sm text-white">
                  {eventsForDay.map((event) => (
                    <div key={event.id}>
                      <hr className="text-gray-950 mt-1 mb-1"/>
                      {event.name} {/* Display event name */}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Always-visible div below the calendar showing details */}
      <div className="mt-4 p-4 border rounded-lg bg-yellow-50">
        <h2 className="text-lg font-medium">
          Events on {selectedDay ? selectedDay.toDateString() : "No day selected"}
        </h2>
        <ul>
          {selectedDay ? (
            getEventsForDay(selectedDay).length > 0 ? (
              getEventsForDay(selectedDay).map((event) => (
                <li key={event.id}>
                  <strong>{event.name}</strong> - {new Date(event.startDate).toLocaleDateString()} to{" "}
                  {new Date(event.endDate).toLocaleDateString()}
                </li>
              ))
            ) : (
              <li>No events for this day.</li>
            )
          ) : (
            <li>Select a day to view events.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export { Calendar };
