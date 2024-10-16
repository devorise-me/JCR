import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useInView } from "react-intersection-observer";
import UserDetails from "../admin/ShowUserDetails";
import { Button } from "../ui/button"; // استخدام مكون Button إذا كان لديك

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
  image?: string;
  role: string;
  swiftCode: string;
  IBAN: string;
  bankName: string;
}

export const ShowUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState<string | null>(null); // للتحكم في إظهار نافذة التأكيد

  const { ref, inView } = useInView({
    threshold: 1,
    triggerOnce: false,
  });

  const fetchUsers = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/users/getUsers?page=${page}&limit=6`);
      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setUsers((prevUsers) => {
          const existingUserIds = new Set(prevUsers.map((user) => user.id));
          const newUsers = data.users.filter(
            (user: User) => !existingUserIds.has(user.id)
          );
          return [...prevUsers, ...newUsers];
        });
        setHasMore(data.hasMore);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("حدث خطأ أثناء جلب المستخدمين.");
    } finally {
      setLoading(false);
    }
  }, [page, hasMore, loading]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (inView && hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  }, [inView, hasMore]);

  const handleUserClick = (userId: string) => {
    setSelectedUserId(userId);
  };

  const handleCloseUserDetails = () => {
    setSelectedUserId(null);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/deleteUser`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
        setShowDeletePopup(null); // إغلاق الـ popup بعد الحذف
      } else {
        const data = await response.json();
        setError(data.error || "Error deleting user.");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      setError("حدث خطأ أثناء حذف المستخدم.");
    }
  };

  const confirmDeleteUser = (userId: string) => {
    setShowDeletePopup(userId); // عرض نافذة التأكيد
  };

  const cancelDelete = () => {
    setShowDeletePopup(null); // إلغاء عملية الحذف
  };

  if (error) return <p>{error}</p>;

  return (
    <div className="overflow-auto">
      {users.map((user) => (
        <div
          className="w-full h-20 flex-shrink-0 bg-white/30 rounded-lg flex flex-row-reverse items-center justify-between px-5 cursor-pointer mb-2"
          key={user.id}
          onClick={() => handleUserClick(user.id)}
        >
          <div className="flex items-center flex-row-reverse gap-2">
            <Image
              src={user.image || "/PFP.jpg"}
              alt="pfp"
              className="rounded-full h-fit"
              width={60}
              height={60}
            />
            <span className="font-semibold">{user.username}</span>
          </div>
          <button
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              onClick={(e) => {
              e.stopPropagation(); // منع فتح تفاصيل المستخدم عند الضغط على زر الحذف
              confirmDeleteUser(user.id); // فتح نافذة التأكيد
            }}
          >
            حذف
          </button>
        </div>
      ))}

      {selectedUserId && (
        <UserDetails userId={selectedUserId} onClose={handleCloseUserDetails} />
      )}

      <div ref={ref} className="loading-indicator text-center">
        {loading
          ? "Loading more users..."
          : hasMore
          ? "Scroll down for more"
          : ""}
      </div>

      {/* نافذة تأكيد الحذف */}
      {showDeletePopup && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
            <p className="text-lg text-center">هل أنت متأكد أنك تريد حذف هذا المستخدم ؟</p>
            <div className="mt-4 flex justify-between ">
              <Button 
                variant="destructive"            
                onClick={() => handleDeleteUser(showDeletePopup)}>
                نعم ، حذف
              </Button>
              <Button onClick={cancelDelete} 
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
                إلغاء
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
