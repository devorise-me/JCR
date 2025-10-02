"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AiOutlineCamera } from "react-icons/ai";
import { 
  FaUser, 
  FaEnvelope, 
  FaIdCard, 
  FaBirthdayCake, 
  FaPhone, 
  FaUniversity, 
  FaMoneyCheckAlt,
  FaCrown,
  FaTrophy,
  FaEdit
} from "react-icons/fa";
import { motion } from "framer-motion";
import Nav from "../components/Navigation/Nav";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import RegisterCamelForm from "../components/Forms/register-camels-form";

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

const EnhancedProfile = () => {
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
          setError("الرجاء تسجيل الدخول");
          router.push("/auth/login");
          return;
        }

        const userResponse = await fetch("/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!userResponse.ok) {
          const errorData = await userResponse.json();
          setError(errorData.error || "فشل في جلب بيانات المستخدم");
          return;
        }
        const userData = await userResponse.json();
        setUser(userData);
        if (userData.image) setSelectedImage(userData.image);

        await fetchCamels(userData.id);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("حدث خطأ أثناء جلب البيانات");
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
      setError("فشل في جلب بيانات الهجن");
    }
  };

  useEffect(() => {
    if (activeTab === 'registered' && user && !registeredCamelsFetched && !fetchingRegisteredCamels) {
      fetchRegisteredCamels(user.id);
    }
  }, [activeTab, user, registeredCamelsFetched, fetchingRegisteredCamels]);

  const fetchRegisteredCamels = async (userId: string) => {
    try {
      setFetchingRegisteredCamels(true);
      const response = await fetch(`/api/users/${userId}/registeredCamels`);
      if (!response.ok) {
        throw new Error('فشل في جلب الهجن المسجلة');
      }
      const data = await response.json();
      setRegisteredCamels(data);
      setRegisteredCamelsFetched(true);
    } catch (error) {
      console.error("Error fetching registered camels:", error);
      setError("فشل في جلب الهجن المسجلة");
    } finally {
      setFetchingRegisteredCamels(false);
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
        const response = await fetch('/api/users/updateImage', {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error('فشل في تحديث الصورة الشخصية');
        }
      } catch (error) {
        console.error("Error updating profile picture:", error);
        setError("فشل في تحديث الصورة الشخصية");
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
        setError(errorData.message || "فشل في إلغاء التسجيل");
      }
    } catch (error) {
      console.error("Error canceling registration:", error);
      setError("فشل في إلغاء التسجيل");
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

  const InfoItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-gray-100 hover:to-gray-200 transition-all duration-200">
      <div className="text-blue-600 text-xl">{icon}</div>
      <div className="flex-1 text-right">
        <p className="text-sm text-gray-600 mb-1">{label}</p>
        <p className="font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-red-100">
        <Card className="p-8 shadow-lg">
          <p className="text-red-600 text-xl text-center">{error}</p>
        </Card>
      </div>
    );
  }

  if (isLoading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mb-8"
        >
          <Image
            src="/loadingPage.jpeg"
            width={150}
            height={150}
            alt="loading"
            className="rounded-full shadow-2xl"
          />
        </motion.div>
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            رياضة الهجن الأردنية
          </h1>
          <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              animate={{ x: [-256, 256] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative h-[500px] overflow-hidden">
        <Image
          src="/WadiRam.jpeg"
          layout="fill"
          objectFit="cover"
          alt="Wadi Rum"
          className="brightness-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        {/* Navigation */}
        <div className="container relative h-full">
          <Nav />
          
          {/* Profile Picture */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="absolute bottom-0 right-8 transform translate-y-1/2"
          >
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <Image
                className="relative rounded-full border-4 border-white shadow-2xl"
                src={selectedImage || "/PFP.jpg"}
                width={200}
                height={200}
                alt="Profile Picture"
                priority
              />
              <label className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center cursor-pointer rounded-full transition-all duration-300 group-hover:bg-black/30">
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handlePictureChange}
                />
                <div className="text-center text-white">
                  <AiOutlineCamera size={30} className="mx-auto mb-1" />
                  <span className="text-xs">تغيير الصورة</span>
                </div>
              </label>
            </div>
          </motion.div>

          {/* User Role Badge */}
          {user.role === 'ADMIN' && (
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="absolute top-32 left-8"
            >
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                <FaCrown className="text-lg" />
                <span className="font-semibold">مدير النظام</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-32 pb-16">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            أهلاً وسهلاً {user.username}
          </h1>
          <p className="text-gray-600 text-lg">مرحباً بك في نظام إدارة سباقات الهجن الأردنية</p>
        </motion.div>

        {/* Profile Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <Card className="overflow-hidden shadow-xl bg-white/80 backdrop-blur-sm border-0">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardTitle className="text-right flex items-center justify-between text-xl">
                  <FaUser className="text-2xl" />
                  <span>المعلومات الشخصية</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <InfoItem
                  icon={<FaUser />}
                  label="الاسم الكامل"
                  value={`${user.FirstName} ${user.FatherName ?? ''} ${user.GrandFatherName ?? ''} ${user.FamilyName ?? ''}`}
                />
                <InfoItem icon={<FaEnvelope />} label="البريد الإلكتروني" value={user.email} />
                <InfoItem icon={<FaIdCard />} label="الرقم الوطني" value={user.NationalID} />
                <InfoItem icon={<FaBirthdayCake />} label="تاريخ الميلاد" value={user.BDate?.split("T")[0]} />
                <InfoItem icon={<FaPhone />} label="رقم الهاتف" value={user.MobileNumber} />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Card className="overflow-hidden shadow-xl bg-white/80 backdrop-blur-sm border-0">
              <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardTitle className="text-right flex items-center justify-between text-xl">
                  <FaUniversity className="text-2xl" />
                  <span>المعلومات البنكية</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <InfoItem icon={<FaUniversity />} label="اسم البنك" value={user.bankName} />
                <InfoItem icon={<FaMoneyCheckAlt />} label="رقم الحساب (IBAN)" value={user.IBAN} />
                <InfoItem icon={<FaMoneyCheckAlt />} label="رمز السويفت" value={user.swiftCode} />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Camels Section */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <Card className="overflow-hidden shadow-xl bg-white/80 backdrop-blur-sm border-0">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardTitle className="text-right flex items-center justify-between text-xl">
                <FaTrophy className="text-2xl" />
                <span>إدارة الهجن</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                <div className="flex space-x-4 rtl:space-x-reverse">
                  <Button
                    variant={activeTab === 'all' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('all')}
                    className={`${
                      activeTab === 'all'
                        ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                        : 'hover:bg-green-50'
                    } transition-all duration-200`}
                  >
                    جميع الهجن ({camels.length})
                  </Button>
                  <Button
                    variant={activeTab === 'registered' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('registered')}
                    className={`${
                      activeTab === 'registered'
                        ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                        : 'hover:bg-red-50'
                    } transition-all duration-200`}
                  >
                    الهجن المسجلة ({registeredCamels.length})
                  </Button>
                </div>
                <Button 
                  onClick={handleRegisterForm}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md"
                >
                  <FaEdit className="ml-2" />
                  {camelRegister ? "إخفاء النموذج" : "تسجيل هجين جديد"}
                </Button>
              </div>

              {camelRegister && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mb-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200"
                >
                  <RegisterCamelForm />
                </motion.div>
              )}

              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 max-h-96 overflow-auto">
                {activeTab === 'all' ? (
                  <Table dir='rtl' className="w-full">
                    <TableHeader>
                      <TableRow className="bg-white/50">
                        <TableHead className="text-right font-semibold">اسم الهجين</TableHead>
                        <TableHead className="text-right font-semibold">رقم الشريحة</TableHead>
                        <TableHead className="text-right font-semibold">النوع</TableHead>
                        <TableHead className="text-right font-semibold">العمر</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {camels.map((camel, index) => (
                        <TableRow key={index} className="hover:bg-white/70 transition-colors">
                          <TableCell className="text-right font-medium">{camel.name}</TableCell>
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
                      <TableRow className="bg-white/50">
                        <TableHead className="text-right font-semibold">اسم الهجين</TableHead>
                        <TableHead className="text-right font-semibold">رقم الشريحة</TableHead>
                        <TableHead className="text-right font-semibold">النوع</TableHead>
                        <TableHead className="text-right font-semibold">الفعالية</TableHead>
                        <TableHead className="text-right font-semibold">رقم الشوط</TableHead>
                        <TableHead className="text-right font-semibold">العمليات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fetchingRegisteredCamels ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <div className="flex items-center justify-center gap-2">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                              <span>جاري تحميل الهجن المسجلة...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : registeredCamels.length > 0 ? (
                        registeredCamels.map((camel, index) => (
                          <TableRow key={index} className="hover:bg-white/70 transition-colors">
                            <TableCell className="text-right font-medium">{camel.name}</TableCell>
                            <TableCell className="text-right">{camel.camelID}</TableCell>
                            <TableCell className="text-right">{translateSex(camel.sex)}</TableCell>
                            <TableCell className="text-right">{camel.eventName}</TableCell>
                            <TableCell className="text-right">{camel.loopNumber}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => camel.camelLoopId && handleCancelRegistration(camel.id, camel.camelLoopId, camel?.eventId!)}
                                className="hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
                              >
                                إلغاء التسجيل
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            لا توجد هجن مسجلة في السباقات حالياً
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default EnhancedProfile;

