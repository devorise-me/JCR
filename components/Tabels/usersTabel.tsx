"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { useInView } from "react-intersection-observer";
import debounce from "lodash/debounce";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import UserDetails from "../admin/ShowUserDetails";

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

interface ShowUsersProps {
  searchTerm: string;
}

export const ShowUsers: React.FC<ShowUsersProps> = ({ searchTerm }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const { ref, inView } = useInView();

  const getFullName = useCallback((user: User) => {
    return `${user.FirstName} ${user.FatherName} ${user.GrandFatherName} ${user.FamilyName}`;
  }, []);

  const fetchUsers = useCallback(async (pageNum: number) => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const response = await fetch(`/api/users/getUsers?page=${pageNum}&limit=6`);
      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      if (data.error) {
        setError(data.error);
        return;
      }

      // Remove duplicates based on id
      const uniqueUsers = (prevUsers: User[]) => {
        const combined = [...prevUsers, ...data.users];
        const uniqueMap = new Map(combined.map(user => [user.id, user]));
        return Array.from(uniqueMap.values());
      };

      setUsers(prevUsers => uniqueUsers(prevUsers));
      setHasMore(data.users.length === 6);
      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("حدث خطأ أثناء جلب المستخدمين.");
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore]);

  // Filter users based on search term
  const filterUsers = useCallback((searchValue: string, users: User[]) => {
    if (!searchValue.trim()) return users;

    const normalizedSearch = searchValue.trim().toLowerCase();
    return users.filter((user) => {
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
  }, [getFullName]);

  // Update filtered users whenever users or search term changes
  useEffect(() => {
    setFilteredUsers(filterUsers(searchTerm, users));
  }, [searchTerm, users, filterUsers]);

  useEffect(() => {
    fetchUsers(1);
  }, []);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      fetchUsers(page + 1);
    }
  }, [inView, hasMore, loading, page, fetchUsers]);

  const handleUserClick = useCallback((userId: string) => {
    setSelectedUserId(userId);
  }, []);

  const handleCloseUserDetails = useCallback(() => {
    setSelectedUserId(null);
  }, []);

  const toggleSort = useCallback(() => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    setFilteredUsers(prev => [...prev].sort((a, b) => {
      const nameA = getFullName(a);
      const nameB = getFullName(b);
      const comparison = nameA.localeCompare(nameB, 'ar');
      return sortDirection === 'asc' ? -comparison : comparison;
    }));
  }, [sortDirection, getFullName]);

  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className="h-full overflow-auto">
      <Table className="w-full relative" id="myUsers">
        <TableHeader className="sticky top-0 bg-gray-100 dark:bg-neutral-800 z-10">
          <TableRow>
            <TableHead>الصورة</TableHead>
            <TableHead>
              <div className="flex justify-end items-center gap-2">
                الاسم الكامل
                <Button variant="ghost" size="sm" onClick={toggleSort}>
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>
            </TableHead>
            <TableHead>اسم المستخدم</TableHead>
            <TableHead>البريد الإلكتروني</TableHead>
            <TableHead>رقم الجوال</TableHead>
            <TableHead>رقم الهوية</TableHead>
            <TableHead>تاريخ الميلاد</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow
              key={user.id}
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800"
              onClick={() => handleUserClick(user.id)}
            >
              <TableCell className="flex items-center justify-end">
                <Image
                  src={user.image || "/PFP.jpg"}
                  alt="profile picture"
                  className="rounded-full"
                  width={60}
                  height={60}
                />
              </TableCell>
              <TableCell className="text-right">{getFullName(user)}</TableCell>
              <TableCell className="text-right">{user.username}</TableCell>
              <TableCell className="text-right">{user.email}</TableCell>
              <TableCell className="text-right">{user.MobileNumber}</TableCell>
              <TableCell className="text-right">{user.NationalID}</TableCell>
              <TableCell className="text-right">
                {new Date(user.BDate).toLocaleDateString('ar')}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div ref={ref} className="p-4 text-center text-gray-500">
        {loading ? "جاري تحميل المزيد من المستخدمين..." :
          hasMore ? "قم بالتمرير لأسفل لتحميل المزيد" : ""}
      </div>

      {selectedUserId && (
        <UserDetails userId={selectedUserId} onClose={handleCloseUserDetails} />
      )}
    </div>
  );
};