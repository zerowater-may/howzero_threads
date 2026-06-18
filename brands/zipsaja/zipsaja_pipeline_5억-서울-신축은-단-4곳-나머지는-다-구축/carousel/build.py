# -*- coding: utf-8 -*-
"""집사자 캐러셀 빌더 — 5억 서울 신축 4곳뿐 / 결국 구축. 1080×1350, zipsaja-design 토큰."""
import os

ZD = "/.claude/skills/zipsaja-design"   # web root-relative (repo root를 http로 서빙)
OUT = os.path.dirname(os.path.abspath(__file__))
M = ZD + "/assets/mascots"

HEAD = """<!doctype html><html lang="ko"><head><meta charset="utf-8">
<link rel="stylesheet" href=\"""" + ZD + """/colors_and_type.css">
<link rel="stylesheet" href=\"""" + ZD + """/ui_kits/carousel/slide.css">
<style>
  html,body{margin:0;padding:0;}
  .zs-slide{height:1350px;padding:92px 80px 128px;}
  .src{position:absolute;left:80px;right:80px;bottom:118px;font-family:var(--ff-body);font-weight:700;font-size:19px;color:var(--fg-3);line-height:1.35;}
  .big{font-family:var(--ff-headline);letter-spacing:-2px;line-height:0.98;}
  .kicker{font-family:var(--ff-hand);font-weight:700;color:var(--fg-3);}
  .row{display:flex;align-items:center;gap:20px;}
</style></head><body>"""

def foot(pg):
    return ('<div class="zs-foot"><div class="handle"><img src="' + M +
            '/mascot-blank.png"><b>@zipsaja</b></div>'
            '<div class="right"><span class="pg">' + str(pg) + ' / 10</span><span>→</span></div></div>')

def slide(num, body, cls="", pg=None, src=None):
    pg = pg or num
    s = HEAD + '<section class="zs-slide ' + cls + '"><div class="zs-num">' + ('%02d' % num) + '</div>'
    s += body
    if src:
        s += '<div class="src">' + src + '</div>'
    s += foot(pg) + '</section></body></html>'
    return s

SRC = "기준 · 국토부 실거래가(proptech_db) · 서울 300세대↑ · 매매 · 2025.09~2026.06 · 4.5~5.5억 · 취소거래 제외"

slides = {}

# 01 — Cover
slides[1] = slide(1, """
  <div style="margin-top:64px;">
    <div class="kicker" style="font-size:38px;">첫집 예산 5억 · 신혼·부린이 주목</div>
    <h1 class="big" style="font-size:104px;margin:22px 0 28px;">
      5억으로 살 수 있는<br>서울 <span class="zs-pill" style="font-size:104px;padding:4px 26px 12px;">신축</span>,<br>딱 4곳이더라
    </h1>
    <div style="font-family:var(--ff-headline);font-size:46px;color:var(--fg-2);">나머지 99%는 전부 구축 →</div>
  </div>
  <img src=\"""" + M + """/mascot-surprise.png" style="position:absolute;right:44px;bottom:188px;width:300px;height:300px;">
""", cls="")

# 02 — 도입/세팅
slides[2] = slide(2, """
  <div style="margin-top:70px;">
    <div class="kicker" style="font-size:40px;">실거래 다 까봤어</div>
    <h2 style="font-family:var(--ff-headline);font-size:78px;line-height:1.16;margin:18px 0 40px;">
      첫집 5억,<br>새 아파트 살고 싶잖아.<br>근데 말이야 —
    </h2>
    <div class="zs-box-cream zs-stamp" style="padding:30px 36px;max-width:840px;">
      <div style="font-family:var(--ff-body);font-weight:700;font-size:38px;line-height:1.5;">
        서울 5억대(4.5~5.5억) 매매<br><b>2,115건</b>을 신축/구축으로 갈랐어.</div>
    </div>
  </div>
  <img src=\"""" + M + """/mascot-default.png" style="position:absolute;right:48px;bottom:200px;width:280px;height:280px;">
""", cls="cream", src=SRC)

