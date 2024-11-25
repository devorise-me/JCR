"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { useInView } from "react-intersection-observer";
import UserDetails from "../admin/ShowUserDetails";
import { Button } from "../ui/button";
import debounce from "lodash/debounce";
import { ArrowUpDown } from "lucide-react";

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

export const ShowUsers = ({ searchTerm }: { searchTerm: string }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [initialLoad, setInitialLoad] = useState(true);

  const { ref, inView } = useInView({
    threshold: 0.5,
    rootMargin: '100px'
  });

  const fetchUsers = useCallback(async (pageNum: number) => {
    if (loading || (!hasMore && !initialLoad)) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/users/getUsers?page=${pageNum}&limit=6`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setUsers(prevUsers => {
          if (initialLoad) {
            setInitialLoad(false);
            return data.users;
          }
          const newUsers = data.users.filter(
            (newUser: User) => !prevUsers.some(existingUser => existingUser.id === newUser.id)
          );
          return [...prevUsers, ...newUsers];
        });
        setHasMore(data.users.length === 6);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("حدث خطأ أثناء جلب المستخدمين.");
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, initialLoad]);

  useEffect(() => {
    if (initialLoad) {
      fetchUsers(1);
    }
  }, [fetchUsers, initialLoad]);

  useEffect(() => {
    if (inView && !initialLoad && hasMore && !loading) {
      setPage(prevPage => {
        const nextPage = prevPage + 1;
        fetchUsers(nextPage);
        return nextPage;
      });
    }
  }, [inView, hasMore, loading, fetchUsers, initialLoad]);

  const getFullName = useCallback((user: User) => {
    return `${user.FirstName} ${user.FatherName} ${user.GrandFatherName} ${user.FamilyName}`;
  }, []);

  const debouncedSearch = useMemo(
    () =>
      debounce((searchValue: string, currentUsers: User[]) => {
        if (!searchValue.trim()) {
          setFilteredUsers(currentUsers);
          return;
        }

        const normalizedSearch = searchValue.trim().toLowerCase();
        const filtered = currentUsers.filter((user) => {
          const fullName = getFullName(user).toLowerCase();
          const email = user.email.toLowerCase();
          const username = user.username.toLowerCase();
          const mobile = user.MobileNumber;
          const nationalId = user.NationalID;

          return (
            fullName.includes(normalizedSearch) ||
            email.includes(normalizedSearch) ||
            username.includes(normalizedSearch) ||
            mobile.includes(normalizedSearch) ||
            nationalId.includes(normalizedSearch)
          );
        });
        setFilteredUsers(filtered);
      }, 300),
    [getFullName]
  );

  // Effect for search and sort
  useEffect(() => {
    const filtered = users.filter(user => {
      if (!searchTerm.trim()) return true;

      const normalizedSearch = searchTerm.trim().toLowerCase();
      const fullName = getFullName(user).toLowerCase();
      const email = user.email.toLowerCase();
      const username = user.username.toLowerCase();
      const mobile = user.MobileNumber;
      const nationalId = user.NationalID;

      return (
        fullName.includes(normalizedSearch) ||
        email.includes(normalizedSearch) ||
        username.includes(normalizedSearch) ||
        mobile.includes(normalizedSearch) ||
        nationalId.includes(normalizedSearch)
      );
    });

    const sorted = [...filtered].sort((a, b) => {
      const nameA = getFullName(a);
      const nameB = getFullName(b);
      const comparison = nameA.localeCompare(nameB, 'ar');
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    setFilteredUsers(sorted);
  }, [users, searchTerm, sortDirection, getFullName]);

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
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
        setFilteredUsers(prevFiltered => prevFiltered.filter(user => user.id !== userId));
        setShowDeletePopup(null);
      } else {
        const data = await response.json();
        setError(data.error || "Error deleting user.");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      setError("حدث خطأ أثناء حذف المستخدم.");
    }
  };

  const confirmDeleteUser = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    setShowDeletePopup(userId);
  };

  const cancelDelete = () => {
    setShowDeletePopup(null);
  };

  const toggleSort = useCallback(() => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  }, []);

  if (error) return <p className="text-red-500 p-4">{error}</p>;

  return (
    <div className="overflow-auto">
      <div className="flex justify-end mb-2">
        <Button variant="ghost" size="sm" onClick={toggleSort} className="flex items-center gap-2">
          <span>ترتيب أبجدي</span>
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      </div>
      {filteredUsers.map((user) => (
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
            <span className="font-semibold">{getFullName(user)}</span>
          </div>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            onClick={(e) => confirmDeleteUser(e, user.id)}
          >
            حذف
          </button>
        </div>
      ))}

      {selectedUserId && (
        <UserDetails userId={selectedUserId} onClose={handleCloseUserDetails} />
      )}

      <div ref={ref} className="h-10 flex items-center justify-center">
        {loading && <p>Loading more users...</p>}
      </div>

      {showDeletePopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
            <p className="text-lg text-center mb-4">
              هل أنت متأكد أنك تريد حذف هذا المستخدم ؟
            </p>
            <div className="flex justify-between gap-4">
              <Button
                variant="destructive"
                onClick={() => handleDeleteUser(showDeletePopup)}
              >
                نعم ، حذف
              </Button>
              <Button
                variant="secondary"
                onClick={cancelDelete}
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