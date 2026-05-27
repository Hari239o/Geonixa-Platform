import bcrypt from "bcryptjs";
import { createUser } from "@/lib/services/userService";

export default async function handler(req, res) {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash("123456", 10);

    // Create user
    const user = await createUser({
      name: "Hari",
      email: `hari+${Date.now()}@gmail.com`,
      passwordHash: hashedPassword,
      role: "student",
    });

    res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
