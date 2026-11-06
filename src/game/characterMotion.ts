import {motion,prefersQuietMotion} from './gameFeel';
export type Reaction='thinking'|'pleased'|'puzzled';
/** Reactions animate illustrations, never hit areas or comparison-picture details. */
export function reactGuests(root:HTMLElement|undefined,reaction:Reaction){
 if(!root||prefersQuietMotion())return;
 const frames:Record<Reaction,Keyframe[]>={
  thinking:[{translate:'0 0',rotate:'0deg'},{translate:'0 -2px',rotate:'-8deg',offset:.4},{translate:'0 0',rotate:'0deg'}],
  pleased:[{translate:'0 0',scale:'1'},{translate:'0 -12px',scale:'1.04',offset:.4},{translate:'0 0',scale:'1'}],
  puzzled:[{rotate:'0deg'},{rotate:'-7deg',offset:.25},{rotate:'6deg',offset:.65},{rotate:'0deg'}]
 };
 for(const host of Array.from(root.querySelectorAll<HTMLElement>('.goal-mascot,.episode-companion'))){
  // Stop just the previous one-shot response; preserve independent sprite/idle loops.
  host.getAnimations().forEach(a=>a.cancel());motion(host,frames[reaction],reaction==='pleased'?440:320);
 }
 root.dataset.guestReaction=reaction;
}
