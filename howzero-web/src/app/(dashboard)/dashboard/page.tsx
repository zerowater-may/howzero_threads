"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, FileText, Mail, MessageSquare } from "lucide-react";
import { useDashboardStats } from "@/hooks/use-threads";

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();

  const cards = [
    {
      title: "연결된 계정",
      icon: Users,
      value: stats?.accounts,
    },
    {
      title: "예약 포스트",
      icon: FileText,
      value: stats?.posts,
    },
    {
      title: "활성 파이프라인",
      icon: MessageSquare,
      value: stats?.pipelines,
    },
    {
      title: "발송된 이메일",
      icon: Mail,
      value: stats?.emails,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">대시보드</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">
                  {card.value ?? "-"}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
