"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AiOutlineCamera } from "react-icons/ai";
import { FaUser, FaEnvelope, FaIdCard, FaBirthdayCake, FaPhone, FaUniversity, FaMoneyCheckAlt } from "react-icons/fa";
import { MdDelete, MdEdit } from "react-icons/md";
import { motion } from "framer-motion";
import Nav from "../Navigation/Nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import RegisterCamelForm from "../Forms/register-camels-form";

interface UserProfile {
  id: string;
  FirstName: string;
  FatherName: string;
  GrandFatherName: string;
  FamilyName: string;
  username: string;
  email: string;
  NationalID: string;
  BDate: string;
  MobileNumber: string;
  image?: string;
  role: string;
  swiftCode: string;
  IBAN: string;
  bankName: string;
}

interface Camel {
  id: string;
  age: string;
  sex: string;
  camelID: string;
  name: string;
  camelLoopId?: string;
  loopNumber?: number;
  eventName?: string;
  eventId?: string;
}

const Profile = () => {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [camels, setCamels] = useState<Camel[]>([]);
  const [registeredCamels, setRegisteredCamels] = useState<Camel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'registered'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [camelRegister, setCamelRegister] = useState(false);
  const [registeredCamelsFetched, setRegisteredCamelsFetched] = useState(false);
  const [fetchingRegisteredCamels, setFetchingRegisteredCamels] = useState(false);

  const handleRegisterForm = () => {
    setCamelRegister((prev) => !prev);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setError("! الرجاء تسجيل الدخول");
          router.push("/auth/login");
          return;
        }

        const userResponse = await fetch("/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!userResponse.ok) {
          const errorData = await userResponse.json();
          setError(errorData.error || "Failed to fetch user profile.");
          return;
        }
        const userData = await userResponse.json();
        setUser(userData);
        if (userData.image) setSelectedImage(userData.image);

        await fetchCamels(userData.id);
        // await fetchRegisteredCamels(userData.id);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("An error occurred while fetching data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);


  useEffect(() => {
    if (camelRegister) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "auto";
      document.body.style.touchAction = "auto";
    }
  }, [camelRegister]);

  const fetchCamels = async (userId: string) => {
    try {
      const response = await fetch(`/api/camels/${userId}`);
      const camelData = await response.json();
      setCamels(camelData);
    } catch (error) {
      console.error("Error fetching camels:", error);
      setError("Failed to fetch camels");
    }
  };

  useEffect(() => {
    if (activeTab === 'registered' && user && !registeredCamelsFetched) {
      fetchRegisteredCamels(user.id);
    }
  }, [activeTab, user, registeredCamelsFetched]);

  const fetchRegisteredCamels = async (userId: string) => {
    try {
      setFetchingRegisteredCamels(true);
      const eventsResponse = await fetch("/api/events/getEvents");
      const events = await eventsResponse.json();

      let allRegisteredCamels: Camel[] = [];

      for (const event of events) {
        const loopsResponse = await fetch(`/api/events/${event.id}/getLoops`);
        const loops = await loopsResponse.json();

        for (const loop of loops) {
          const registeredResponse = await fetch(
            `/api/events/${event.id}/getLoops/${loop.id}/registeredCamels?userId=${userId}`
          );
          const loopCamels = await registeredResponse.json();

          const camelsWithLoopInfo = loopCamels.map((camel: Camel) => ({
            ...camel,
            loopNumber: loop.number,
            camelLoopId: loop.id,
            eventName: event.name,
            eventId: event.id  // Add event ID
          }));

          allRegisteredCamels = [...allRegisteredCamels, ...camelsWithLoopInfo];
        }
      }

      setRegisteredCamels(allRegisteredCamels);
      setRegisteredCamelsFetched(true);
      setFetchingRegisteredCamels(false);
    } catch (error) {
      console.error("Error fetching registered camels:", error);
      setError("Failed to fetch registered camels");
    }
  };

  const handlePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            setSelectedImage(reader.result as string);
          }
        };
        reader.readAsDataURL(file);

        const formData = new FormData();
        formData.append('image', file);

        const token = localStorage.getItem("authToken");
        const response = await fetch('/api/user/updateImage', {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to update profile picture');
        }
      } catch (error) {
        console.error("Error updating profile picture:", error);
        setError("Failed to update profile picture");
      }
    }
  };

  const handleCancelRegistration = async (camelId: string, loopId: string, eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/getLoops/${loopId}/removeRegisteredCamel`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          camelId: parseInt(camelId, 10)
        })
      });

      if (response.ok) {
        setError(null);
        await fetchRegisteredCamels(user!.id);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to cancel registration");
      }
    } catch (error) {
      console.error("Error canceling registration:", error);
      setError("Failed to cancel registration");
    }
  };

  function translateAge(Age: string) {
    const translations: { [key: string]: string } = {
      "GradeOne": "مفرد",
      "GradeTwo": "حقايق",
      "GradeThree": "لقايا",
      "GradeFour": "جذاع",
      "GradeFive": "ثنايا",
      "GradeSixMale": "زمول",
      "GradeSixFemale": "حيل"
    };
    return translations[Age] || Age;
  }

  function translateSex(sex: string) {
    return sex === "Male" ? "قعدان" : sex === "Female" ? "بكار" : sex;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500 text-xl">{error}</p>
      </div>
    );
  }

  console.log(registeredCamels)

  if (isLoading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="flex justify-center items-center mb-4">
          <Image
            src="/loadingPage.jpeg"
            width={150}
            height={150}
            alt="loading"
            className="rounded-full shadow-lg"
          />
        </div>
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-800">
            رياضـة الـهـجـن الأردنـيـة
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white">
      <div className="relative h-[400px]">
        <Image
          src="/WadiRam.jpeg"
          layout="fill"
          objectFit="cover"
          alt="Wadi Rum"
          className="brightness-50"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        <div className="container relative h-full">
          <Nav />
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute bottom-0 right-0 transform translate-y-1/2 mr-8"
          >
            <div className="relative">
              <Image
                className="rounded-full border-4 border-white shadow-2xl"
                src={selectedImage || "/PFP.jpg"}
                width={200}
                height={200}
                alt="Profile Picture"
                priority
              />
              <label className="absolute inset-0 bg-black opacity-0 hover:opacity-20 flex items-center justify-center cursor-pointer rounded-full transition-opacity duration-300">
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handlePictureChange}
                />
                <AiOutlineCamera size={40} className="text-white" />
              </label>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-32 pb-16">
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-4xl font-bold text-right mb-12 text-gray-800"
        >
          أهلا {user.username}
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Card className="overflow-hidden shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-6 text-right text-gray-700 border-b pb-2">المعلومات البنكية</h2>
                <div className="space-y-4">
                  <InfoItem icon={<FaUniversity />} label="البنك" value={user.bankName} />
                  <InfoItem icon={<FaMoneyCheckAlt />} label="IBAN" value={user.IBAN} />
                  <InfoItem icon={<FaMoneyCheckAlt />} label="SWIFT Code" value={user.swiftCode} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card className="overflow-hidden shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-6 text-right text-gray-700 border-b pb-2">المعلومات الشخصية</h2>
                <div className="space-y-4">
                  <InfoItem
                    icon={<FaUser />}
                    label="الاسم الكامل"
                    value={`${user.FirstName} ${user.FatherName ?? ''} ${user.GrandFatherName ?? ''} ${user.FamilyName ?? ''}`}
                  />
                  <InfoItem icon={<FaEnvelope />} label="البريد الإلكتروني" value={user.email} />
                  <InfoItem icon={<FaIdCard />} label="الرقم الوطني" value={user.NationalID} />
                  <InfoItem icon={<FaBirthdayCake />} label="تاريخ الميلاد" value={user.BDate?.split("T")[0]} />
                  <InfoItem icon={<FaPhone />} label="رقم الهاتف" value={user.MobileNumber} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-16"
        >
          <Card className="overflow-hidden shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6 gap-2 max-md:flex-col">
                <div className="flex space-x-4 rtl:space-x-reverse max-md:mr-auto">
                  <Button
                    variant={activeTab === 'all' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('all')}
                  >
                    جميع الهجن
                  </Button>
                  <Button
                    variant={activeTab === 'registered' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('registered')}
                  >
                    الهجن المسجلة في السباقات
                  </Button>
                </div>
                <Button className='ml-auto' onClick={handleRegisterForm}>
                  {camelRegister ? "إخفاء استمارة التسجيل" : "تسجيل الهجن في السباق"}
                </Button>
              </div>

              {activeTab === 'all' ? (
                <Table dir='rtl' className="w-full" id="myCamels">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">اسم الهجين</TableHead>
                      <TableHead className="text-right">رقم الشريحة</TableHead>
                      <TableHead className="text-right">النوع</TableHead>
                      <TableHead className="text-right">العمر</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {camels.map((camel, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-right">{camel.name}</TableCell>
                        <TableCell className="text-right">{camel.camelID}</TableCell>
                        <TableCell className="text-right">{translateSex(camel.sex)}</TableCell>
                        <TableCell className="text-right">{translateAge(camel.age)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Table dir='rtl' className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">اسم الهجين</TableHead>
                      <TableHead className="text-right">رقم الشريحة</TableHead>
                      <TableHead className="text-right">النوع</TableHead>
                      <TableHead className="text-right">الفعالية</TableHead>
                      <TableHead className="text-right">رقم الشوط</TableHead>
                      <TableHead className="text-right">العمليات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fetchingRegisteredCamels ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          جاري تحميل المطايا المسجلة...
                        </TableCell>
                      </TableRow>
                    ) :
                      registeredCamels.length > 0 && registeredCamels?.map((camel, index) => (
                        <TableRow key={index}>
                          <TableCell className="text-right">{camel.name}</TableCell>
                          <TableCell className="text-right">{camel.camelID}</TableCell>
                          <TableCell className="text-right">{translateSex(camel.sex)}</TableCell>
                          <TableCell className="text-right">{camel.eventName}</TableCell>
                          <TableCell className="text-right">{camel.loopNumber}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              onClick={() => camel.camelLoopId && handleCancelRegistration(camel.id, camel.camelLoopId, camel?.eventId!)}
                            >
                              إلغاء التسجيل
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
      {camelRegister && (
        <RegisterCamelForm userId={user?.id} onClose={handleRegisterForm} refetchRegisteredCamels={() => fetchRegisteredCamels(user?.id)} />
      )}
    </div>
  );
};

const InfoItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | undefined }) => (
  <div className="flex items-center justify-between">
    <span className="text-gray-800">{value}</span>
    <div className="flex items-center space-x-3 rtl:space-x-reverse">
      <span className="font-medium text-gray-600">{label}</span>
      <span className="text-blue-500">{icon}</span>
    </div>
  </div>
);

export default Profile;