import { useEffect, useState } from "react";
import EventDetails from "../event/event-details";
import { Button } from "../ui/button";
import { getAllEvents } from "@/lib/events";

interface Event {
  id: string;
  name: string;
  StartDate: string;
  EndDate: string;
  disabled: boolean;
  type: string;
}

interface ShowEventsProps {
  eventAdded: boolean;
  setEventAdded: (value: boolean) => void;
}

export const ShowEvents: React.FC<ShowEventsProps> = ({
  eventAdded,
  setEventAdded,
}) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null); // لحفظ ID الفعالية المراد حذفها

  const fetchEvents = async () => {
    try {
      const data = await getAllEvents()
      setEvents(data as unknown as Event[])
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("حدث خطأ أثناء جلب الفعاليات.");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (eventAdded) {
      fetchEvents();
      setEventAdded(false);
    }
  }, [eventAdded, setEventAdded]);

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
    <>
      {events.map((event) => (
        <div
          className="w-full h-20 flex-shrink-0 bg-white/30 rounded-lg flex flex-row-reverse items-center justify-between px-5 cursor-pointer mb-2"
          key={event.id}
        >
          <div
            className="flex items-center flex-row-reverse gap-2"
            onClick={() => handleEventClick(event.id)}
          >
            <div className="flex flex-col text-right">
              <span className="font-semibold">{event.name}</span>
              <span className="text-sm">
                {formatDate(event.StartDate)} - {formatDate(event.EndDate)}
              </span>
            </div>
          </div>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            onClick={(e) => {
              e.stopPropagation();
              handleConfirmDelete(event.id); // طلب تأكيد الحذف بدلاً من الحذف مباشرةً
            }}
          >
            حذف
          </button>
        </div>
      ))}
      {selectedEventId && (
        <EventDetails eventId={selectedEventId} onClose={handleCloseEventDetails} />
      )}
      {showConfirm && confirmDeletePopup()}
    </>
  );
};
