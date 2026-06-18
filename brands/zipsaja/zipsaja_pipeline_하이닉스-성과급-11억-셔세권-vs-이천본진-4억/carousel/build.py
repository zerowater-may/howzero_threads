# -*- coding: utf-8 -*-
"""집사자 캐러셀 — 하이닉스 성과급 11억 셔세권 vs 이천 본진 4억. 1080×1350."""
import os
ZD = "/.claude/skills/zipsaja-design"
OUT = os.path.dirname(os.path.abspath(__file__))
M = ZD + "/assets/mascots"

HEAD = """<!doctype html><html lang="ko"><head><meta charset="utf-8">
<link rel="stylesheet" href=\"""" + ZD + """/colors_and_type.css">
<link rel="stylesheet" href=\"""" + ZD + """/ui_kits/carousel/slide.css">
<style>
  html,body{margin:0;padding:0;}
  .zs-slide{height:1350px;padding:88px 76px 124px;}
  .src{position:absolute;left:76px;right:76px;bottom:116px;font-family:var(--ff-body);font-weight:700;font-size:18px;color:var(--fg-3);line-height:1.35;}
  .big{font-family:var(--ff-headline);letter-spacing:-2px;line-height:0.98;}
  .kicker{font-family:var(--ff-hand);font-weight:700;color:var(--fg-3);}
  .row{display:flex;align-items:center;gap:16px;}
</style></head><body>"""

def foot(pg):
    return ('<div class="zs-foot"><div class="handle"><img src="' + M +
            '/mascot-blank.png"><b>@zipsaja</b></div>'
            '<div class="right"><span class="pg">' + str(pg) + ' / 10</span><span>→</span></div></div>')

def slide(num, body, cls="", src=None):
    s = HEAD + '<section class="zs-slide ' + cls + '"><div class="zs-num">' + ('%02d' % num) + '</div>'
    s += body
    if src:
        s += '<div class="src">' + src + '</div>'
    s += foot(num) + '</section></body></html>'
    return s

SRC = "기준 · 네이버 부동산 실거래(국토부 신고가) · 2026년 거래 · 공급평형 · 성과급/셔세권 수치 보도 기준"

# 매물 카드 헬퍼
def card(name, sub, eok, ok=True):
    col = "var(--zs-yellow-deep)" if ok else "#C62828"
    return ('<div class="zs-box zs-stamp row" style="padding:18px 26px;justify-content:space-between;">'
            '<div><div style="font-family:var(--ff-headline);font-size:38px;">' + name + '</div>'
            '<div style="font-weight:700;font-size:23px;color:var(--fg-3);margin-top:2px;">' + sub + '</div></div>'
            '<div style="font-family:var(--ff-headline);font-size:46px;color:' + col + ';white-space:nowrap;">' + eok + '</div></div>')

slides = {}

# 01 Cover
slides[1] = slide(1, """
  <div style="margin-top:58px;">
    <div class="kicker" style="font-size:40px;">"반도체 다니면 집 걱정 없지~"</div>
    <h1 class="big" style="font-size:90px;margin:20px 0 26px;">
      성과급 <span class="zs-pill" style="font-size:90px;padding:4px 24px 10px;">11억</span>으로<br>동탄역 국평도<br>못 산다
    </h1>
    <div style="font-family:var(--ff-headline);font-size:42px;color:var(--fg-2);">근데 회사 옆 이천은 4억이더라 →</div>
  </div>
  <img src=\"""" + M + """/mascot-surprise.png" style="position:absolute;right:40px;bottom:180px;width:280px;height:280px;">
""", cls="")

