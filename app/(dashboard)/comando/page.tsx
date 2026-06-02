import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/squad/page-header";
import { HealthBar } from "@/components/squad/health-bar";
import { getGreeting } from "@/lib/greeting";
import { ComandoContent } from "./comando-content";

/*
  Comando Central — page (server).
  Fetcha sessao + computa greeting + entrega mock data ao client island.
  Dados reais entram na Sprint 4 (substituir constantes MOCK_* por queries
  Prisma).
*/

export const metadata = {
  title: "Comando Central — Squad Five",
};

const MOCK_HEALTH = {
  total: 31,
  emCampo: 19,
  atencao: 10,
  baixaIminente: 2,
  extracao: 0,
};

const MOCK_KPIS = {
  clientesAtivos: 31,
  tasksMedia: 65,
  entregasMedia: 70,
  gapsAbertos: 7,
  gapsCriticos: 6,
};

const MOCK_BAIXAS = [
  {
    id: "1",
    name: "Igor José Pinto",
    initials: "IJ",
    subtitle: "Semana 6 · Campanha ativa",
    health: "baixa_iminente" as const,
    priority: 1,
    progress: 44,
    progressLabel: "4/9 entregáveis",
    progressPercentDisplay: "44%",
    tags: ["1 crit."],
    avatarGradient: "casualty" as const,
  },
  {
    id: "2",
    name: "Daniele Souza",
    initials: "DS",
    subtitle: "Semana 6 · Campanha ativa",
    health: "baixa_iminente" as const,
    priority: 3,
    progress: 89,
    progressLabel: "8/9 entregáveis",
    progressPercentDisplay: "89%",
    tags: ["1 gap", "1 crit."],
    avatarGradient: "casualty" as const,
  },
];

const MOCK_ATENCAO = [
  {
    id: "3",
    name: "Luiz Maranhão",
    initials: "LM",
    subtitle: "Semana 6 · Campanha pausada",
    health: "atencao" as const,
    priority: 3,
    progress: 89,
    progressLabel: "8/9 entregáveis",
    progressPercentDisplay: "89%",
    avatarGradient: "bronze" as const,
  },
  {
    id: "4",
    name: "Brenda Veras",
    initials: "BV",
    subtitle: "Semana 7 · Campanha ativa",
    health: "atencao" as const,
    priority: 2,
    progress: 78,
    progressLabel: "7/9 entregáveis",
    progressPercentDisplay: "78%",
    avatarGradient: "bronze" as const,
  },
  {
    id: "5",
    name: "Rodrigo Sirahata",
    initials: "RS",
    subtitle: "Semana 7 · Campanha ativa",
    health: "atencao" as const,
    priority: 2,
    progress: 89,
    progressLabel: "8/9 entregáveis",
    progressPercentDisplay: "89%",
    avatarGradient: "bronze" as const,
  },
];

const MOCK_TOP_OPS = [
  { id: "t1", label: "Carla Portela", primary: 92, secondary: 88, trailing: "92%" },
  { id: "t2", label: "Thaís Queiroz", primary: 89, secondary: 91, trailing: "89%" },
  { id: "t3", label: "Dhouglas Lima", primary: 78, secondary: 70, trailing: "78%" },
  { id: "t4", label: "Pereira da Costa", primary: 67, secondary: 60, trailing: "67%" },
  { id: "t5", label: "Renata Ruban", primary: 100, secondary: 95, trailing: "100%" },
  { id: "t6", label: "Brenda Veras", primary: 78, secondary: 65, trailing: "78%" },
];

const MOCK_BRIEFINGS_HOJE = [
  { id: "b1", time: "10:00", recruit: "Veras e Saraiva", duration: 30 },
  { id: "b2", time: "11:30", recruit: "Albrechete Marketing", duration: 45 },
  { id: "b3", time: "14:00", recruit: "Pereira da Costa", duration: 60 },
  { id: "b4", time: "15:30", recruit: "Renata Ruban", duration: 30 },
];

const MOCK_PRODUTOS = [
  {
    id: "p1",
    name: "Estruturação",
    activeCount: 18,
    stats: { saudaveis: 11, atencao: 5, criticos: 2, avancaram: 3 },
    tasksProgress: { done: 47, total: 162 },
    highlight: { name: "Carla Portela", tag: "E3", pct: 92 },
  },
  {
    id: "p2",
    name: "Alavancagem",
    activeCount: 9,
    stats: { saudaveis: 6, atencao: 3, criticos: 0, avancaram: 1 },
    tasksProgress: { done: 22, total: 54 },
    highlight: { name: "Thaís Queiroz", tag: "A2", pct: 89 },
  },
  {
    id: "p3",
    name: "E3 Light",
    activeCount: 4,
    stats: { saudaveis: 2, atencao: 2, criticos: 0, avancaram: 0 },
    tasksProgress: { done: 9, total: 28 },
    highlight: { name: "Veras e Saraiva", tag: "E1", pct: 32 },
  },
];

const MOCK_SAUDE_MEDIA = 62;

function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

export default async function ComandoCentralPage() {
  const session = await auth();
  const firstName =
    session?.user?.name?.split(" ")[0] ??
    session?.user?.email?.split("@")[0] ??
    "Comandante";
  const { salute, callToBriefing } = getGreeting(firstName);

  const now = new Date();
  const weekStart = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
  const weekRange = `${formatShortDate(weekStart)} a ${formatShortDate(now)}`;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={salute}
        subtitle={callToBriefing}
        updatedAt={now}
        live
      />

      <HealthBar {...MOCK_HEALTH} label="Recrutas em campo" />

      <ComandoContent
        kpis={MOCK_KPIS}
        saudeMedia={MOCK_SAUDE_MEDIA}
        topOperacoes={MOCK_TOP_OPS}
        baixas={MOCK_BAIXAS}
        atencao={MOCK_ATENCAO}
        briefingsHoje={MOCK_BRIEFINGS_HOJE}
        produtos={MOCK_PRODUTOS}
        weekRange={weekRange}
      />
    </div>
  );
}
