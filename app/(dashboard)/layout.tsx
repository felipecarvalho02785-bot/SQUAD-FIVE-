import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Topbar } from "@/components/squad/topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const isAdmin = session.user.role === "ADMIN";

  return (
    <div className="min-h-dvh flex flex-col">
      <Topbar
        userName={session.user.name}
        userEmail={session.user.email}
        unreadCount={0}
        isAdmin={isAdmin}
        navCounts={{
          // Placeholders ate os contadores reais virem do banco (Sprint 4)
        }}
      />
      <main className="flex-1 px-4 sm:px-5 py-5 sm:py-6">
        <div className="max-w-[1320px] mx-auto w-full">{children}</div>
      </main>
    </div>
  );
}
