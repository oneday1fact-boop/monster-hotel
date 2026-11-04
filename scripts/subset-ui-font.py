#!/usr/bin/env python3
"""Offline UI subset: run with fonttools and a Huninn Regular source TTF."""
from pathlib import Path
import sys
from fontTools import subset
from fontTools.ttLib import TTFont
root = Path(__file__).resolve().parent.parent
font = TTFont(sys.argv[1])
text = ''.join(p.read_text() for p in (root / 'src').rglob('*.ts')) + ''.join(chr(i) for i in range(32, 127))
cjk = {ord(c) for c in text if '\u3400' <= c <= '\u9fff'}
missing = cjk - font.getBestCmap().keys()
assert not missing, f'Missing Chinese glyphs: {"".join(map(chr, missing))}'
options = subset.Options()
options.name_IDs = [0,1,2,3,4,5,6,13,14,16,17]
subsetter = subset.Subsetter(options=options)
subsetter.populate(text=text)
subsetter.subset(font)
names = {1:'Monster Hotel UI',3:'MonsterHotelUI-Regular-Subset',4:'Monster Hotel UI Regular',6:'MonsterHotelUI-Regular',16:'Monster Hotel UI',17:'Regular'}
for record in font['name'].names:
    if record.nameID in names:
        record.string = names[record.nameID].encode(record.getEncoding())
font.flavor = 'woff'
target = root / 'public/fonts/monster-ui.woff'
font.save(target)
print(f'{len(cjk)} Chinese glyphs, {target.stat().st_size} bytes')
