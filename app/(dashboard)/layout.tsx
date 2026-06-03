import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Topbar } from "@/components/squad/topbar";
import { BottomTabBar } from "@/components/squad/bottom-tab-bar";
import { countUnread } from "@/lib/queries/notification";

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
  const unreadCount = session.user.id
    ? await countUnread(session.user.id)
    : 0;

  return (
    <div className="min-h-dvh flex flex-col">
      <Topbar
        userName={session.user.name}
        userEmail={session.user.email}
        unreadCount={unreadCount}
        isAdmin={isAdmin}
      />
      <main className="flex-1 px-4 sm:px-5 py-5 sm:py-6 pb-24 lg:pb-6">
        <div className="max-w-[1320px] mx-auto w-full">{children}</div>
      </main>
      <BottomTabBar />
    </div>
  );
}
