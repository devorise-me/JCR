// // /pages/api/users/profile.ts
// import type { NextApiRequest, NextApiResponse } from "next";
// import jwt from "jsonwebtoken";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader) {
//       return res.status(401).json({ message: "No token provided" });
//     }

//     const token = authHeader.split(" ")[1];

//     // Verify JWT
//     const secret = process.env.JWT_SECRET!;
//     let decoded: any;
//     try {
//       decoded = jwt.verify(token, secret);
//     } catch (err) {
//       return res.status(401).json({ message: "Invalid token" });
//     }

//     // Get user by ID from token
//     const user = await prisma.user.findUnique({
//       where: { id: decoded.id },
//       select: {
//         id: true,
//         username: true,
//         email: true,
//         role: true,
//       },
//     });

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     return res.status(200).json(user);
//   } catch (error) {
//     console.error("Error in /api/users/profile:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// }
