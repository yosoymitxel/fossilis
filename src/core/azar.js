// Fossilis · azar reproducible por semilla.
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
let RNG = mulberry32(1);
const ri = n => Math.floor(RNG()*n);
const shuffle = a => {const x=a.slice(); for(let i=x.length-1;i>0;i--){const j=ri(i+1);[x[i],x[j]]=[x[j],x[i]];} return x;};
const sembrar = seed => { RNG = mulberry32(seed); };
const rnd = () => RNG();
Object.assign(FG.core, {mulberry32, ri, shuffle, sembrar, rnd});
