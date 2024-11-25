"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AiOutlineCamera } from "react-icons/ai";
import { FaUser, FaEnvelope, FaIdCard, FaBirthdayCake, FaPhone, FaUniversity, FaMoneyCheckAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import Nav from "../Navigation/Nav";
import RegisterCamelForm from "../Forms/register-camels-form";
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
import * as XLSX from "xlsx";

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
}

const Profile = () => {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [camels, setCamels] = useState<Camel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [camelRegister, setCamelRegister] = useState(false);

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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!userResponse.ok) {
          const errorData = await userResponse.json();
          setError(errorData.error || "Failed to fetch user profile.");
          return;
        }
        const userData = await userResponse.json();
        setUser(userData);
        if (userData.image) setSelectedImage(userData.image);

        const camelResponse = await fetch(`/api/camels/${userData.id}`);
        if (!camelResponse.ok) {
          const errorData = await camelResponse.json();
          setError(errorData.error || "Failed to fetch camels.");
          return;
        }
        const camelData = await camelResponse.json();
        setCamels(camelData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("An error occurred while fetching data.");
      }
    };

    fetchData();
  }, [router]);

  const handlePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setSelectedImage(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const exportToExcel = () => {
    const table = document.getElementById("myCamels");
    if (!table) {
      setError("Table element not found.");
      return;
    }

    try {
      const workbook = XLSX.utils.table_to_book(table, { sheet: "Sheet1" });
      XLSX.writeFile(workbook, "camels-data.xlsx");
    } catch (err) {
      console.error("Error exporting to Excel:", err);
      setError("An error occurred while exporting to Excel.");
    }
  };

  const handleRegisterForm = () => {
    setCamelRegister((prev) => !prev);
  };

  useEffect(() => {
    if (camelRegister) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "auto";
      document.body.style.touchAction = "auto";
    }
  }, [camelRegister]);

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="flex justify-center items-center mb-4 transition-transform duration-500 ease-in-out transform hover:scale-110">
          <Image
            src="/loadingPage.jpeg"
            width={150}
            height={150}
            alt="loading"
            className="rounded-full shadow-lg"
          />
        </div>
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-800 transition-transform duration-500 ease-in-out hover:translate-x-2">
            رياضـة الـهـجـن الأردنـيـة
          </h1>
        </div>
      </div>
    );
  }

  function translateAge(Age: string) {
    switch (Age) {
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
        return Age;
    }
  }

  function translateSex(sex: string) {
    switch (sex) {
      case "Male":
        return "قعدان";
      case "Female":
        return "بكار";
      default:
        return sex;
    }
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
          أهلا {user?.username}
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
                  <InfoItem icon={<FaUniversity />} label="البنك" value={user?.bankName} />
                  <InfoItem icon={<FaMoneyCheckAlt />} label="IBAN" value={user?.IBAN} />
                  <InfoItem icon={<FaMoneyCheckAlt />} label="SWIFT Code" value={user?.swiftCode} />
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
                  <InfoItem icon={<FaUser />} label="الاسم الكامل" value={`${user?.FirstName} ${user?.FatherName ?? ''} ${user?.GrandFatherName ?? ''} ${user?.FamilyName ?? ''}`} />
                  <InfoItem icon={<FaEnvelope />} label="البريد الإلكتروني" value={user?.email} />
                  <InfoItem icon={<FaIdCard />} label="الرقم الوطني" value={user?.NationalID} />
                  <InfoItem icon={<FaBirthdayCake />} label="تاريخ الميلاد" value={user?.BDate?.split("T")[0]} />
                  <InfoItem icon={<FaPhone />} label="رقم الهاتف" value={user?.MobileNumber} />
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
              <div className="flex items-center justify-between mb-6">
                <div className="space-x-4 rtl:space-x-reverse">
                  <Button variant="outline" onClick={exportToExcel}>
                    طباعة البيانات
                  </Button>
                  <Button onClick={handleRegisterForm}>
                    {camelRegister ? "إخفاء استمارة التسجيل" : "تسجيل الهجن في السباق"}
                  </Button>
                </div>
                <h2 className="text-2xl font-semibold text-gray-700">الهجن المسجلة</h2>
              </div>
              <Table className="w-full" id="myCamels">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الفئة / السن</TableHead>
                    <TableHead className="text-right">رقم الشريحة</TableHead>
                    <TableHead className="text-right">اسم الهجين</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {camels.map((camel) => (
                    <TableRow key={camel.id}>
                      <TableCell className="text-right">{translateAge(camel.age)} \ {translateSex(camel.sex)}</TableCell>
                      <TableCell className="text-right">{camel.camelID}</TableCell>
                      <TableCell className="text-right">{camel.name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {camelRegister && (
        <RegisterCamelForm userId={user?.id} onClose={handleRegisterForm} />
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

