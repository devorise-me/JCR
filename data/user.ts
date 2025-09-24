import { db } from "@/lib/db";
import { User } from "@prisma/client";

export const getUserByEmail = async (email: string) => {
  try {
    const normalizedEmail = email.trim();

    console.log("[getUserByEmail] Searching for email:", normalizedEmail);

    const user = await db.user.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
          mode: "insensitive",
        },
      },
    });

    if (!user) {
      console.warn("[getUserByEmail] No user found with email:", normalizedEmail);
    } else {
      console.log("[getUserByEmail] Found user:", {
        id: user.id,
        email: user.email,
        role: user.role,
      });
    }

    return user;
  } catch (error) {
    console.error("[getUserByEmail] Error:", error);
    return null;
  }
};

export const getUserById = async (id: string) => {
  try {
    console.log("[getUserById] Searching for ID:", id);

    const user = await db.user.findUnique({
      where: { id },
    });

    if (!user) {
      console.warn("[getUserById] No user found with ID:", id);
    } else {
      console.log("[getUserById] Found user:", {
        id: user.id,
        email: user.email,
        role: user.role,
      });
    }

    return user;
  } catch (error) {
    console.error("[getUserById] Error:", error);
    return null;
  }
};

export const getUser = async (): Promise<User[]> => {
  try {
    console.log("[getUser] Fetching all users with role USER");

    const users = await db.user.findMany({
      where: {
        role: "USER",
      },
    });

    console.log(`[getUser] Found ${users.length} users`);
    return users;
  } catch (error) {
    console.error("[getUser] Error:", error);
    throw new Error(`Failed to retrieve users: ${error}`);
  }
};

export const getUserRoles = async (): Promise<
  { id: string; role: string }[]
> => {
  try {
    console.log("[getUserRoles] Fetching all user roles");

    const users = await db.user.findMany({
      select: {
        id: true,
        role: true,
      },
    });

    const roles = users
      .filter((user) => user.role !== null)
      .map((user) => ({
        id: user.id,
        role: user.role as string,
      }));

    console.log(`[getUserRoles] Found ${roles.length} roles`);
    return roles;
  } catch (error) {
    console.error("[getUserRoles] Error:", error);
    throw new Error(`Failed to retrieve user roles: ${error}`);
  }
};
