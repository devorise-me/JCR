import { useEffect, useState } from "react";
import { Calendar } from "../ui/calendar";

type CalendarEvent = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
};
const CalendarContainer = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/events/getEvents");

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();


        if (Array.isArray(data)) {
          setEvents(
            data.map((event: any) => ({
              id: event.id,
              name: event.name,
              startDate: new Date(event.StartDate),
              endDate: new Date(event.EndDate),
            }))
          );
        } else {
          throw new Error("Unexpected data structure");
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        setError("");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return <div>Loading events...</div>;
  }

  if (error) {
    return <div>Error loading events: {error}</div>;
  }
  return (
    <div>
      <h1 className="text-center text-3xl font-semibold">جدول الفعاليات</h1>
      <Calendar events={events} />
    </div>
  );
};

export default CalendarContainer;
