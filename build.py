# -*- coding: utf-8 -*-
"""Сборка story-anim.js = ядро + T1 + все story-trk-NN.js + футер."""
import io, glob, os, re
DIR = r"C:\Users\exxck\cupsize-v2-story"
def rd(p):
    with io.open(p, encoding="utf-8") as f: return f.read()
parts = [rd(DIR+r"\story-core.js"), "\n", rd(DIR+r"\story-t01.js")]
trk = sorted(glob.glob(DIR+r"\story-trk-*.js"))
have = []
for p in trk:
    n = int(re.search(r"trk-(\d+)", p).group(1))
    parts.append("\n"+rd(p).strip()+"\n"); have.append(n)
parts.append("\nwindow.__STORY_V3 = true;\n")
out = "\n".join(parts)
with io.open(DIR+r"\story-anim.js","w",encoding="utf-8",newline="\n") as f: f.write(out)
need = set(range(2,27)); have=set(have)|{1}
print("есть треки:", sorted(have))
print("нет треков :", sorted(need-have))
print("строк:", out.count("\n")+1)
for a,b in [("{","}"),("(",")"),("[","]")]:
    d=out.count(a)-out.count(b); print(f"баланс {a}{b}:", "OK" if d==0 else f"!!! {d}")
