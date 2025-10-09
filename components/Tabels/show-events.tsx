import { useEffect, useState } from "react";
import EventDetails from "../event/event-details";
import { Button } from "../ui/button";
import { getAllEvents } from "@/lib/events";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";

interface Event {
  id: string;
  name: string;
  StartDate: string;
  EndDate: string;
  disabled: boolean;
  hiddenFromAdmin: boolean;
  type: string;
}

interface ShowEventsProps {
  eventAdded: boolean;
  setEventAdded: (value: boolean) => void;
  searchTerm?: string;
}

export const ShowEvents: React.FC<ShowEventsProps> = ({
  eventAdded,
  setEventAdded,
  searchTerm = "",
}) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [action, setAction] = useState<'disable' | 'enable'>('disable');

  const years = ['all', '2024', '2025', '2026', '2027', '2028'];

  const fetchEvents = async () => {
    try {
      const data = await getAllEvents();
      setEvents(data as unknown as Event[]);
      filterEventsByYear(data as unknown as Event[], selectedYear);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("حدث خطأ أثناء جلب الفعاليات.");
    }
  };

  const filterEventsByYear = (events: Event[], year: string) => {
    if (year === 'all') {
      setFilteredEvents(events);
      return;
    }

    const filtered = events.filter(event => {
      const startDate = new Date(event.StartDate);
      return startDate.getFullYear().toString() === year;
    });
    setFilteredEvents(filtered);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEventsByYear(events, selectedYear);
  }, [selectedYear, events]);

  useEffect(() => {
    if (eventAdded) {
      fetchEvents();
      setEventAdded(false);
    }
  }, [eventAdded, setEventAdded]);

  // Add search filter
  const displayedEvents = searchTerm
    ? filteredEvents.filter(event => event.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : filteredEvents;

  const handleEventClick = (eventId: string) => {
    setSelectedEventId(eventId);
  };

  const handleCloseEventDetails = () => {
    setSelectedEventId(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/deleteEvent`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setEvents(events.filter((event) => event.id !== eventId));
        setShowConfirm(false); // إغلاق نافذة التأكيد بعد الحذف
      } else {
        const data = await response.json();
        setError(data.error);
      }
    } catch (error) {
      setError("حدث خطأ أثناء حذف الفعالية.");
    }
  };

  const handleConfirmDelete = (eventId: string) => {
    setEventToDelete(eventId); // تحديد الفعالية المراد حذفها
    setShowConfirm(true); // عرض نافذة التأكيد
  };

  const handleCancelDelete = () => {
    setEventToDelete(null); // إلغاء الحذف
    setShowConfirm(false);
  };

  const handleCheckboxChange = (eventId: string, disabled: boolean) => {
    const newSelected = new Set(selectedEvents);
    if (newSelected.has(eventId)) {
      newSelected.delete(eventId);
    } else {
      newSelected.add(eventId);
    }
    setSelectedEvents(newSelected);
    // Set the action based on the first selected event's state
    if (newSelected.size === 1) {
      setAction(disabled ? 'enable' : 'disable');
    }
  };

  const handleToggleEvents = async () => {
    if (selectedEvents.size === 0) return;

    setProcessing(true);
    try {
      const response = await fetch('/api/events/toggleEvents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventIds: Array.from(selectedEvents),
          action
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} events`);
      }

      // Update local state
      const updatedEvents = events.map(event => {
        if (selectedEvents.has(event.id)) {
          return { ...event, disabled: action === 'disable' };
        }
        return event;
      });

      setEvents(updatedEvents);
      filterEventsByYear(updatedEvents, selectedYear);
      setSelectedEvents(new Set()); // Clear selections
    } catch (error) {
      setError(`حدث خطأ أثناء ${action === 'disable' ? 'إخفاء' : 'إظهار'} الفعاليات`);
    } finally {
      setProcessing(false);
    }
  };

  const confirmDeletePopup = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
        <p className="text-lg text-center">هل أنت متأكد أنك تريد حذف هذه الفعالية ؟</p>
        <div className="flex justify-between mt-4 ">
          <Button
            variant="destructive"
            onClick={() => handleDeleteEvent(eventToDelete as string)}
          >
            نعم، احذف
          </Button>
          <Button
            onClick={handleCancelDelete}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            إلغاء
          </Button>
        </div>
      </div>

    </div>
  );

  if (error) return <p>{error}</p>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
          {selectedEvents.size > 0 && (
            <Button
              onClick={handleToggleEvents}
              disabled={processing}
              variant={action === 'disable' ? "destructive" : "default"}
            >
              {processing
                ? `جاري ${action === 'disable' ? 'الإخفاء' : 'الإظهار'}...`
                : action === 'disable' ? 'إخفاء' : 'إظهار'}
            </Button>
          )}
          <span className="text-sm text-gray-500">
            {selectedEvents.size > 0 && `تم اختيار ${selectedEvents.size} فعالية`}
          </span>
        </div>
        <Select
          value={selectedYear}
          onValueChange={setSelectedYear}
          defaultValue="all"
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="اختر السنة" />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year}>
                {year === 'all' ? 'جميع السنوات' : year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {displayedEvents.map((event) => (
        <div
          className="w-full h-20 flex-shrink-0 bg-white/30 rounded-lg flex flex-row-reverse items-center justify-between px-5 cursor-pointer mb-2"
          key={event.id}
        >
          <div className="flex items-center flex-row-reverse gap-4">
            <Checkbox
              checked={selectedEvents.has(event.id)}
              onCheckedChange={() => handleCheckboxChange(event.id, event.disabled)}
              onClick={(e) => e.stopPropagation()}
              className="h-5 w-5"
            />
            <div
              className="flex flex-col text-right"
              onClick={() => handleEventClick(event.id)}
            >
              <span className="font-semibold">{event.name}</span>
              <span className="text-sm">
                {formatDate(event.StartDate)} - {formatDate(event.EndDate)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {event.disabled && (
              <Badge variant="secondary">مخفي</Badge>
            )}
            <button
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              onClick={(e) => {
                e.stopPropagation();
                handleConfirmDelete(event.id);
              }}
            >
              حذف
            </button>
          </div>
        </div>
      ))}
      {selectedEventId && (
        <EventDetails eventId={selectedEventId} onClose={handleCloseEventDetails} />
      )}
      {showConfirm && confirmDeletePopup()}
    </div>
  );
};
