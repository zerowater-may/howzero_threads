import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  if (status === "운영") {
    return (
      <Badge className="border-[var(--ok)]/30 bg-[var(--ok)]/15 text-[var(--ok)]">{status}</Badge>
    );
  }
  return <Badge variant="secondary">{status}</Badge>;
}