# 03 — 충격 데이터
slides[3] = slide(3, """
  <div style="margin-top:50px;">
    <div class="kicker" style="font-size:38px;">5억대 매매 2,115건 중</div>
    <div class="big" style="font-size:240px;color:var(--zs-yellow-deep);margin:6px 0 0;">0.8%</div>
    <h2 style="font-family:var(--ff-headline);font-size:60px;line-height:1.2;margin:6px 0 30px;">신축은 단 <span class="zs-hl">17건</span></h2>
    <div class="zs-box zs-stamp row" style="padding:26px 34px;max-width:880px;">
      <div style="font-family:var(--ff-headline);font-size:40px;line-height:1.3;">
        2018년 이후 신축은<br><b>딱 4단지</b>에서만 거래됐어.</div>
    </div>
  </div>
  <img src=\"""" + M + """/mascot-surprise.png" style="position:absolute;right:48px;bottom:188px;width:260px;height:260px;">
""", cls="", src=SRC)

# 04 — 신축 4곳 리스트
def newrow(name, gu, year, eok):
    return ('<div class="zs-box zs-stamp row" style="padding:22px 30px;justify-content:space-between;">'
            '<div><div style="font-family:var(--ff-headline);font-size:42px;">' + name + '</div>'
            '<div style="font-weight:700;font-size:26px;color:var(--fg-3);margin-top:2px;">' + gu + ' · ' + str(year) + '년 준공</div></div>'
            '<div style="font-family:var(--ff-headline);font-size:50px;color:var(--zs-yellow-deep);">' + eok + '억</div></div>')
slides[4] = slide(4, """
  <div style="margin-top:26px;">
    <div class="kicker" style="font-size:38px;">5억으로 가능한 서울 신축 전부</div>
    <h2 style="font-family:var(--ff-headline);font-size:64px;line-height:1.15;margin:12px 0 30px;">이 4곳이 전부야</h2>
    <div style="display:flex;flex-direction:column;gap:16px;max-width:900px;">
""" + newrow("현대6차","노원구",2018,"5.1") + newrow("백련산해모로","은평구",2020,"5.3") + newrow("영등포중흥S클래스","영등포구",2021,"4.9") + newrow("e편한세상서대문","서대문구",2023,"5.2") + """
    </div>
  </div>
""", cls="cream", src=SRC)

# 05 — 나머지 99% = 구축, 결국 노도강
def gurow(gu, n, cplx):
    return ('<div class="row" style="justify-content:space-between;border-bottom:2px solid rgba(0,0,0,0.12);padding:14px 4px;">'
            '<div style="font-family:var(--ff-headline);font-size:42px;">' + gu + '</div>'
            '<div style="font-weight:700;font-size:30px;color:var(--fg-2);">' + str(n) + '건 · ' + str(cplx) + '단지</div></div>')
slides[5] = slide(5, """
  <div style="margin-top:36px;">
    <div class="kicker" style="font-size:38px;">그럼 나머지 99%는?</div>
    <h2 style="font-family:var(--ff-headline);font-size:72px;line-height:1.14;margin:12px 0 14px;">5억이면 <span class="zs-hl">결국 구축</span><br>그리고 거의 노·도·강</h2>
    <div style="max-width:860px;margin-top:10px;">
""" + gurow("노원구",740,52) + gurow("도봉구",289,30) + gurow("구로구",185,22) + gurow("중랑구",177,16) + gurow("강서구",139,16) + """
    </div>
    <div style="font-family:var(--ff-headline);font-size:34px;color:var(--fg-2);margin-top:20px;">구축 1,929건 · 204단지</div>
  </div>
""", cls="", src=SRC)

# 06 — 구축 대표 단지
def oldrow(name, gu, year, py):
    return ('<div class="zs-box zs-stamp row" style="padding:18px 28px;justify-content:space-between;">'
            '<div><div style="font-family:var(--ff-headline);font-size:38px;">' + name + '</div>'
            '<div style="font-weight:700;font-size:24px;color:var(--fg-3);margin-top:2px;">' + gu + ' · ' + str(year) + '년 · ' + py + '평</div></div></div>')
slides[6] = slide(6, """
  <div style="margin-top:24px;">
    <div class="kicker" style="font-size:36px;">5억 구축 대표 선수들</div>
    <h2 style="font-family:var(--ff-headline);font-size:60px;line-height:1.14;margin:10px 0 24px;">1988~1998년생 · 평균 16평</h2>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;max-width:920px;">
""" + oldrow("상계주공9단지","노원",1988,"14") + oldrow("상계주공7단지","노원",1988,"14") + oldrow("창동주공3단지","도봉",1990,"14") + oldrow("중계주공5단지","노원",1992,"14") + oldrow("구로두산","구로",1998,"14") + oldrow("도봉한신","도봉",1995,"26") + """
    </div>
  </div>
""", cls="cream", src=SRC)

