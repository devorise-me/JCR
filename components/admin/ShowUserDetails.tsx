"use client";
import { useEffect, useState } from "react";
import { MdDelete, MdEdit } from "react-icons/md";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { IoIosClose } from "react-icons/io";
import AddCamelsForm from "../Forms/CamelForm";
import bcryptjs from "bcryptjs";
import { TransferCamelModal } from "../ui/TransferCamelModal";
import { useRouter } from "next/navigation";
import { translateAge, translateSex } from "@/lib/helper";

interface Camel {
  id: number;
  name: string;
  camelID: string;
  age: string;
  sex: string;
  ownerId?: string;
  disabled?: boolean;
}

interface User {
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
  password: string;
  image?: string;
  role: string;
  camels?: Camel[];
  swiftCode: string;
  IBAN: string;
  bankName: string;
}

interface UserDetailsProps {
  userId: string;
  onClose: () => void;
}

const UserDetails: React.FC<UserDetailsProps> = ({ userId, onClose }) => {
  const [user, setUser] = useState<User | null>(null);
  const [camels, setCamels] = useState<Camel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showAddCamelForm, setShowAddCamelForm] = useState(false);
  const [showEditCamelForm, setShowEditCamelForm] = useState(false);
  const [editingCamel, setEditingCamel] = useState<Camel | any>();
  const [confirmDeleteCamel, setConfirmDeleteCamel] = useState<number | null>(
    null
  );
  const [showEditUserForm, setShowEditUserForm] = useState(false);
  const [updatedUser, setUpdatedUser] = useState<Partial<User> | null>(null);
  const [selectedCamelForTransfer, setSelectedCamelForTransfer] = useState<Camel | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await fetch(`/api/users/${userId}`);
        const userData = await userResponse.json();
        if (userData.error) {
          setError(userData.error);
          return;
        }
        setUser(userData);
        setUpdatedUser({
          FirstName: userData.FirstName,
          FatherName: userData.FatherName,
          GrandFatherName: userData.GrandFatherName,
          FamilyName: userData.FamilyName,
          username: userData.username,
          email: userData.email,
          NationalID: userData.NationalID,
          BDate: userData.BDate,
          MobileNumber: userData.MobileNumber,
          IBAN: userData.IBAN,
          swiftCode: userData.swiftCode,
          bankName: userData.bankName,
          // Do NOT include password here!
        });

        const storedToken = localStorage.getItem("authToken");
        const camelResponse = await fetch(`/api/camels/${userData.id}`, {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });
        const camelData = await camelResponse.json();
        if (camelData.error) {
          setError(camelData.error);
        } else {
          setCamels(camelData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("An error occurred while fetching data.");
      }
    };

    fetchData();
  }, [userId]);

  const fetchCamels = async () => {
    try {
      const response = await fetch(`/api/camels/${userId}`);
      const camelData = await response.json();
      if (camelData.error) {
        setError(camelData.error);
      } else {
        setCamels(camelData);
      }
    } catch (error) {
      console.error("Error fetching camels:", error);
      setError("An error occurred while fetching camels.");
    }
  };

  const handleAddCamel = (newCamel: Camel) => {
    setCamels((prevCamels) => [...prevCamels, newCamel]);
  };

  const handleEditCamel = (camel: Camel) => {
    setEditingCamel(camel);
    setShowEditCamelForm(true);
  };

  const handleUpdateCamel = async (camel: Camel) => {
    try {
      const response = await fetch(`/api/camels/${camel.id}/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(camel),
      });
      if (response.ok) {
        setShowEditCamelForm(false);
        setCamels(camels.map((c) => (c.id === camel.id ? camel : c)));
      }
    } catch (error) {
      console.error("Error updating camel:", error);
    }
  };

  const handleDeleteCamel = async () => {
    try {
      const response = await fetch(`/api/camels/${confirmDeleteCamel}/delete`, {
        method: "DELETE",
      });
      if (response.ok) {
        setConfirmDeleteCamel(null);
        setCamels(camels.filter((camel) => camel.id !== confirmDeleteCamel));
      }
    } catch (error) {
      console.error("Error deleting camel:", error);
    }
  };

  const handleToggleCamelDisabled = async (camel: Camel) => {
    try {
      const payload = {
        name: camel.name,
        camelID: camel.camelID,
        age: camel.age,
        sex: camel.sex,
        ownerId: camel.ownerId || user?.id,
        disabled: !camel.disabled,
      };

      const response = await fetch(`/api/camels/${camel.id}/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setCamels((prev) => prev.map((c) => c.id === camel.id ? { ...c, disabled: !camel.disabled } : c));
      }
    } catch (error) {
      console.error("Error toggling camel disabled state:", error);
    }
  };

  const handleUpdateUser = async () => {
    if (updatedUser && user) {
      if (updatedUser.BDate) {
        const isValidDate = !isNaN(Date.parse(updatedUser.BDate));
      }

      try {
        let hashedPassword = updatedUser.password;
        if (updatedUser.password && updatedUser.password !== user.password) {
          hashedPassword = await bcryptjs.hash(updatedUser.password, 10);
        }

        const response = await fetch(`/api/users/${user.id}/update`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...updatedUser, password: hashedPassword }),
        });

        const result = await response.json();

        if (response.ok) {
          setUser((prevUser: any) => ({ ...prevUser, ...updatedUser }));
          setShowEditUserForm(false);
        }
      } catch (error) {
        console.error("Error updating user:", error);
      }
    }
  };

  const handleTransfer = async (newOwnerId: string) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("! الرجاء تسجيل الدخول");
        router.push("/auth/login");
        return;
      }

      const response = await fetch('/api/camels/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          camelId: selectedCamelForTransfer?.id,
          newOwnerId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      // Refresh camels after successful transfer
      fetchCamels();
      setIsTransferModalOpen(false);
      setSelectedCamelForTransfer(null);

    } catch (error) {
      console.error("Error transferring camel:", error);
      setError("حدث خطأ أثناء نقل ملكية الجمل");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center  bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[full] max-w-xl">
        <div className="flex justify-between items-center">
          <button
            onClick={onClose}
            className="mt-4 bg-gray-500 text-white p-2 rounded mb-5"
          >
            <IoIosClose size={24} />
          </button>

          <Button
            variant="outline"
            onClick={() => setShowEditUserForm(true)}
            className="ml-2"
          >
            <MdEdit className="mr-2" size={18} /> تعديل بيانات المستخدم
          </Button>
        </div>
        <hr />
        <h2 className="text-xl font-bold mb-4 mt-4 text-center  ">
          بيانات المستخدم
        </h2>
        <hr className="mb-3 " />
        {user ? (
          <div className="text-end ">
            <p>
              <strong>الاسم الأول :</strong> {user.FirstName}
            </p>
            <p>
              <strong>اسم الاب :</strong> {user.FatherName}
            </p>
            <p>
              <strong> اسم الجد :</strong> {user.GrandFatherName}
            </p>
            <p>
              <strong> اسم العائلة :</strong> {user.FamilyName}
            </p>
            <p>
              <strong>اسم المستخدم : </strong> {user.username}
            </p>
            <p className="text-end">
              {user.email}
              <strong> : الجيميل </strong>{" "}
            </p>
            <p>
              <strong> الرقم الوطني : </strong> {user.NationalID}
            </p>
            <p>
              <strong>تاريخ الميلاد :</strong>{" "}
              {user.BDate
                ? user.BDate.toString().split("T")[0]
                : "لم يتم تحديد تاريخ الميلاد"}
            </p>
            <p>
              <strong> رقم الهاتف :</strong> {user.MobileNumber}
            </p>
            <hr className="m-4" />
            <div className="mt-4">
              <Button onClick={() => setShowAddCamelForm(true)}>
                إضافة جمل
              </Button>

              {showAddCamelForm && (
                <AddCamelsForm
                  className="mt-0"
                  userId={user.id}
                  onClose={() => {
                    fetchCamels();
                    setShowAddCamelForm(false);
                  }}
                  onAddCamel={handleAddCamel}
                  onUpdateCamel={handleUpdateCamel}
                  editingCamel={editingCamel}
                />
              )}
            </div>
            <div className="flex items-center justify-between mt-6">
              <h3 className="text-lg font-semibold text-right w-full">
                المطايا الخاص بي
              </h3>
            </div>
            <div className="max-h-80 overflow-y-auto">
              <Table className="container text-right mt-4" id="myCamels">
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم الجمل</TableHead>
                    <TableHead>الجنس</TableHead>
                    <TableHead>عمر الجمل</TableHead>
                    <TableHead>العمليات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {camels.map((camel) => (
                    <TableRow key={camel.id}>
                      <TableCell>{camel.name}</TableCell>
                      <TableCell>{translateSex(camel.sex)}</TableCell>
                      <TableCell>{translateAge(camel.age)}</TableCell>
                      <TableCell className="flex items-center justify-end gap-2 flex-nowrap">
                        <Button
                          variant="outline"
                          className="mr-2"
                          onClick={() => handleToggleCamelDisabled(camel)}
                        >
                          {camel.disabled ? "تفعيل" : "تعطيل"}
                        </Button>
                        <Button
                          variant="outline"
                          className="mr-2"
                          onClick={() => {
                            setSelectedCamelForTransfer(camel);
                            setIsTransferModalOpen(true);
                          }}
                        >
                          نقل الملكية
                        </Button>
                        <Button
                          variant="outline"
                          className="mr-2"
                          onClick={() => handleEditCamel(camel)}
                        >
                          <MdEdit />
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setConfirmDeleteCamel(camel.id)}
                        >
                          <MdDelete />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {editingCamel && (
              <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50 overflow-auto">
                <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg mx-4 md:mx-0">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                    تعديل الجمل
                  </h2>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (editingCamel) {
                        handleUpdateCamel(editingCamel);
                      }
                    }}
                    className="space-y-4"
                  >
                    <label className="block">
                      <span className="text-gray-700 font-medium">الاسم:</span>
                      <input
                        type="text"
                        value={editingCamel.name}
                        onChange={(e) =>
                          setEditingCamel({
                            ...editingCamel,
                            name: e.target.value,
                          })
                        }
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-opacity-50"
                      />
                    </label>
                    <label className="block">
                      <span className="text-gray-700 font-medium">
                        ID الجمل:
                      </span>
                      <input
                        type="text"
                        value={editingCamel.camelID}
                        onChange={(e) =>
                          setEditingCamel({
                            ...editingCamel,
                            camelID: e.target.value,
                          })
                        }
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-opacity-50"
                      />
                    </label>
                    <label className="block">
                      <span className="text-gray-700 font-medium">العمر:</span>
                      <select
                        value={editingCamel.age}
                        onChange={(e) =>
                          setEditingCamel({
                            ...editingCamel,
                            age: e.target.value,
                          })
                        }
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-opacity-50"
                      >
                        <option value="">اختر العمر</option>
                        <option value="GradeOne">مفرد</option>
                        <option value="GradeTwo">حقايق</option>
                        <option value="GradeThree">لقايا</option>
                        <option value="GradeFour">جذاع</option>
                        <option value="GradeFive">ثنايا</option>
                        <option value="GradeSixMale">زمول</option>
                        <option value="GradeSixFemale">حيل</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-gray-700 font-medium">النوع:</span>
                      <select
                        value={editingCamel.sex}
                        onChange={(e) =>
                          setEditingCamel({
                            ...editingCamel,
                            sex: e.target.value,
                          })
                        }
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-opacity-50"
                      >
                        <option value="">اختر النوع</option>
                        <option value="Male">قعدان</option>
                        <option value="Female">بكار</option>
                      </select>
                    </label>
                    <div className="flex justify-end space-x-4">
                      <Button
                        onClick={() => {
                          alert("تم تحديث الجمل بنجاح الرجاء الخروج");
                        }}
                        type="submit"
                        className="bg-gray-800 text-white "
                      >
                        تحديث الجمل
                      </Button>
                      <Button
                        onClick={() => {
                          setShowEditCamelForm(false);
                          setEditingCamel(null);
                        }}
                        variant="destructive"
                        className="bg-red-500 text-white hover:bg-red-600"
                      >
                        إلغاء
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {confirmDeleteCamel && (
              <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50 overflow-auto pt-6">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md ">
                  <h2 className="text-xl font-bold mb-4">تأكيد الحذف</h2>
                  <p className="mb-3">هل أنت متأكد أنك تريد حذف هذا الجمل؟</p>
                  <Button
                    onClick={() => {
                      handleDeleteCamel();
                      setConfirmDeleteCamel(null);
                    }}
                    variant="destructive"
                  >
                    حذف
                  </Button>
                  <Button
                    onClick={() => setConfirmDeleteCamel(null)}
                    variant="secondary"
                    className="ml-2 "
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            )}

            {showEditUserForm && (
              <div className="fixed inset-0 flex items-center  justify-center bg-gray-800 bg-opacity-50 z-50 overflow-y-auto pt-5">
                <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg mt-20">
                  <h3 className="text-xl font-bold text-gray-800 text-center mb-6">
                    تعديل بيانات المستخدم
                  </h3>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleUpdateUser();
                    }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <label className="block">
                        <span className="text-gray-700"> : اسم الاب</span>
                        <input
                          type="text"
                          value={updatedUser?.FatherName || user.FatherName}
                          onChange={(e) =>
                            setUpdatedUser((prev) => ({
                              ...prev,
                              FatherName: e.target.value,
                            }))
                          }
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-end p-2 "
                        />
                      </label>
                      <label className="block">
                        <span className="text-gray-700"> : الاسم الاول</span>
                        <input
                          type="text"
                          value={updatedUser?.FirstName || user.FirstName}
                          onChange={(e) =>
                            setUpdatedUser((prev) => ({
                              ...prev,
                              FirstName: e.target.value,
                            }))
                          }
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-end p-2 "
                        />
                      </label>

                      <label className="block">
                        <span className="text-gray-700"> : اسم العائلة</span>
                        <input
                          type="text"
                          value={updatedUser?.FamilyName || user.FamilyName}
                          onChange={(e) =>
                            setUpdatedUser((prev) => ({
                              ...prev,
                              FamilyName: e.target.value,
                            }))
                          }
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-end p-2 "
                        />
                      </label>
                      <label className="block">
                        <span className="text-gray-700"> : اسم الجد</span>
                        <input
                          type="text"
                          value={
                            updatedUser?.GrandFatherName || user.GrandFatherName
                          }
                          onChange={(e) =>
                            setUpdatedUser((prev) => ({
                              ...prev,
                              GrandFatherName: e.target.value,
                            }))
                          }
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-end p-2 "
                        />
                      </label>
                    </div>
                    <label className="block">
                      <span className="text-gray-700"> : اسم المستخدم</span>
                      <input
                        type="text"
                        value={updatedUser?.username || user.username}
                        onChange={(e) =>
                          setUpdatedUser((prev) => ({
                            ...prev,
                            username: e.target.value,
                          }))
                        }
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-end p-2 "
                      />
                    </label>
                    <label className="block">
                      <span className="text-gray-700">
                        {" "}
                        : البريد الإلكتروني
                      </span>
                      <input
                        type="email"
                        value={updatedUser?.email || user.email}
                        onChange={(e) =>
                          setUpdatedUser((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-end p-2 "
                      />
                    </label>
                    <label className="block">
                      <span className="text-gray-700"> : الرقم الوطني</span>
                      <input
                        type="text"
                        value={updatedUser?.NationalID || user.NationalID}
                        onChange={(e) =>
                          setUpdatedUser((prev) => ({
                            ...prev,
                            NationalID: e.target.value,
                          }))
                        }
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-end p-2 "
                      />
                    </label>
                    <label className="block">
                      <span className="text-gray-700"> : كلمة السر</span>
                      <input
                        type="text"
                        value={updatedUser?.password || ""}
                        onChange={(e) =>
                          setUpdatedUser((prev) => ({
                            ...prev,
                            password: e.target.value,
                          }))
                        }
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-end p-2 "
                      />
                    </label>
                    <label className="block">
                      <span className="text-gray-700"> : تاريخ الميلاد</span>
                      <input
                        type="date"
                        defaultValue={user.BDate.toString().split("T")[0]}
                        onChange={(e) =>
                          setUpdatedUser((prev) => ({
                            ...prev,
                            BDate: new Date(e.target.value).toISOString(),
                          }))
                        }
                        className="mt-1 block w-full text-end border-gray-300 rounded-md shadow-sm p-2 "
                      />
                    </label>
                    <label className="block">
                      <span className="text-gray-700"> : رقم الهاتف </span>
                      <input
                        type="text"
                        value={updatedUser?.MobileNumber || user.MobileNumber}
                        onChange={(e) =>
                          setUpdatedUser((prev) => ({
                            ...prev,
                            MobileNumber: e.target.value,
                          }))
                        }
                        className="mt-1 block w-full text-end border-gray-300 rounded-md shadow-sm p-2 "
                      />
                    </label>
                    <div className="grid grid-cols-2  gap-4">
                      <label className="block">
                        <span className="text-gray-700"> : رقم الآيبان</span>
                        <input
                          type="text"
                          value={updatedUser?.IBAN || user.IBAN}
                          onChange={(e) =>
                            setUpdatedUser((prev) => ({
                              ...prev,
                              IBAN: e.target.value,
                            }))
                          }
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-end p-2 "
                        />
                      </label>

                      <label className="block">
                        <span className="text-gray-700"> : رمز السويفت </span>
                        <input
                          type="text"
                          value={updatedUser?.swiftCode || user.swiftCode}
                          onChange={(e) =>
                            setUpdatedUser((prev) => ({
                              ...prev,
                              swiftCode: e.target.value,
                            }))
                          }
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-end p-2 "
                        />
                      </label>
                    </div>
                    <label className="block  ">
                      <span className="text-gray-700 "> : اسم البنك</span>
                      <input
                        type="text"
                        value={updatedUser?.bankName || user.bankName}
                        onChange={(e) =>
                          setUpdatedUser((prev) => ({
                            ...prev,
                            bankName: e.target.value,
                          }))
                        }
                        className="mt-1 block w-full item border-gray-300 rounded-md shadow-sm text-end p-2  "
                      />
                    </label>
                    <div className="flex justify-between mt-6">
                      <Button
                        type="submit"
                        className=" text-white p-2 rounded-md shadow"
                      >
                        حفظ التعديلات
                      </Button>
                      <Button
                        onClick={() => setShowEditUserForm(false)}
                        variant="outline"
                        className="bg-gray-200 p-2 rounded-md shadow"
                      >
                        الغاء
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <p>جاري التحميل ...</p>
          </div>
        )}
      </div>
      {selectedCamelForTransfer && (
        <TransferCamelModal
          isOpen={isTransferModalOpen}
          onClose={() => {
            setIsTransferModalOpen(false);
            setSelectedCamelForTransfer(null);
          }}
          camel={{ ...selectedCamelForTransfer, id: selectedCamelForTransfer.id.toString() }}
          onTransfer={handleTransfer}
        />
      )}
    </div>
  );
};

export default UserDetails;

