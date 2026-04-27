import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { userType, packages } = body;

  // Update user type
  await prisma.user.update({ where: { id: user.id }, data: { userType } });

  // Create default packages
  if (packages?.length > 0) {
    await Promise.all(packages.map((pkg: { name: string; price: number; description?: string }, i: number) =>
      prisma.productPackage.create({
        data: {
          userId: user.id,
          name: pkg.name,
          description: pkg.description,
          isTemplate: true,
          isActive: true,
          sortOrder: i,
          pricingVersions: {
            create: {
              versionNumber: 1,
              basePrice: pkg.price,
              isActive: true,
            },
          },
        },
      })
    ));
  }

  return NextResponse.json({ ok: true });
}
