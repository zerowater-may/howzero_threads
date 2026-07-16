"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createProposal, type ProposalLineInput } from "@/lib/actions/proposals";

interface Row {
  label: string;
  role: string;
  manMonths: string;
  unitPrice: string;
}
export interface DealOption {
  id: number;
  label: string;
}

function emptyRow(label = ""): Row {
  return { label, role: "", manMonths: "", unitPrice: "" };
}

function won(n: number): string {
  return n.toLocaleString("ko-KR");
}

// 제안 라인아이템 입력 — 클라이언트 컴포넌트. 행 추가/삭제 + 합계 실시간. 프리필 라벨은 회사 병목에서.
export function ProposalForm({
  companyId,
  deals,
  prefillLabels,
}: {
  companyId: number;
  deals: DealOption[];
  prefillLabels: string[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [dealId, setDealId] = useState("");
  const [rows, setRows] = useState<Row[]>(
    prefillLabels.length ? prefillLabels.map((l) => emptyRow(l)) : [emptyRow()]
  );

  function setRow(i: number, patch: Partial<Row>) {
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  const lineAmount = (r: Row) => (Number(r.manMonths) || 0) * (Number(r.unitPrice) || 0);
  const mmTotal = rows.reduce((s, r) => s + (Number(r.manMonths) || 0), 0);
  const total = rows.reduce((s, r) => s + lineAmount(r), 0);

  function submit() {
    const lineItems: ProposalLineInput[] = rows
      .filter((r) => r.label.trim())
      .map((r) => ({
        label: r.label,
        role: r.role,
        manMonths: Number(r.manMonths) || 0,
        unitPrice: Number(r.unitPrice) || 0,
      }));
    if (lineItems.length === 0) return;
    start(async () => {
      await createProposal(companyId, dealId ? Number(dealId) : null, lineItems);
      setOpen(false);
      setRows([emptyRow()]);
      setDealId("");
      router.refresh();
    });
  }

  const cols = "grid grid-cols-[1fr_88px_64px_104px_96px_32px] gap-2 items-center";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">+ 새 제안</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>새 제안 (M/M 견적)</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {deals.length > 0 && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="proposalDeal">연결 딜 (선택)</Label>
              <select
                id="proposalDeal"
                value={dealId}
                onChange={(e) => setDealId(e.target.value)}
                className="h-9 rounded-md border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring"
              >
                <option value="">연결 안 함</option>
                {deals.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <div className={`${cols} text-xs text-muted-foreground`}>
              <span>항목</span>
              <span>역할</span>
              <span>M/M</span>
              <span>단가</span>
              <span className="text-right">금액</span>
              <span />
            </div>
            {rows.map((r, i) => (
              <div key={i} className={cols}>
                <Input value={r.label} onChange={(e) => setRow(i, { label: e.target.value })} placeholder="자동화 항목" />
                <Input value={r.role} onChange={(e) => setRow(i, { role: e.target.value })} placeholder="역할" />
                <Input value={r.manMonths} onChange={(e) => setRow(i, { manMonths: e.target.value })} inputMode="decimal" placeholder="0" />
                <Input value={r.unitPrice} onChange={(e) => setRow(i, { unitPrice: e.target.value })} inputMode="numeric" placeholder="0" />
                <span className="text-right font-mono text-sm">{won(lineAmount(r))}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-muted-foreground"
                  onClick={() => setRows((rs) => (rs.length > 1 ? rs.filter((_, idx) => idx !== i) : rs))}
                >
                  ×
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="self-start" onClick={() => setRows((rs) => [...rs, emptyRow()])}>
              + 행 추가
            </Button>
          </div>

          <div className="flex items-center justify-end gap-6 border-t border-border pt-3 text-sm">
            <span className="text-muted-foreground">
              합계 M/M <span className="font-mono text-foreground">{won(mmTotal)}</span>
            </span>
            <span className="text-muted-foreground">
              금액 <span className="font-mono text-base text-foreground">{won(total)}원</span>
            </span>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={pending || total <= 0}>
            제안 생성
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
