import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { MdDelete, MdEdit } from "react-icons/md";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../ui/table";
import UpdateLoopForm from "../Forms/UpdateLoopForm";
import CreateLoopForm from "../Forms/loop-form";
import { IoIosClose } from "react-icons/io";
import { Checkbox } from "../ui/checkbox";
import { translateAge, translateSex, translateTime } from "@/lib/helper";

interface Event {
  id: string;
  name: string;
  StartDate: Date;
  EndDate: Date;
  type: string;
  disabled: boolean;
  hiddenFromAdmin: boolean;
}

export interface Loop {
  eventId: string;
  id: string;
  capacity: number;
  age: string;
  sex: string;
  time: string;
  startRegister: string | Date;
  endRegister: string | Date;
  number: number;
  rank?: number;
}

interface EventDetailsProps {
  eventId: string;
  onClose: () => void;
}

const EventDetails: React.FC<EventDetailsProps> = ({ eventId, onClose }) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [loops, setLoops] = useState<Loop[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isCreateLoopModalOpen, setIsCreateLoopModalOpen] = useState(false);
  const [isUpdateLoopModalOpen, setIsUpdateLoopModalOpen] = useState(false);
  const [isEditEventModalOpen, setIsEditEventModalOpen] = useState(false);
  const [editingLoop, setEditingLoop] = useState<Loop | null>(null);
  const [confirmDeleteLoop, setConfirmDeleteLoop] = useState<string | null>(null);
  const [name, setName] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('00:00');
  const [endTime, setEndTime] = useState<string>('00:00');
  const [disabled, setDisabled] = useState<boolean>(false);
  const [hiddenFromAdmin, setHiddenFromAdmin] = useState<boolean>(false);
  const [eventType, setEventType] = useState<string>('');

  useEffect(() => {
    fetchEventAndLoopsData();
  }, [eventId]);

  const fetchEventAndLoopsData = async () => {
    try {
      const eventResponse = await fetch(`/api/events/${eventId}`);
      if (!eventResponse.ok) {
        throw new Error(`Event fetch error: ${eventResponse.statusText}`);
      }
      const eventData = await eventResponse.json();
      setEvent(eventData);
      setName(eventData.name);

      const startDateTime = eventData.StartDate;
      const endDateTime = eventData.EndDate;

      setStartDate(startDateTime.split('T')[0]);
      setEndDate(endDateTime.split('T')[0]);
      setStartTime(startDateTime.split('T')[1].slice(0, 5));
      setEndTime(endDateTime.split('T')[1].slice(0, 5));
      setDisabled(eventData.disabled);
      setHiddenFromAdmin(eventData.hiddenFromAdmin);
      setEventType(eventData.type);

      // Fetch loops data
      const loopsResponse = await fetch(`/api/events/${eventId}/getLoops`);
      if (!loopsResponse.ok) {
        throw new Error(`Loops fetch error: ${loopsResponse.statusText}`);
      }
      const loopsData = await loopsResponse.json();

      const rankedLoops = loopsData
        .sort((a: Loop, b: Loop) => a.rank! - b.rank!)
        .map((loop: Loop, index: number) => ({
          ...loop,
          rank: index + 1,
        }))
        .filter((loop: Loop) => loop.eventId === eventId);
      
      setLoops(rankedLoops);
    } catch (error: any) {
      setError(`An error occurred while fetching event details: ${error.message}`);
    }
  };

  const handleEditLoop = (loop: Loop) => {
    setEditingLoop(loop);
    setIsUpdateLoopModalOpen(true);
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const startDateTime = new Date(`${startDate}T${startTime}:00.000Z`);
      const endDateTime = new Date(`${endDate}T${endTime}:00.000Z`);

      const response = await fetch(`/api/events/${eventId}/updateEvent`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          StartDate: startDateTime,
          EndDate: endDateTime,
          disabled,
          hiddenFromAdmin,
          type: eventType,
        }),
      });
      if (response.ok) {
        setIsEditEventModalOpen(false);
        await fetchEventAndLoopsData();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  const handleDeleteLoop = async (loopId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/getLoops/${loopId}/deleteLoop`, {
        method: "DELETE",
      });
      if (response.ok) {
        setConfirmDeleteLoop(null);
        await fetchEventAndLoopsData();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error deleting loop:", error);
    }
  };


  function getEventType(eventType: string) {
    switch (eventType) {
      case "International":
        return "دولية";
      case "National":
        return "محلية";
      default:
        return "";
    }
  }

  const swapRanks = async (i: number, j: number) => {
    const updated = [...loops];
    [updated[i].rank, updated[j].rank] = [updated[j].rank, updated[i].rank];
    setLoops(updated);
    await saveLoopOrder([updated[i], updated[j]]);
  };
  
  const handleMoveLoopUp = (loop: Loop) => { 
    const i = loops.findIndex(l => l.id === loop.id); 
    if (i > 0) swapRanks(i, i - 1); 
  };
  
  const handleMoveLoopDown = (loop: Loop) => { 
    const i = loops.findIndex(l => l.id === loop.id); 
    if (i < loops.length - 1) swapRanks(i, i + 1); 
  };

  const saveLoopOrder = async (updatedLoops: Loop[]) => {
    try {
      await fetch(`/api/events/${eventId}/updateLoopsOrder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedLoops.map(({ id, rank }) => ({ id, rank }))),
      });
      await fetchEventAndLoopsData();
    } catch (error) {
      console.error("Failed to update loop order:", error);
    }
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl">
          <p className="text-red-500 text-center">{error}</p>
          <button
            onClick={onClose}
            className="mt-4 bg-gray-500 text-white p-2 rounded mx-auto block"
          >
            إغلاق
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl max-h-[90vh] overflow-auto">
        <div className="items-center mb-4">
          <div className="flex space-x-2 justify-between items-center">
            <button
              onClick={onClose}
              className="mt-4 bg-gray-500 text-white p-2 rounded mb-5"
            >
              <IoIosClose size={24} />
            </button>

            <div className="flex gap-4">
              <Button
                onClick={() => setIsEditEventModalOpen(true)}
                variant="outline"
              >
                <MdEdit className="mr-2" size={18} /> تعديل فعالية
              </Button>
            </div>
          </div>
        </div>
        <hr className="mt-4 mb-4" />
        <h2 className="text-xl font-bold text-center">
          تفاصيل الفعالية
        </h2>
        <hr className="mt-4 mb-4" />

        {event ? (
          <div className="text-end pb-4 pt-4">
            <h3 className="text-xl font-semibold mb-4 text-center">{event.name}</h3>
            <div className="flex justify-between items-center">
              <p>تاريخ البداية: {event.StartDate.toString().split('T')[0]}</p>
              <span className="mx-2">→</span>
              <p>تاريخ النهاية: {event.EndDate.toString().split('T')[0]}</p>
            </div>
            <p>نوع الفعالية: {getEventType(event.type)}</p>
            <hr className="mt-4" />

            <Button
              onClick={() => setIsCreateLoopModalOpen(true)}
              className="mt-4"
            >
              إضافة شوط
            </Button>
            <Table className="container text-right mt-4">
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead>
                  {/* <TableHead>الإجراءات</TableHead> */}
                  <TableHead>الرقم</TableHead>
                  <TableHead>السعة</TableHead>
                  <TableHead>الفئة</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>الوقت</TableHead>
                  {/* <TableHead>الرقم</TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loops.length > 0 ? (
                  loops
                    .sort((a, b) => a.rank! - b.rank!)
                    .map((loop) => (
                      <TableRow key={loop.id}>
                        <TableCell className="flex items-center gap-2">
                          <button 
                            onClick={() => handleMoveLoopUp(loop)} 
                            className="text-green-600"
                            disabled={loop.rank === 1}
                          >
                            ↑
                          </button>
                          <button 
                            onClick={() => handleMoveLoopDown(loop)} 
                            className="text-green-600"
                            disabled={loop.rank === loops.length}
                          >
                            ↓
                          </button>
                          <button 
                            onClick={() => handleEditLoop(loop)} 
                            className="text-blue-950"
                          >
                            <MdEdit size={20} />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteLoop(loop.id)}
                            className="text-red-500 ml-2"
                          >
                            <MdDelete size={20} />
                          </button>
                        </TableCell>
                        {/* <TableCell>{loop.rank}</TableCell> */}
                        <TableCell>{loop.number}</TableCell>
                        <TableCell>{loop.capacity}</TableCell>
                        <TableCell className="font-medium">
                          {translateAge(loop.age)}
                        </TableCell>
                        <TableCell>{translateSex(loop.sex)}</TableCell>
                        <TableCell>{translateTime(loop.time)}</TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      لا يوجد بيانات
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {confirmDeleteLoop && (
              <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
                  <h3 className="text-lg text-center mb-4">
                    هل أنت متأكد من حذف هذا الشوط؟
                  </h3>
                  <div className="flex justify-between">
                    <Button
                      onClick={() => confirmDeleteLoop && handleDeleteLoop(confirmDeleteLoop)}
                      variant="destructive"
                    >
                      حذف
                    </Button>
                    <Button
                      className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                      onClick={() => setConfirmDeleteLoop(null)}
                    >
                      إلغاء
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center">جاري تحميل البيانات...</p>
        )}

        {isCreateLoopModalOpen && (
          <CreateLoopForm
            eventId={eventId}
            eventEndDate={event?.EndDate}
            onClose={() => setIsCreateLoopModalOpen(false)}
            onAddLoop={(newLoop: Loop) => {
              setLoops((prevLoops) => [...prevLoops, newLoop]);
              fetchEventAndLoopsData();
            }}
            eventStartDate=""
            loops={loops}
          />
        )}

        {isUpdateLoopModalOpen && editingLoop && (
          <UpdateLoopForm
            loop={editingLoop}
            eventEndDate={new Date(event?.EndDate || '')}
            onClose={() => setIsUpdateLoopModalOpen(false)}
            onLoopUpdated={fetchEventAndLoopsData}
            loops={loops.filter(loopFiltered => loopFiltered.id !== editingLoop?.id)}
          />
        )}

        {isEditEventModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
              <h3 className="text-lg font-semibold mb-4">تعديل فعالية</h3>
              <form onSubmit={handleUpdateEvent}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    اسم الفعالية
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border border-gray-300 rounded-md p-2 w-full"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    نوع الفعالية
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="border border-gray-300 rounded-md p-2 w-full"
                    required
                  >
                    <option value="International">دولية</option>
                    <option value="National">محلية</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    تاريخ البداية
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="border border-gray-300 rounded-md p-2 flex-1"
                      required
                    />
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="border border-gray-300 rounded-md p-2 flex-1"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    تاريخ النهاية
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="border border-gray-300 rounded-md p-2 flex-1"
                      required
                    />
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="border border-gray-300 rounded-md p-2 flex-1"
                      required
                    />
                  </div>
                </div>
                <div className="mb-4 flex items-center justify-start gap-4 w-full">
                  <div className="flex items-center gap-2">
                    <label htmlFor="disabled" className="block text-sm font-medium text-gray-700">
                       اخفاء من صفحات المستخدمين
                    </label>
                    <Checkbox
                      id="disabled"
                      checked={disabled}
                      onCheckedChange={(checked) => setDisabled(!!checked)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label htmlFor="hiddenFromAdmin" className="block text-sm font-medium text-gray-700">
                      اخفاء من صفحات الادمن
                    </label>
                    <Checkbox
                      id="hiddenFromAdmin"
                      checked={hiddenFromAdmin}
                      onCheckedChange={(checked) => setHiddenFromAdmin(!!checked)}
                    />
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button type="submit">
                    حفظ التعديلات
                  </Button>
                  <Button
                    onClick={() => setIsEditEventModalOpen(false)}
                    variant="outline"
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetails;