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

  return (
    <div className="min-h-dvh flex flex-col">
      <Topbar
        userName={session.user.name ?? session.user.email ?? "Comandante"}
        unreadCount={0}
      />
      <div className="flex-1 px-5 py-6">{children}</div>
    </div>
  );
}