# 02 세팅
slides[2] = slide(2, """
  <div style="margin-top:64px;">
    <div class="kicker" style="font-size:40px;">하이닉스·삼성 성과급 터졌다</div>
    <h2 style="font-family:var(--ff-headline);font-size:74px;line-height:1.16;margin:18px 0 36px;">성과급 6억 + 대출 6억<br>= 예산 <span class="zs-hl">11억</span></h2>
    <div class="zs-box-cream zs-stamp" style="padding:30px 36px;max-width:860px;">
      <div style="font-family:var(--ff-body);font-weight:700;font-size:38px;line-height:1.5;">근데 하이닉스 본진은 <b>이천</b>.<br>직원들은 셔틀 닿는 <b>'셔세권'</b>으로 간다.<br>그럼 11억으로 거기 살 수 있을까?</div>
    </div>
  </div>
  <img src=\"""" + M + """/mascot-default.png" style="position:absolute;right:44px;bottom:188px;width:260px;height:260px;">
""", cls="cream", src=SRC)

# 03 셔세권이란
slides[3] = slide(3, """
  <div style="margin-top:70px;">
    <div class="kicker" style="font-size:40px;">잠깐, 셔세권이 뭐야?</div>
    <h2 style="font-family:var(--ff-headline);font-size:72px;line-height:1.16;margin:16px 0 34px;">회사 <span class="zs-hl">셔틀버스</span><br>정차하는 단지</h2>
    <div class="zs-box zs-stamp" style="padding:32px 38px;max-width:880px;">
      <div style="font-family:var(--ff-headline);font-size:42px;line-height:1.4;">반도체 머니가 몰리면서<br>동탄 셔세권은 <span style="color:var(--zs-yellow-deep);">한 달새 4억↑</span></div>
    </div>
  </div>
  <img src=\"""" + M + """/mascot-shining.png" style="position:absolute;right:46px;bottom:188px;width:240px;height:240px;">
""", cls="", src=SRC)

# 04 안 되는 곳
slides[4] = slide(4, """
  <div style="margin-top:30px;">
    <div class="kicker" style="font-size:38px;">성과급 11억 영끌해도 ❌</div>
    <h2 style="font-family:var(--ff-headline);font-size:64px;line-height:1.14;margin:12px 0 26px;">여긴 못 가</h2>
    <div style="display:flex;flex-direction:column;gap:15px;max-width:900px;">
""" + card("판교 푸르지오그랑블","성남 분당·판교 · 37평","35.7억",False)
   + card("성복역 롯데캐슬","용인 수지 역세권 · 35평","16.3억",False)
   + card("동탄역 시범우남","화성 동탄2 역세권 · 34평","14.7억",False)
   + card("동탄역 더샵센트럴","화성 동탄2 역세권 · 34평","14.5억",False) + """
    </div>
  </div>
""", cls="cream", src=SRC)

# 05 되는 곳 1 (동탄)
slides[5] = slide(5, """
  <div style="margin-top:30px;">
    <div class="kicker" style="font-size:38px;">11억으로 되는 곳 ⭕ ① 동탄</div>
    <h2 style="font-family:var(--ff-headline);font-size:60px;line-height:1.14;margin:12px 0 24px;">동탄 셔세권</h2>
    <div style="display:flex;flex-direction:column;gap:15px;max-width:900px;">
""" + card("동탄역 헤리엇","화성 동탄2 · 2023 신축 · 34평","10.4억")
   + card("동탄역 센트럴예미지","화성 동탄2 · 2017 · 34평","9.6억")
   + card("동탄역 롯데캐슬알바트로스","화성 동탄2 역세권 · 2015 · 40평","10.7억") + """
    </div>
  </div>
""", cls="", src=SRC)

# 06 되는 곳 2 (용인·광교)
slides[6] = slide(6, """
  <div style="margin-top:30px;">
    <div class="kicker" style="font-size:38px;">11억으로 되는 곳 ⭕ ② 용인·광교</div>
    <h2 style="font-family:var(--ff-headline);font-size:60px;line-height:1.14;margin:12px 0 24px;">기흥·광교·수지</h2>
    <div style="display:flex;flex-direction:column;gap:15px;max-width:900px;">
""" + card("힐스테이트 기흥","용인 기흥역세권 · 2018 신축 · 34평","11.0억")
   + card("광교 호반베르디움","수원 광교 · 2014 · 24평","10.6억")
   + card("수지파크 푸르지오","용인 수지 · 2019 · 24평","10.5억") + """
    </div>
  </div>
""", cls="cream", src=SRC)

