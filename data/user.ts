import { db } from "@/lib/db";
import { User } from "@prisma/client";

export const getUserByEmail = async (email: string) => {
  try {
    const user = await db.user.findUnique({
      where: { email },
    });

    return user;
  } catch (error) {
    return null;
  }
};

export const getUserById = async (id: string) => {
  try {
    const user = await db.user.findUnique({
      where: { id },
    });

    return user;
  } catch (error) {
    return null;
  }
};

export const getUser = async (): Promise<User[]> => {
  try {
    const users = await db.user.findMany({
      where: {
        role: "USER", // Filter users by role
      },
    });

    return users;
  } catch (error) {
    throw new Error(`Failed to retrieve users: ${error}`);
  }
};

export const getUserRoles = async (): Promise<
  { id: string; role: string }[]
> => {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        role: true,
      },
    });

    return users
      .filter((user) => user.role !== null)
      .map((user) => ({
        id: user.id,
        role: user.role as string,
      }));
  } catch (error) {
    throw new Error(`Failed to retrieve user roles: ${error}`);
  }
};
