import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
export const dynamic = 'force-dynamic';
export const revalidate = 0;
const JWT_SECRET = process.env.JWT_SECRET || "defualt-secret-key";

export async function GET(request: Request) {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    if (!decoded?.id) {
      return NextResponse.json(
        { error: "الرجاء تسجيل الدخول" },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        FirstName: true,
        FatherName: true,
        GrandFatherName: true,
        FamilyName: true,
        username: true,
        email: true,
        NationalID: true,
        BDate: true,
        MobileNumber: true,
        image: true,
        role: true,
        swiftCode: true,
        IBAN: true,
        bankName: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "No user found" }, { status: 401 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Error verifying token:", error);
    return NextResponse.json({ error: "الرجاء تسجيل الدخول" }, { status: 401 });
  }
}
