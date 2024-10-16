"use client";
import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useInView } from "react-intersection-observer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

export const ShowUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const { ref, inView } = useInView({
    threshold: 0.75,
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
      setError("An error occurred while fetching users.");
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

  if (error) return <p>{error}</p>;

  return (
    <div className="overflow-auto h-screen">
      <Table className="w-full" id="myUsers">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">الصورة</TableHead>
            <TableHead className="w-[200px]">الاسم الكامل</TableHead>
            <TableHead className="w-[200px]">اسم المستخدم</TableHead>
            <TableHead className="w-[200px]">البريد الإلكتروني</TableHead>
            <TableHead className="w-[200px]">رقم الجوال</TableHead>
            <TableHead className="w-[200px]">رقم الهوية</TableHead>
            <TableHead className="w-[200px]">تاريخ الميلاد</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow
              key={user.id}
              className="cursor-pointer"
              onClick={() => handleUserClick(user.id)}
            >
              <TableCell className="flex items-center justify-end">
                <Image
                  src={user.image || "/PFP.jpg"}
                  alt="profile picture"
                  className="h-fit"
                  width={60}
                  height={60}
                />
              </TableCell>
              <TableCell className="text-right">
                {`${user.FirstName} ${user.FatherName} ${user.GrandFatherName} ${user.FamilyName}`}
              </TableCell>
              <TableCell className="text-right">{user.username}</TableCell>
              <TableCell className="text-right">{user.email}</TableCell>
              <TableCell className="text-right">{user.MobileNumber}</TableCell>
              <TableCell className="text-right">{user.NationalID}</TableCell>
              <TableCell className="text-right">
                {new Date(user.BDate).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
    </div>
  );
};
