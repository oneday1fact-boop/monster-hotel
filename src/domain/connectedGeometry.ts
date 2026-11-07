import type {EstateRoomId} from './hotelEstate';
import type {Point} from './hotelLife';
export const hotelWorldWidth=3400,wingOffset=1800;
export const connectedPoint=(id:EstateRoomId):Point=>({x:({moon:355,tea:1240,laundry:355,hearth:1240,library:2155,observatory:3040,music:2155,bakery:3040})[id],y:['laundry','hearth','music','bakery'].includes(id)?719:396});
/** Both bridges are real walkable corridors. Floors change only on one of the two painted stairs. */
export function connectedRoute(from:Point,to:Point):Point[]{const up=from.y<500,endUp=to.y<500,lane=(upper:boolean)=>upper?431:754;const stairX=[805,2605].sort((a,b)=>Math.abs(from.x-a)+Math.abs(to.x-a)-Math.abs(from.x-b)-Math.abs(to.x-b))[0];const stairs=[431,475,540,630,704,754].map(y=>({x:stairX,y}));return [{x:from.x,y:lane(up)},...(up===endUp?[]:(up?stairs:[...stairs].reverse())),{x:to.x,y:lane(endUp)},{...to}];}
