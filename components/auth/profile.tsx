"use client";
import { AiOutlineCamera } from "react-icons/ai";
import Image from "next/image";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import Nav from "../Navigation/Nav";
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
          src={'/loadingPage.jpeg'}
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
        break;
      case "GradeTwo":
        return "حقايق";
        break;
      case "GradeThree":
        return "لقايا";
        break;
      case "GradeFour":
        return "جذاع";
        break;
      case "GradeFive":
        return "ثنايا";
        break;
      case "GradeSixMale":
        return "زمول";
        break;
      case "GradeSixFemale":
        return "حيل";
    }
  }

  function translateSex(sex: string) {
    switch (sex) {
      case "Male":
        return "قعدان";
        break;
      case "Female":
        return "بكار";
        break;
      default:
        return "";
    }
  }

  return (
    <>
      <div>
        <div className="bg-[url('/WadiRam.jpeg')] h-[350px] relative bg-no-repeat bg-cover bg-top">
          <div className="bg-black/50 absolute inset-0" />
          <div className="container relative h-full">
            <Nav />
            <div className="flex items-end justify-end h-full translate-y-[25%] max-sm:justify-center">
              <div className="relative">
                <Image
                  className="rounded-full aspect-square object-contain border-2 border-black shadow-md bg-white z-0"
                  src={selectedImage || "/PFP.jpg"}
                  width={200}
                  height={200}
                  alt="Profile Picture"
                  priority
                />
                <label className="absolute inset-0 bg-black opacity-0 hover:opacity-20 flex items-center justify-center cursor-pointer rounded-full">
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handlePictureChange}
                  />
                  <span className="text-white">
                    <AiOutlineCamera size={24} />
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className="container w-full text-right mt-28 max-sm:text-center">
          <h1 className="text-5xl font-semibold">أهلا {user?.username}</h1>
        </div>

        <div className="container w-full text-right mt-10 max-sm:text-center">
          <div className="flex flex-col items-center justify-center text-right gap-4">
            <div className="flex items-center justify-center gap-2 w-full flex-row-reverse max-sm:flex-col">
              <div className="bg-gray-100 p-3 rounded-lg w-full">
                <label className="block text-gray-400 mb-1">الاسم الأول:</label>
                <input
                  type="text"
                  value={user?.FirstName}
                  readOnly
                  className=" outline-none input-field w-full p-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                />
              </div>
              <div className="bg-gray-200 p-3 rounded-lg w-full">
                <label className="block text-gray-400 mb-1">اسم الأب:</label>
                <input
                  type="text"
                  value={user?.FatherName}
                  readOnly
                  className="input-field w-full p-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-right"
                />
              </div>
            </div>
            <div className="flex w-full gap-2 flex-row-reverse max-sm:flex-col">
              <div className="bg-gray-100 p-3 rounded-lg w-full">
                <label className="block text-gray-400 mb-1">اسم الجد:</label>
                <input
                  type="text"
                  value={user?.GrandFatherName}
                  readOnly
                  className="input-field w-full p-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-right"
                />
              </div>
              <div className="bg-gray-200 p-3 rounded-lg w-full">
                <label className="block text-gray-400 mb-1">اسم العائلة:</label>
                <input
                  type="text"
                  value={user?.FamilyName}
                  readOnly
                  className="input-field w-full p-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-right"
                />
              </div>
            </div>
            <div className="flex w-full gap-2 flex-row-reverse max-sm:flex-col">
              <div className="bg-gray-100 p-3 rounded-lg w-full">
                <label className="block text-gray-400 mb-1">
                  اسم المستخدم:
                </label>
                <input
                  type="text"
                  value={user?.username}
                  readOnly
                  className="input-field w-full p-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-right"
                />
              </div>
              <div className="bg-gray-200 p-3 rounded-lg w-full">
                <label className="block text-gray-400 mb-1">
                  البريد الإلكتروني:
                </label>
                <input
                  type="text"
                  value={user?.email}
                  readOnly
                  className="input-field w-full p-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none  text-right"
                />
              </div>
            </div>
            <div className="flex w-full gap-2 max-sm:flex-col">
              <div className="bg-gray-100 p-3 rounded-lg w-full">
                <label className="block text-gray-400 mb-1">
                  الرقم الوطني:
                </label>
                <input
                  type="text"
                  value={user?.NationalID}
                  readOnly
                  className="input-field w-full p-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-right"
                />
              </div>
              <div className="bg-gray-200 p-3 rounded-lg w-full">
                <label className="block text-gray-400 mb-1">
                  تاريخ الميلاد:
                </label>
                <input
                  type="text"
                  value={user?.BDate?.split("T")[0]}
                  readOnly
                  className="input-field w-full p-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-right"
                />
              </div>
              <div className="bg-gray-100 p-3 rounded-lg w-full">
                <label className="block text-gray-400 mb-1">رقم الهاتف:</label>
                <input
                  type="text"
                  value={user?.MobileNumber}
                  readOnly
                  className="input-field w-full p-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-right"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="container w-full text-center mt-20 max-sm:text-center">
          <div className="mt-10 flex items-center justify-between flex-row-reverse max-sm:flex-col max-sm:gap-5">
            <h2 className="text-2xl">: الهجن المسجلة</h2>
            <div className="flex items-center justify-center gap-1">
              <Button
                variant="outline"
                className="mr-5"
                onClick={exportToExcel}
              >
                طباعة البيانات
              </Button>
              <Button onClick={handleRegisterForm}>
                {camelRegister
                  ? "إخفاء استمارة التسجيل"
                  : "تسجيل الهجن في السباق"}
              </Button>
            </div>
          </div>
        </div>
        <Table className="container text-right mt-10 mb-20" id="myCamels">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">الفئة / السن</TableHead>
              <TableHead>رقم الشريحة</TableHead>
              <TableHead>اسم الهجين</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {camels.map((camel) => (
              <TableRow key={camel.id}>
                <TableCell className="font-medium w-[33%]">
                  {translateAge(camel.age)} \ {translateSex(camel.sex)}
                </TableCell>
                <TableCell>{camel.camelID}</TableCell>
                <TableCell>{camel.name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {camelRegister && (
        <RegisterCamelForm userId={user?.id} onClose={handleRegisterForm} />
      )}
    </>
  );
};

export default Profile;
