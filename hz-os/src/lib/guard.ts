import { redirect } from "next/navigation";
import { isStaff } from "@/lib/auth";

// staff 세션이 없으면 로그인으로 보낸다. 서버 컴포넌트/서버 액션 어디서든 호출.
export async function requireStaff(): Promise<void> {
  if (!(await isStaff())) redirect("/login");
}
