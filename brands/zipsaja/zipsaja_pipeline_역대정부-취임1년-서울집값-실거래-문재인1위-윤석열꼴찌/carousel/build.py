# -*- coding: utf-8 -*-
"""집사자 캐러셀 — 역대 정부 취임 1년 서울 집값 실거래 변동률. 1080×1350."""
import os
ZD = "/.claude/skills/zipsaja-design"
OUT = os.path.dirname(os.path.abspath(__file__))
M = ZD + "/assets/mascots"
NAVY = "#1A4FA0"

HEAD = """<!doctype html><html lang="ko"><head><meta charset="utf-8">
<link rel="stylesheet" href=\"""" + ZD + """/colors_and_type.css">
<link rel="stylesheet" href=\"""" + ZD + """/ui_kits/carousel/slide.css">
<style>
  html,body{margin:0;padding:0;}
  .zs-slide{height:1350px;padding:88px 76px 124px;}
  .src{position:absolute;left:76px;right:76px;bottom:116px;font-family:var(--ff-body);font-weight:700;font-size:18px;color:var(--fg-3);line-height:1.35;}
  .big{font-family:var(--ff-headline);letter-spacing:-3px;line-height:0.95;}
  .kicker{font-family:var(--ff-hand);font-weight:700;color:var(--fg-3);}
</style></head><body>"""

def foot(pg):
    return ('<div class="zs-foot"><div class="handle"><img src="' + M +
            '/mascot-blank.png"><b>@zipsaja</b></div>'
            '<div class="right"><span class="pg">' + str(pg) + ' / 10</span><span>→</span></div></div>')

def slide(num, body, cls="", src=None):
    s = HEAD + '<section class="zs-slide ' + cls + '"><div class="zs-num">' + ('%02d' % num) + '</div>'
    s += body + (('<div class="src">' + src + '</div>') if src else '') + foot(num) + '</section></body></html>'
    return s

SRC = "기준 · proptech_db 실거래(서울 300세대↑) · 동일 단지·평형 매칭 중위 · 취임일±45일 vs +1년 · KB지수 아님"

def pres(num, name, period, pct, matched, badge, mascot, mascot_sz=210):
    up = pct >= 0
    col = "var(--zs-yellow-deep)" if up else NAVY
    arrow = "▲" if up else "▼"
    sign = "+" if up else ""
    badge_html = ''
    if badge:
        bc = "var(--zs-yellow-deep)" if up else NAVY
        badge_html = ('<div style="display:inline-block;margin-top:8px;background:' + bc + ';color:#fff;border:3px solid var(--zs-ink);border-radius:999px;padding:8px 28px;font-family:var(--ff-headline);font-size:36px;">' + badge + '</div>')
    body = ("""
  <div style="margin-top:120px;text-align:center;">
    <div style="font-family:var(--ff-headline);font-size:64px;">""" + name + """</div>
    <div style="font-family:var(--ff-body);font-weight:700;font-size:34px;color:var(--fg-3);margin-top:8px;">""" + period + """</div>
    <div class="big" style="font-size:150px;color:""" + col + """;margin:36px 0 10px;letter-spacing:-2px;"><span style="font-size:104px;">""" + arrow + """</span>""" + sign + str(pct) + """%</div>
    <div style="font-family:var(--ff-body);font-weight:700;font-size:28px;color:var(--fg-3);">동일 단지·평형 """ + str(matched) + """개 매칭</div>
    """ + badge_html + """
  </div>
  <img src=\"""" + M + "/" + mascot + """.png" style="position:absolute;right:44px;bottom:170px;width:""" + str(mascot_sz) + "px;height:" + str(mascot_sz) + """px;">
""")
    return slide(num, body, cls="cream" if (num % 2 == 0) else "", src=SRC)

slides = {}

# 01 Cover
slides[1] = slide(1, """
  <div style="margin-top:74px;">
    <div class="kicker" style="font-size:40px;">집사자가 실거래로 직접 계산</div>
    <h1 style="font-family:var(--ff-headline);font-size:84px;line-height:1.12;margin:22px 0 26px;letter-spacing:-2px;">
      역대 대통령<br><span class="zs-pill" style="font-size:84px;padding:4px 22px 10px;">취임 1년</span><br>서울 집값은?
    </h1>
    <div style="font-family:var(--ff-headline);font-size:44px;color:var(--fg-2);">누가 제일 많이 올렸을까 →</div>
  </div>
  <img src=\"""" + M + """/mascot-default.png" style="position:absolute;right:42px;bottom:180px;width:280px;height:280px;">
""", cls="")

