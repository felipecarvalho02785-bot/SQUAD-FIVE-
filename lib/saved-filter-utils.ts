/*
  Utilitário compartilhado client+server para normalizar params de filtros
  salvos. Ordena os pares alfabeticamente e descarta vazios — permite
  comparar duas querystrings semanticamente iguais.
*/

export function normalizeFilterParams(raw: string): string {
  const trimmed = raw.trim().replace(/^\?+/, "");
  if (!trimmed) return "";
  const usp = new URLSearchParams(trimmed);
  const entries = Array.from(usp.entries())
    .filter(([k, v]) => k.length > 0 && v.length > 0)
    .sort(([a], [b]) => a.localeCompare(b));
  const sorted = new URLSearchParams();
  for (const [k, v] of entries) sorted.append(k, v);
  return sorted.toString();
}
