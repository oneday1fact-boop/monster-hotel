/** Original character art is layered at runtime; no frame swapping or edited source artwork. */
export function coverLife(nimbusUnlocked=false,poohUnlocked=false){
 const root=document.createElement('div');root.className=`cover-life${nimbusUnlocked?' cover-life--friends':''}${poohUnlocked?' cover-life--six':''}`;root.setAttribute('aria-hidden','true');
 const petals=document.createElement('div');petals.className='cover-petals';
 for(let i=0;i<24;i++){const petal=document.createElement('span');petal.className='sakura-petal';petal.style.setProperty('--petal-left',`${(i*43)%103}%`);petal.style.setProperty('--petal-size',`${7+i%6}px`);petal.style.setProperty('--petal-duration',`${13+i%9}s`);petal.style.setProperty('--petal-delay',`${-(performance.now()/1000+(i*2.73))%(13+i%9)}s`);petal.style.setProperty('--petal-drift',`${40+(i%5)*27}px`);const fold=document.createElement('i');petal.append(fold);petals.append(petal);}root.append(petals);
 const cast=['werewolf','jiangshi','lantern','mummy',...(nimbusUnlocked?['stormling']:[]),...(poohUnlocked?['pooh']:[])];
 for(const[kind,i]of cast.map((k,i)=>[k,i] as const)){
  const guest=document.createElement('div');guest.className=`cover-guest cover-guest--${kind}`;guest.style.setProperty('--cover-index',String(i));guest.style.setProperty('--cover-art',`url('/art/${kind}-poses.${kind==='stormling'?'svg':'png'}')`);guest.style.setProperty('--cover-phase',`${-performance.now()-i*370}ms`);
  const shadow=document.createElement('span');shadow.className='cover-guest-shadow';const puppet=document.createElement('div');puppet.className='cover-puppet';
  for(const part of (kind==='lantern'||kind==='stormling'||kind==='pooh')?['whole']:kind==='werewolf'?['tail','body','head']:['body','head']){const layer=document.createElement('span');layer.className=`cover-skin cover-skin--${part}`;puppet.append(layer);}guest.append(shadow,puppet);root.append(guest);
 }return root;
}