# 02 맥락/방법
slides[2] = slide(2, """
  <div style="margin-top:60px;">
    <div class="kicker" style="font-size:40px;">이재명 1주년 "역대최대"라는데</div>
    <h2 style="font-family:var(--ff-headline);font-size:70px;line-height:1.16;margin:18px 0 32px;">진짜 역대급일까?<br><span class="zs-hl">실거래로</span> 비교해봄</h2>
    <div class="zs-box-cream zs-stamp" style="padding:30px 36px;max-width:870px;">
      <div style="font-family:var(--ff-body);font-weight:700;font-size:36px;line-height:1.5;">
        KB 지수 말고 <b>진짜 거래가</b>.<br>같은 단지·같은 평형이<br>취임 전 vs 1년 후 얼마 변했나.</div>
    </div>
  </div>
  <img src=\"""" + M + """/mascot-shining.png" style="position:absolute;right:46px;bottom:190px;width:230px;height:230px;">
""", cls="cream", src=SRC)

# 03~07 대통령
slides[3] = pres(3, "이명박 정부", "2008.2 ~ 2009.2 (취임 1년)", -4.0, 1771, None, "mascot-worried")
slides[4] = pres(4, "박근혜 정부", "2013.2 ~ 2014.2 (취임 1년)", 4.4, 2630, None, "mascot-default")
slides[5] = pres(5, "문재인 정부", "2017.5 ~ 2018.5 (취임 1년)", 16.9, 3006, "역대 1위 🔥", "mascot-surprise")
slides[6] = pres(6, "윤석열 정부", "2022.5 ~ 2023.5 (취임 1년)", -17.1, 1182, "역대 꼴찌", "mascot-worried")
slides[7] = pres(7, "이재명 정부", "2025.6 ~ 2026.6 (취임 1년·진행중)", 14.8, 2799, "2위", "mascot-shining")

# 08 랭킹
def rk(rank, txt, up):
    col = "var(--zs-yellow-deep)" if up else NAVY
    return ('<div style="display:flex;align-items:center;gap:22px;border-bottom:2px solid rgba(0,0,0,0.12);padding:16px 4px;">'
            '<div style="font-family:var(--ff-headline);font-size:46px;width:96px;">' + rank + '</div>'
            '<div style="font-family:var(--ff-headline);font-size:48px;flex:1;">' + txt.split("·")[0].strip() + '</div>'
            '<div style="font-family:var(--ff-headline);font-size:48px;color:' + col + ';">' + txt.split("·")[1].strip() + '</div></div>')
slides[8] = slide(8, """
  <div style="margin-top:40px;">
    <div class="kicker" style="font-size:38px;">취임 1년 상승률 순위</div>
    <h2 style="font-family:var(--ff-headline);font-size:64px;line-height:1.14;margin:12px 0 26px;">한눈에 정리</h2>
    <div style="max-width:880px;">
""" + rk("1위","문재인 · +16.9%",True) + rk("2위","이재명 · +14.8%",True) + rk("3위","박근혜 · +4.4%",True)
   + rk("4위","이명박 · -4.0%",False) + rk("꼴찌","윤석열 · -17.1%",False) + """
    </div>
    <div style="font-family:var(--ff-headline);font-size:34px;color:var(--fg-2);margin-top:22px;">문재인·이재명 양강 vs 윤석열 폭락</div>
  </div>
""", cls="", src=SRC)

# 09 면책/방법
slides[9] = slide(9, """
  <div style="margin-top:96px;">
    <div class="kicker" style="font-size:42px;">오해 ㄴㄴ</div>
    <h2 style="font-family:var(--ff-headline);font-size:64px;line-height:1.22;margin:18px 0 30px;">정권 탓이 아니라<br><span class="zs-hl">시장 사이클</span>이야</h2>
    <div class="zs-box zs-stamp" style="padding:28px 34px;max-width:880px;">
      <div style="font-family:var(--ff-body);font-weight:700;font-size:32px;line-height:1.55;color:var(--fg-2);">
        · 같은 단지·평형 매칭 실거래(KB지수 X)<br>· 노무현은 데이터 전이라 제외(2006~)<br>· 이재명은 12개월 진행 중</div>
    </div>
  </div>
  <img src=\"""" + M + """/mascot-default.png" style="position:absolute;right:48px;bottom:182px;width:230px;height:230px;">
""", cls="cream")

# 10 CTA dark
slides[10] = slide(10, """
  <div style="margin-top:120px;">
    <h2 style="font-family:var(--ff-headline);font-size:80px;line-height:1.2;color:#fff;">너네 정권 때가<br>제일 심했다?</h2>
    <div style="font-family:var(--ff-headline);font-size:46px;color:#fff;margin:40px 0 30px;">댓글로 숫자 보고 싸워봐 🔥</div>
    <div class="zs-box-cream zs-stamp" style="display:inline-block;padding:24px 32px;">
      <div style="font-family:var(--ff-headline);font-size:36px;color:var(--zs-ink);">저장해두고 다음 대선 때<br>다시 꺼내봐</div>
    </div>
  </div>
""", cls="dark")

for n in range(1, 11):
    with open(os.path.join(OUT, "slide-%02d.html" % n), "w", encoding="utf-8") as f:
        f.write(slides[n])
print("wrote 10 slides")
