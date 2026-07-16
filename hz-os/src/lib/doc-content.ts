// documents.content(JSONB) 저장 포맷 헬퍼: {format:'md', text}.
// actions/documents.ts와 actions/meetings.ts(미팅→문서 변환) 양쪽에서 재사용한다.
// "use server" 파일은 async 함수만 export 가능하므로 이 순수 함수는 별도 모듈로 둔다.
export function mdContent(text: string) {
  return { format: "md", text };
}
