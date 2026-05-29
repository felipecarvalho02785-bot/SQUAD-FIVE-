import { Topbar } from "@/components/squad/topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex flex-col">
      {/* Auth.js entrara aqui na Sprint 1 Sessao 3 para passar o usuario real. */}
      <Topbar userName="Comandante" unreadCount={0} />
      <div className="flex-1 px-5 py-6">{children}</div>
    </div>
  );
}
