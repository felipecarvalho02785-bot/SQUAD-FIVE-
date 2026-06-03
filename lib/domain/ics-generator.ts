/*
  Gerador de arquivo .ics (iCalendar) — RFC 5545.
  Compatível com Google Calendar, Apple Calendar, Outlook.
*/

interface IcsEvent {
  uid: string;
  start: Date;
  durationMin: number;
  summary: string;
  description?: string;
  location?: string;
  url?: string;
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function toIcsDate(date: Date): string {
  // YYYYMMDDTHHMMSSZ (UTC)
  return (
    date.getUTCFullYear().toString() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    "T" +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    "Z"
  );
}

function escapeText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function foldLine(line: string): string {
  // RFC 5545: linhas > 75 octets devem ser folded
  if (line.length <= 75) return line;
  let result = "";
  let i = 0;
  while (i < line.length) {
    const chunk = line.slice(i, i + 75);
    result += chunk;
    i += 75;
    if (i < line.length) result += "\r\n ";
  }
  return result;
}

export function generateIcs(event: IcsEvent): string {
  const dtStart = toIcsDate(event.start);
  const dtEnd = toIcsDate(
    new Date(event.start.getTime() + event.durationMin * 60_000),
  );
  const dtStamp = toIcsDate(new Date());

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Squad Five//CRM//PT-BR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.uid}@squad-five.app`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeText(event.summary)}`,
  ];

  if (event.description) {
    lines.push(`DESCRIPTION:${escapeText(event.description)}`);
  }
  if (event.location) {
    lines.push(`LOCATION:${escapeText(event.location)}`);
  }
  if (event.url) {
    lines.push(`URL:${event.url}`);
  }

  lines.push("STATUS:CONFIRMED");
  lines.push("TRANSP:OPAQUE");
  lines.push("END:VEVENT");
  lines.push("END:VCALENDAR");

  return lines.map(foldLine).join("\r\n");
}
