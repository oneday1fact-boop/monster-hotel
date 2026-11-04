#!/usr/bin/env python3
"""Prepare the tiny, renamed OFL webfont used by the bilingual cover logo.
Usage: python subset-title-font.py path/to/ZenMaruGothic-Black.ttf
Asset tooling needs fonttools; this is not required for normal game builds.
"""
from pathlib import Path
import sys
from fontTools import subset
from fontTools.ttLib import TTFont

source = Path(sys.argv[1])
font = TTFont(source)
text = '怪物旅館MONSTER HOTEL'
assert set(map(ord, text)).issubset(font.getBestCmap()), 'Title glyph missing'
options = subset.Options()
options.flavor = 'woff'
options.name_IDs = [0, 1, 2, 3, 4, 5, 6, 13, 14, 16, 17]
subsetter = subset.Subsetter(options=options)
subsetter.populate(text=text)
subsetter.subset(font)
names = {1: 'Monster Hotel Rounded', 3: 'MonsterHotelRounded-Black-Subset',
         4: 'Monster Hotel Rounded Black', 6: 'MonsterHotelRounded-Black',
         16: 'Monster Hotel Rounded', 17: 'Black'}
for record in font['name'].names:
    if record.nameID in names:
        record.string = names[record.nameID].encode(record.getEncoding())
font.flavor = 'woff'
target = Path(__file__).resolve().parent.parent / 'public/fonts/monster-cover.woff'
font.save(target)
print(f'Title webfont: {target.stat().st_size} bytes')
