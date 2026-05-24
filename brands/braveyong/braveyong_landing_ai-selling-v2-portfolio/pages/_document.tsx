// Next 15.5 회귀 회피용 더미. App Router를 쓰지만 pages 라우터의 자동
// generated _document/_error fallback이 prerender 시 깨지는 케이스를 막기 위해
// 명시적인 비어있는 _document을 둔다.
import { Html, Head, Main, NextScript } from "next/document"

export default function Document() {
  return (
    <Html lang="ko">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
