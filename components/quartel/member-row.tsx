"use client";

import { useTransition } from "react";
import { UserRole } from "@prisma/client";
import { IconShield, IconUserCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { updateMemberRoleAction } from "@/lib/actions/template";

interface MemberRowProps {
  member: {
    id: string;
    name: string | null;
    email: string;
    role: UserRole;
    createdAt: Date;
    _count: {
      ownedOperations: number;
      assignedOrders: number;
      createdBriefings: number;
    };
  };
  currentUserId: string;
}

function getInitials(name: string | null, email: string): string {
  const src = name && name.trim() ? name : email;
  return src
    .split(/[\s@]/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function MemberRow({ member, currentUserId }: MemberRowProps) {
  const [pending, startTransition] = useTransition();
  const isSelf = member.id === currentUserId;
  const initials = getInitials(member.name, member.email);

  const nextRole =
    member.role === UserRole.ADMIN ? UserRole.OPERATOR : UserRole.ADMIN;
  const buttonLabel =
    member.role === UserRole.ADMIN ? "Rebaixar a operador" : "Promover a admin";

  return (
    <li className="flex items-center gap-3 p-3 rounded-card bg-surface-deep border border-border-default/60">
      <span
        className="w-9 h-9 rounded-md bg-gradient-to-br from-accent to-jungle-deep flex items-center justify-center text-accent-cta-fg font-display font-medium text-[12px] tracking-[0.05em]"
        aria-hidden
      >
        {initials}
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-text-primary text-[13px] font-medium truncate">
            {member.name ?? member.email}
          </span>
          {member.role === UserRole.ADMIN ? (
            <span
              className="inline-flex items-center gap-1 text-bronze text-[10px] font-display uppercase tracking-[0.08em]"
              title="Admin"
            >
              <IconShield size={11} stroke={1.5} aria-hidden />
              Admin
            </span>
          ) : null}
          {isSelf ? (
            <span className="text-text-dim text-[10px]">(você)</span>
          ) : null}
        </div>
        <p className="text-text-dim text-[11px] truncate">{member.email}</p>
      </div>

      <div className="hidden sm:flex items-center gap-4 text-[11px] font-mono text-text-secondary tabular-nums">
        <span title="Operações">{member._count.ownedOperations} op</span>
        <span title="Ordens">{member._count.assignedOrders} ord</span>
        <span title="Briefings">{member._count.createdBriefings} bf</span>
      </div>

      {!isSelf ? (
        <Button
          type="button"
          variant={member.role === UserRole.ADMIN ? "ghost" : "secondary"}
          size="sm"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await updateMemberRoleAction(member.id, nextRole);
            })
          }
        >
          <IconUserCheck size={12} aria-hidden />
          {pending ? "..." : buttonLabel}
        </Button>
      ) : null}
    </li>
  );
}
