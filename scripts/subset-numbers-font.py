#!/usr/bin/env python3
"""Bundle Fredoka Latin/numerals at a playful semibold weight (fonttools required)."""
from pathlib import Path
import sys
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools import subset
font = instantiateVariableFont(TTFont(sys.argv[1]), {'wght': 600, 'wdth': 100}, inplace=False)
options = subset.Options()
options.name_IDs = [0,1,2,3,4,5,6,13,14,16,17]
subsetter = subset.Subsetter(options=options)
subsetter.populate(unicodes=range(32, 383))
subsetter.subset(font)
names = {1:'Monster Hotel Play',3:'MonsterHotelPlay-Semibold',4:'Monster Hotel Play Semibold',6:'MonsterHotelPlay-Semibold',16:'Monster Hotel Play',17:'Semibold'}
for r in font['name'].names:
    if r.nameID in names:r.string = names[r.nameID].encode(r.getEncoding())
font.flavor='woff'
font.save(Path(__file__).resolve().parent.parent/'public/fonts/monster-numbers.woff')
