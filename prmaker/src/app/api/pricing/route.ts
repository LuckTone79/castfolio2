import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export async function GET() {
  let user: Awaited<ReturnType<typeof requireUser>>;
  try { user = await requireUser(); } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const packages = await prisma.productPackage.findMany({
    where: { userId: user.id, isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      pricingVersions: { where: { isActive: true }, orderBy: { versionNumber: "desc" }, take: 1 },
      revisionPolicy: true,
    },
  });

  return NextResponse.json({ packages });
}

export async function POST(request: Request) {
  let user: Awaited<ReturnType<typeof requireUser>>;
  try { user = await requireUser(); } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, description, basePrice } = body;

  if (!name || !basePrice) {
    return NextResponse.json({ error: "이름과 기본가는 필수입니다." }, { status: 400 });
  }

  const count = await prisma.productPackage.count({ where: { userId: user.id } });

  const pkg = await prisma.productPackage.create({
    data: {
      userId: user.id,
      name,
      description: description || null,
      sortOrder: count,
      pricingVersions: {
        create: {
          versionNumber: 1,
          basePrice,
          isActive: true,
        },
      },
    },
    include: { pricingVersions: true },
  });

  await logAudit({ actorId: user.id, actorRole: user.role, action: "CREATE_PACKAGE", targetType: "ProductPackage", targetId: pkg.id, after: { name, basePrice } });

  return NextResponse.json(pkg, { status: 201 });
}
