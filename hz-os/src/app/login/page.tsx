import { redirect } from "next/navigation";
import { checkPassword, isStaff, setStaffSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

async function login(formData: FormData): Promise<void> {
  "use server";
  const password = String(formData.get("password") || "");
  if (!checkPassword(password)) {
    redirect("/login?error=1");
  }
  await setStaffSession();
  redirect("/");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isStaff()) redirect("/");
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center px-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="display text-2xl">hz-os</CardTitle>
          <CardDescription>howzero AX 프로젝트 포털에 로그인해 주세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={login} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input id="password" name="password" type="password" autoFocus required />
            </div>
            {error && (
              <p className="text-sm text-destructive">비밀번호가 올바르지 않습니다.</p>
            )}
            <Button type="submit" className="w-full">
              로그인
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
