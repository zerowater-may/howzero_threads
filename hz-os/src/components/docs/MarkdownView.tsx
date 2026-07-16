import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

// 마크다운 렌더러. 편집기 미리보기 탭과 버전 미리보기 다이얼로그에서 공용으로 쓴다.
// typography 플러그인 대신 하위 요소 셀렉터로 다크 코발트 테마에 맞춰 직접 스타일링.
const PROSE = cn(
  "text-sm leading-relaxed text-foreground/90",
  "[&_h1]:display [&_h1]:mt-6 [&_h1]:mb-3 [&_h1]:text-2xl [&_h1]:first:mt-0",
  "[&_h2]:display [&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:text-xl",
  "[&_h3]:display [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-lg",
  "[&_p]:my-3 [&_strong]:font-semibold [&_strong]:text-foreground [&_em]:italic",
  "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2",
  "[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1",
  "[&_li_input]:mr-2 [&_li:has(input)]:list-none [&_li:has(input)]:-ml-6",
  "[&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-primary/50 [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground",
  "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs",
  "[&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0",
  "[&_hr]:my-6 [&_hr]:border-border",
  "[&_table]:my-3 [&_table]:w-full [&_table]:border-collapse [&_table]:text-xs",
  "[&_th]:border [&_th]:border-border [&_th]:bg-secondary [&_th]:px-2 [&_th]:py-1 [&_th]:text-left",
  "[&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1"
);

export function MarkdownView({ text, className }: { text: string; className?: string }) {
  if (!text.trim()) {
    return <p className="text-sm text-muted-foreground">내용이 없습니다.</p>;
  }
  return (
    <div className={cn(PROSE, className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
    </div>
  );
}
