#!/usr/bin/env python3
"""Seeded offline authoring. All shipped layouts are solver-verified; runtime never generates blindly."""
import random,json,collections,pathlib,time
r=random.Random(1242026);root=pathlib.Path(__file__).resolve().parents[1];out={'maze':[],'laundry':[],'mirrors':[]};stats={}
D=[(0,-1),(1,0),(0,1),(-1,0)]
def glide(w,h,walls,keys,state,d):
 at,mask=state;x,y=at%w,at//w;dx,dy=D[d];path=[]
 while 0<=x+dx<w and 0<=y+dy<h and (y+dy)*w+x+dx not in walls:
  x+=dx;y+=dy;at=y*w+x;path.append(at)
  if at in keys:mask|=1<<keys.index(at)
 return (at,mask),path
def maze_solve(w,h,walls,keys,start,goal):
 q=collections.deque([(start,0,0)]);seen={(start,0)}
 while q:
  at,mask,dist=q.popleft()
  if at==goal and mask==(1<<len(keys))-1:return dist
  for d in range(4):
   n,path=glide(w,h,walls,keys,(at,mask),d)
   if path and n not in seen:seen.add(n);q.append((*n,dist+1))
for tier,(w,h,count,target) in enumerate([(6,6,3,12),(7,7,4,16),(8,7,5,20)]):
 found=[];attempt=0
 while len(found)<8:
  attempt+=1;start=(h-1)*w;goal=w-1;walls={i for i in range(w*h) if i not in (start,goal) and r.random()<.24};edges={};stack=[start]
  for at in stack:
   edges[at]=[]
   for d in range(4):
    n,path=glide(w,h,walls,[],(at,0),d)
    if path:
     edges[at].append(n[0])
     if n[0] not in edges and n[0] not in stack:stack.append(n[0])
  if goal not in edges or len(stack)<12:continue
  rev=collections.defaultdict(list)
  for a,bs in edges.items():
   for b in bs:rev[b].append(a)
  seen={start};q=[start]
  for a in q:
   for b in rev[a]:
    if b not in seen:seen.add(b);q.append(b)
  if len(seen)!=len(edges):continue
  keys=r.sample([i for i in edges if i not in (start,goal)],count)
  dist=maze_solve(w,h,walls,keys,start,goal)
  if dist is None or dist<target or dist>target+8:continue
  found.append(dict(w=w,h=h,walls=sorted(walls),keys=keys,start=start,goal=goal,minimum=dist))
 out['maze'].append(found);print('maze',tier,'minimum',[x['minimum'] for x in found], 'attempts',attempt,flush=True)

def cells(p,v):return [((v+n)+p['fixed']*6) if p['axis']=='h' else p['fixed']+(v+n)*6 for n in range(p['length'])]
def neighbors(ps,s):
 occ={c:i for i,p in enumerate(ps) for c in cells(p,s[i])}
 for i,p in enumerate(ps):
  for delta in [-1,1]:
   n=s[i]+delta
   if n<0 or n+p['length']>6:continue
   if any(c in occ and occ[c]!=i for c in cells(p,n)):continue
   v=list(s);v[i]=n;yield tuple(v)
families=[];attempt=0
while len(families)<8:
 attempt+=1;ps=[dict(axis='h',length=2,fixed=2)];s=[4];used=set(cells(ps[0],4))
 for _ in range(r.choice([11,12])):
  options=[]
  for axis in ['h','v']:
   for fixed in range(6):
    if axis=='h' and fixed==2:continue
    for length in [2,2,3]:
     p=dict(axis=axis,length=length,fixed=fixed)
     for v in range(7-length):
      cs=set(cells(p,v))
      if not(cs&used):options.append((p,v,cs))
  if not options:break
  p,v,cs=r.choice(options);ps.append(p);s.append(v);used|=cs
 if len(ps)<11:continue
 start=tuple(s);q=[start];known={start};aborted=False
 for node in q:
  for n in neighbors(ps,node):
   if n not in known:known.add(n);q.append(n)
  if len(q)>40000:aborted=True;break
 if aborted or len(q)<80:continue
 goals=[s for s in q if s[0]==4];dist={s:0 for s in goals};queue=collections.deque(goals)
 while queue:
  s=queue.popleft()
  for n in neighbors(ps,s):
   if n not in dist:dist[n]=dist[s]+1;queue.append(n)
 maximum=max(dist.values())
 if maximum<28:continue
 choices=[]
 for target in [16,22,28]:
  candidates=[s for s,d in dist.items() if target<=d<=target+3];pick=r.choice(candidates);choices.append(dict(w=6,h=6,pieces=ps,start=list(pick),minimum=dist[pick]))
 families.append(choices);print('laundry family',len(families),'states',len(q),'max',maximum,'attempt',attempt,flush=True)
out['laundry']=[[f[t] for f in families] for t in range(3)]

def trace(w,h,positions,orient,source):
 x,y,d=source;path=[];seen=set();hit=set()
 for _ in range(w*h*4+1):
  dx,dy=D[d];x+=dx;y+=dy
  if x<0 or x>=w or y<0 or y>=h:return path,hit,[x,y,d]
  k=(x,y,d)
  if k in seen:return [],set(),None
  seen.add(k);at=y*w+x;path.append(at)
  if at in positions:
   i=positions.index(at);hit.add(i);d=([1,0,3,2][d] if orient[i]==0 else [3,2,1,0][d])
 return [],set(),None
for tier,(w,h,n,target) in enumerate([(6,5,8,8),(7,6,10,11),(8,6,12,14)]):
 found=[];attempt=0
 while len(found)<8:
  attempt+=1;positions=r.sample(range(w*h),n);answer=[r.randrange(2) for _ in positions]
  sources=[[-1,r.randrange(h),1],[r.randrange(w),h,0]]
  traces=[trace(w,h,positions,answer,s) for s in sources]
  if any(not e or len(p)<target or len(hit)<3 for p,hit,e in traces):continue
  if len(traces[0][1]|traces[1][1])!=n or len(traces[0][1]&traces[1][1])<2:continue
  if traces[0][2][:2]==traces[1][2][:2]:continue
  if any(e[:2] in [s[:2] for s in sources] for _,_,e in traces):continue
  crystal=[]
  for p,_,_ in traces:
   choices=list(dict.fromkeys(i for i in p if i not in positions))
   if len(choices)<tier+2:break
   crystal.append(r.sample(choices,tier+2))
  if len(crystal)!=2:continue
  solutions=[]
  for bits in range(1<<n):
   a=[(bits>>i)&1 for i in range(n)];ts=[trace(w,h,positions,a,s) for s in sources]
   if all(e and e[:2]==traces[k][2][:2] and set(crystal[k]).issubset(p) for k,(p,hit,e) in enumerate(ts)):solutions.append(a)
   if len(solutions)>1:break
  if len(solutions)!=1:continue
  initial=[1-a for a in answer]
  found.append(dict(w=w,h=h,positions=positions,sources=sources,goals=[e for p,hit,e in traces],crystals=crystal,start=initial,answer=answer,minimum=n))
 out['mirrors'].append(found);print('mirrors',tier,'unique',len(found),'attempts',attempt,flush=True)
(root/'src/domain/commissionData.ts').write_text('// Generated and solver-verified by scripts/generate-commissions.py; seed 1242026.\nexport const commissionData = '+json.dumps(out,separators=(',',':'))+' as const;\n')
print('wrote 72 verified layouts',flush=True)
