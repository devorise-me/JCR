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

interface Event {
  id: string;
  name: string;
  StartDate: Date;
  EndDate: Date;
}

interface Loop {
  eventId: string;
  id: string;
  capacity: number;
  age: string;
  sex: string;
  time: string;
  startRegister: Date;
  endRegister: Date;
  number: number;
  timeInHours: string;
}

interface EventDetailsProps {
  eventId: string;
  onClose: () => void;
}

const EventDetails: React.FC<EventDetailsProps> = ({ eventId, onClose }) => {
  const [event, setEvent] = useState<Event | any>();
  const [loops, setLoops] = useState<Loop[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isCreateLoopModalOpen, setIsCreateLoopModalOpen] = useState(false);
  const [isUpdateLoopModalOpen, setIsUpdateLoopModalOpen] = useState(false);
  const [isEditEventModalOpen, setIsEditEventModalOpen] = useState(false);
  const [editingLoop, setEditingLoop] = useState<Loop | any>(null);
  const [confirmDeleteLoop, setConfirmDeleteLoop] = useState<string | null>(null);
  const [name, setName] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [disabled, setDisabled] = useState<boolean>(false);
  const [eventType, setEventType] = useState<string>('');

  useEffect(() => {
    fetchEventAndLoopsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setStartDate(new Date(eventData.StartDate).toISOString().split('T')[0]);
      setEndDate(new Date(eventData.EndDate).toISOString().split('T')[0]);
      setDisabled(eventData.disabled);
      setEventType(eventData.type);

      // Fetch loops data
      const loopsResponse = await fetch(`/api/events/${eventId}/getLoops`);
      if (!loopsResponse.ok) {
        throw new Error(`Loops fetch error: ${loopsResponse.statusText}`);
      }
      const loopsData = await loopsResponse.json();

      // Ensure that startRegister and endRegister are parsed as Date
      const formattedLoops = loopsData.map((loop: Loop) => ({
        ...loop,
        startRegister: new Date(loop.startRegister).toISOString().split('T')[0],
        endRegister: new Date(loop.endRegister).toISOString().split('T')[0],
      })).filter((loop: Loop) => loop.eventId === eventId);

      setLoops(formattedLoops);
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
      const response = await fetch(`/api/events/${eventId}/updateEvent`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          StartDate: startDate,
          EndDate: endDate,
          disabled,
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
        await fetchEventAndLoopsData(); // Fetch updated loops
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error deleting loop:", error);
    }
  };

  function translateAge(age: string) {
    switch (age) {
      case "GradeOne":
        return "مفرد";
      case "GradeTwo":
        return "حقايق";
      case "GradeThree":
        return "لقايا";
      case "GradeFour":
        return "جذاع";
      case "GradeFive":
        return "ثنايا";
      case "GradeSixMale":
        return "زمول";
      case "GradeSixFemale":
        return "حيل";
      default:
        return "";
    }
  }

  function translateSex(sex: string) {
    switch (sex) {
      case "Male":
        return "قعدان";
      case "Female":
        return "بكار";
      default:
        return "";
    }
  }

  function translateTime(time: string) {
    switch (time) {
      case "Morning":
        return "صباحي";
      case "Evening":
        return "مسائي";
      default:
        return "";
    }
  }

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

  console.log("loops: ", loops)

  const convertToArabicTime = (time: string) => {
    // Arabic numerals ٠١٢٣٤٥٦٧٨٩
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

    // Convert each digit to Arabic
    return time?.split('').map(char => {
      if (char >= '0' && char <= '9') {
        return arabicNumerals[parseInt(char)];
      }
      return char === ':' ? ':' : char;
    }).join('');
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl max-h-[90vh] overflow-auto">
        <div className=" items-center mb-4">
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
        <h2 className="text-xl font-bold  text-center ">
          تفاصيل الفعالية
        </h2>
        <hr className="mt-4 mb-4" />

        {event ? (
          <div className="text-end pb-4 pt-4">
            <h3 className="text-xl font-semibold mb-4 text-center ">{event.name}</h3>
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
                  <TableHead>الرقم</TableHead>
                  <TableHead>السعة</TableHead>
                  <TableHead>الفئة</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>الوقت</TableHead>
                  <TableHead>الساعة</TableHead>
                  <TableHead>تاريخ البدء</TableHead>
                  <TableHead>تاريخ الانتهاء</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loops.length > 0 ? (
                  loops
                    .sort((a, b) => a.number - b.number)
                    .map((loop) => (
                      <TableRow key={loop.id}>
                        <TableCell>{loop.number}</TableCell>
                        <TableCell>{loop.capacity}</TableCell>
                        <TableCell className="font-medium">
                          {translateAge(loop.age)}
                        </TableCell>
                        <TableCell>{translateSex(loop.sex)} </TableCell>
                        <TableCell>{translateTime(loop.time)} </TableCell>
                        <TableCell>{convertToArabicTime(loop.timeInHours)}</TableCell>
                        <TableCell>{new Date(loop.startRegister).toLocaleDateString('ar-EG')}</TableCell>
                        <TableCell>{new Date(loop.endRegister).toLocaleDateString('ar-EG')}</TableCell>

                        <TableCell>
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
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
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
                      onClick={() => setConfirmDeleteLoop(null)}>
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
            eventEndDate={event.EndDate}
            onClose={() => setIsCreateLoopModalOpen(false)}
            onAddLoop={(newLoop: Loop) => {
              setLoops((prevLoops) => [...prevLoops, newLoop]);
              fetchEventAndLoopsData();
            }}
            eventStartDate={""}
            loops={loops}
          />

        )}
        {isUpdateLoopModalOpen && editingLoop && (
          <UpdateLoopForm
            loop={editingLoop}
            eventEndDate={new Date(event.EndDate)}
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
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border border-gray-300 rounded-md p-2 w-full"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    تاريخ النهاية
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border border-gray-300 rounded-md p-2 w-full"
                    required
                  />
                </div>
                <div className="mb-4 flex items-center justify-start gap-2 w-full">
                  <label htmlFor="disabled" className="block text-sm font-medium text-gray-700">
                    اخفاء
                  </label>
                  <Checkbox id="disabled" checked={disabled} onCheckedChange={(checked) => setDisabled(!!checked)} />
                </div>
                <div className="flex justify-between">
                  <Button
                    type="submit"

                  >
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
