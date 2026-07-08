import { describe, expect, it } from "vitest";
import { parseLeadJson, looksLikeContact } from "./prompt";

describe("parseLeadJson", () => {
  it("parses clean JSON", () => {
    const r = parseLeadJson('{"contact":"010-1234-5678","name":"김대표","company":null,"pain_summary":"CS 자동화"}');
    expect(r).toEqual({ contact: "010-1234-5678", name: "김대표", company: null, pain_summary: "CS 자동화" });
  });

  it("parses JSON wrapped in code fence + chatter", () => {
    const r = parseLeadJson('추출 결과입니다:\n```json\n{"contact":"a@b.com","name":null,"company":"불사자","pain_summary":null}\n```');
    expect(r?.contact).toBe("a@b.com");
    expect(r?.company).toBe("불사자");
  });

  it("returns null contact when absent", () => {
    const r = parseLeadJson('{"contact":null,"name":null,"company":null,"pain_summary":"재고 고민"}');
    expect(r?.contact).toBeNull();
  });

  it("treats empty/whitespace strings as null", () => {
    const r = parseLeadJson('{"contact":"  ","name":"","company":"x","pain_summary":null}');
    expect(r?.contact).toBeNull();
    expect(r?.name).toBeNull();
  });

  it("returns null on garbage", () => {
    expect(parseLeadJson("죄송합니다, 추출할 수 없습니다.")).toBeNull();
    expect(parseLeadJson("{broken json")).toBeNull();
  });
});

describe("looksLikeContact", () => {
  it("detects email", () => {
    expect(looksLikeContact("제 메일은 ceo@store.co.kr 입니다")).toBe(true);
  });
  it("detects korean mobile", () => {
    expect(looksLikeContact("010-9876-5432로 연락주세요")).toBe(true);
    expect(looksLikeContact("01098765432")).toBe(true);
  });
  it("detects kakao id", () => {
    expect(looksLikeContact("카톡 아이디: sellerkim")).toBe(true);
  });
  it("ignores plain conversation", () => {
    expect(looksLikeContact("상세페이지 만드는 데 하루 3시간씩 씁니다")).toBe(false);
  });
});
