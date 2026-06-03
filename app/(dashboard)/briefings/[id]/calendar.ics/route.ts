import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { generateIcs } from "@/lib/domain/ics-generator";

interface Params {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Não autorizado", { status: 401 });
  }

  const { id } = await params;
  const briefing = await prisma.briefing.findUnique({
    where: { id },
    select: {
      id: true,
      date: true,
      durationMin: true,
      notes: true,
      operation: {
        select: {
          id: true,
          codeName: true,
          recruit: { select: { name: true } },
        },
      },
    },
  });

  if (!briefing) {
    return new NextResponse("Briefing não encontrado", { status: 404 });
  }

  const baseUrl =
    process.env.AUTH_URL ?? "https://squad-five-mu.vercel.app";

  const ics = generateIcs({
    uid: briefing.id,
    start: briefing.date,
    durationMin: briefing.durationMin ?? 30,
    summary: `Briefing — ${briefing.operation.codeName}`,
    description: [
      `Recruta: ${briefing.operation.recruit.name}`,
      `Operação: ${briefing.operation.codeName}`,
      briefing.notes ? `\n${briefing.notes}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
    location: "Online — Squad Five",
    url: `${baseUrl}/operacoes/${briefing.operation.id}`,
  });

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="briefing-${briefing.id}.ics"`,
    },
  });
}