# 07 — 반전 (check box)
slides[7] = slide(7, """
  <div style="margin-top:80px;">
    <div class="kicker" style="font-size:40px;">같은 5억, 같은 16평인데</div>
    <h2 style="font-family:var(--ff-headline);font-size:78px;line-height:1.16;margin:16px 0 40px;">차이는 딱 하나 —<br>집의 <span class="zs-hl">나이</span></h2>
    <div class="zs-box-check zs-stamp" style="padding:40px 44px;max-width:900px;">
      <div style="font-family:var(--ff-headline);font-size:48px;line-height:1.4;">
        신축은 2019년생 · 4곳<br>구축은 1993년생 · 204곳<br>
        <span style="font-size:60px;">연식 차이 26년</span></div>
    </div>
  </div>
  <img src=\"""" + M + """/mascot-shining.png" style="position:absolute;right:46px;bottom:190px;width:240px;height:240px;">
""", cls="", src=SRC)

# 08 — 신축 현실가
slides[8] = slide(8, """
  <div style="margin-top:64px;">
    <div class="kicker" style="font-size:40px;">그래서 신축 원하면 얼마?</div>
    <h2 style="font-family:var(--ff-headline);font-size:66px;line-height:1.16;margin:14px 0 18px;">서울 신축 중위가</h2>
    <div class="big" style="font-size:170px;color:var(--zs-yellow-deep);">13.5억</div>
    <div class="zs-box zs-stamp" style="padding:30px 38px;max-width:860px;margin-top:24px;">
      <div style="font-family:var(--ff-headline);font-size:44px;line-height:1.4;">5억에서 <span class="zs-hl">+8.5억</span> 더<br><span style="font-size:32px;color:var(--fg-3);font-weight:700;">서울 2018년 이후 신축 · 300세대↑ · 매매 중위</span></div>
    </div>
  </div>
  <img src=\"""" + M + """/mascot-worried.png" style="position:absolute;right:46px;bottom:188px;width:250px;height:250px;">
""", cls="cream", src=SRC)

# 09 — 선택 (양자택일)
slides[9] = slide(9, """
  <div style="margin-top:44px;">
    <div class="kicker" style="font-size:40px;">그래서 너라면?</div>
    <h2 style="font-family:var(--ff-headline);font-size:70px;line-height:1.15;margin:14px 0 32px;">둘 중 하나야</h2>
    <div style="display:flex;flex-direction:column;gap:22px;max-width:900px;">
      <div class="zs-box zs-stamp" style="padding:30px 38px;">
        <div style="font-family:var(--ff-headline);font-size:50px;line-height:1.25;"><span style="color:var(--zs-yellow-deep);">①</span> 영끌해서 신축 13.5억</div>
        <div style="font-weight:700;font-size:30px;color:var(--fg-3);margin-top:6px;">새집 · 삶의 질, 대신 8.5억 더</div>
      </div>
      <div class="zs-box zs-stamp" style="padding:30px 38px;">
        <div style="font-family:var(--ff-headline);font-size:50px;line-height:1.25;"><span style="color:var(--zs-yellow-deep);">②</span> 5억 구축으로 일단 입성</div>
        <div style="font-weight:700;font-size:30px;color:var(--fg-3);margin-top:6px;">입지 · 넓은 평수, 대신 1990년생</div>
      </div>
    </div>
  </div>
""", cls="", src=None)

# 10 — CTA (dark)
slides[10] = slide(10, """
  <div style="margin-top:120px;">
    <h2 style="font-family:var(--ff-headline);font-size:84px;line-height:1.18;">너라면<br>① 영끌 신축?<br>② 5억 구축?</h2>
    <div style="font-family:var(--ff-headline);font-size:46px;color:#fff;margin:40px 0 30px;">댓글로 숫자 남기고 싸워보자 🔥</div>
    <div class="zs-box-cream zs-stamp" style="display:inline-block;padding:24px 34px;">
      <div style="font-family:var(--ff-headline);font-size:38px;color:var(--zs-ink);">'구축' 이라고 남기면<br>5억 구축 204단지 리스트 보낼게</div>
    </div>
  </div>
""", cls="dark", src=None)

for n in range(1, 11):
    p = os.path.join(OUT, "slide-%02d.html" % n)
    with open(p, "w", encoding="utf-8") as f:
        f.write(slides[n])
print("wrote 10 slides to", OUT)
