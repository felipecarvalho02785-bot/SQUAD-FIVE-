/*
  Saudacao contextual por horario.
  Referencia: docs/02_MANUAL_VOZ_E_TOM.md secao "Comando Central".
*/

export type Greeting = {
  salute: string;
  callToBriefing: string;
};

/**
 * Retorna a saudacao apropriada para o horario.
 * Como esta funcao pode rodar no server em UTC, recebe a hora local explicitamente
 * quando necessario para evitar mismatch de timezone com o cliente.
 */
export function getGreeting(name: string, hour: number = getLocalHour()): Greeting {
  if (hour < 12) {
    return {
      salute: `Bom dia, ${name}.`,
      callToBriefing: "Aqui está o briefing do dia.",
    };
  }
  if (hour < 18) {
    return {
      salute: `Boa tarde, ${name}.`,
      callToBriefing: "Operações em andamento:",
    };
  }
  return {
    salute: `Boa noite, ${name}.`,
    callToBriefing: "Status final do dia:",
  };
}

function getLocalHour(): number {
  // Server roda em UTC; usamos America/Sao_Paulo como referencia operacional.
  const fmt = new Intl.DateTimeFormat("pt-BR", {
    hour: "numeric",
    hour12: false,
    timeZone: "America/Sao_Paulo",
  });
  const hourStr = fmt.format(new Date());
  return Number.parseInt(hourStr, 10);
}
