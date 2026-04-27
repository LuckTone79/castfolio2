import { NextResponse } from "next/server";
import { getCurrentSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const sessionUser = await getCurrentSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseUid: sessionUser.id },
  });

  if (!dbUser) {
    return NextResponse.json({ error: "No DB user", code: "NO_DB_USER" }, { status: 404 });
  }

  if (dbUser.status === "SUSPENDED") {
    return NextResponse.json({ error: "Suspended", code: "SUSPENDED" }, { status: 403 });
  }

  if (dbUser.status === "DELETED") {
    return NextResponse.json({ error: "Deleted", code: "DELETED" }, { status: 403 });
  }

  return NextResponse.json({
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role,
    userType: dbUser.userType,
    status: dbUser.status,
  });
}
