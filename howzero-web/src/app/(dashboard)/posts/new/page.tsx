"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { createPostSchema, type CreatePostInput } from "@/schemas/post";
import { useCreatePost } from "@/hooks/use-posts";
import { useAccounts } from "@/hooks/use-accounts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

export default function NewPostPage() {
  const router = useRouter();
  const { data: accounts } = useAccounts();
  const createPost = useCreatePost();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreatePostInput>({
    resolver: zodResolver(createPostSchema),
    defaultValues: { mediaType: "TEXT" },
  });

  const onSubmit = (data: CreatePostInput) => {
    createPost.mutate(data, {
      onSuccess: () => {
        toast.success("포스트가 예약되었습니다");
        router.push("/posts");
      },
      onError: () => toast.error("예약에 실패했습니다"),
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">새 포스트</h1>

      <Card>
        <CardHeader>
          <CardTitle>포스트 작성</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>계정</Label>
              <Select
                onValueChange={(v) => setValue("accountId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="계정 선택" />
                </SelectTrigger>
                <SelectContent>
                  {accounts?.map(
                    (a: { id: string; username: string }) => (
                      <SelectItem key={a.id} value={a.id}>
                        @{a.username}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              {errors.accountId && (
                <p className="text-sm text-destructive">
                  {errors.accountId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>내용</Label>
              <Textarea
                rows={4}
                placeholder="포스트 내용을 입력하세요"
                {...register("text")}
              />
              {errors.text && (
                <p className="text-sm text-destructive">
                  {errors.text.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>미디어 유형</Label>
              <Select
                defaultValue="TEXT"
                onValueChange={(v) =>
                  setValue(
                    "mediaType",
                    v as "TEXT" | "IMAGE" | "VIDEO" | "CAROUSEL"
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEXT">텍스트</SelectItem>
                  <SelectItem value="IMAGE">이미지</SelectItem>
                  <SelectItem value="VIDEO">동영상</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>이미지 URL (선택)</Label>
              <Input
                placeholder="https://..."
                {...register("imageUrl")}
              />
            </div>

            <div className="space-y-2">
              <Label>예약 시간</Label>
              <Input
                type="datetime-local"
                {...register("scheduledAt")}
              />
              {errors.scheduledAt && (
                <p className="text-sm text-destructive">
                  {errors.scheduledAt.message}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={createPost.isPending}
              >
                {createPost.isPending ? "예약 중..." : "예약하기"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                취소
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