# 07 반전 — 본진
slides[7] = slide(7, """
  <div style="margin-top:30px;">
    <div class="kicker" style="font-size:38px;">근데 반전 — 반도체 본진은?</div>
    <h2 style="font-family:var(--ff-headline);font-size:66px;line-height:1.14;margin:12px 0 24px;">국평이 <span class="zs-hl">6억 이하</span></h2>
    <div style="display:flex;flex-direction:column;gap:15px;max-width:900px;">
""" + card("이천 설봉푸르지오","이천(하이닉스 캠퍼스) · 34평","4.1억")
   + card("평택 고덕 제일풍경채","평택 고덕(삼성) · 2019 신축 · 33평","6.0억")
   + card("광주역 e편한세상","경기 광주 역세권 · 33평","6.7억") + """
    </div>
  </div>
""", cls="", src=SRC)

# 08 한 방
slides[8] = slide(8, """
  <div style="margin-top:76px;">
    <div class="kicker" style="font-size:40px;">같은 국평인데</div>
    <h2 style="font-family:var(--ff-headline);font-size:60px;line-height:1.16;margin:14px 0 32px;">통근 거리에<br>가격이 <span class="zs-hl">8배</span></h2>
    <div class="zs-box-check zs-stamp" style="padding:40px 44px;max-width:900px;">
      <div style="font-family:var(--ff-headline);font-size:46px;line-height:1.55;">
        이천 본진 · <b>4.1억</b><br>동탄 셔세권 · <b>14.7억</b><br>판교 · <b>35.7억</b></div>
    </div>
  </div>
  <img src=\"""" + M + """/mascot-surprise.png" style="position:absolute;right:46px;bottom:186px;width:230px;height:230px;">
""", cls="", src=SRC)

# 09 면책
slides[9] = slide(9, """
  <div style="margin-top:150px;">
    <div class="kicker" style="font-size:42px;">오해 ㄴㄴ</div>
    <h2 style="font-family:var(--ff-headline);font-size:72px;line-height:1.22;margin:18px 0 0;">성과급이<br>부러운 게 아냐.<br><span class="zs-hl">반도체 머니</span>가<br>셔세권 집값을<br>올린 거지.</h2>
  </div>
  <img src=\"""" + M + """/mascot-default.png" style="position:absolute;right:46px;bottom:180px;width:240px;height:240px;">
""", cls="cream")

# 10 CTA dark
slides[10] = slide(10, """
  <div style="margin-top:108px;">
    <h2 style="font-family:var(--ff-headline);font-size:78px;line-height:1.2;color:#fff;">너라면?</h2>
    <div style="font-family:var(--ff-headline);font-size:54px;color:#fff;margin-top:30px;"><span style="color:var(--zs-yellow);">①</span> 동탄 셔세권 14억</div>
    <div style="font-family:var(--ff-headline);font-size:54px;color:#fff;margin-top:16px;"><span style="color:var(--zs-yellow);">②</span> 이천 본진 4억</div>
    <div class="zs-box-cream zs-stamp" style="display:inline-block;padding:24px 32px;margin-top:38px;">
      <div style="font-family:var(--ff-headline);font-size:38px;color:var(--zs-ink);">반도체 다니는 친구<br>태그하고 같이 싸워봐 🔥</div>
    </div>
  </div>
""", cls="dark")

for n in range(1, 11):
    with open(os.path.join(OUT, "slide-%02d.html" % n), "w", encoding="utf-8") as f:
        f.write(slides[n])
print("wrote 10 slides")
