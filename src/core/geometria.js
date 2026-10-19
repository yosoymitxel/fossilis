// Fossilis · geometría del yacimiento: vecindades, bordes y pasos.
const rc = i => [Math.floor(i/5), i%5];
const ix = (r,c) => (r<0||c<0||r>4||c>4) ? null : r*5+c;
const DIRS = {N:[-1,0], S:[1,0], E:[0,1], O:[0,-1]};
const DIR_ES = {N:'arriba', S:'abajo', E:'derecha', O:'izquierda'};
const step = (i,d) => {const [r,c]=rc(i); const [dr,dc]=DIRS[d]; return ix(r+dr,c+dc);};
const ortho = i => Object.keys(DIRS).map(d=>step(i,d)).filter(x=>x!==null);
const diag = i => {const[r,c]=rc(i);return [[-1,-1],[-1,1],[1,-1],[1,1]].map(([a,b])=>ix(r+a,c+b)).filter(x=>x!==null);};
const around8 = i => ortho(i).concat(diag(i));
const edgeOf = i => {const[r,c]=rc(i); if(r===0)return'N'; if(r===4)return'S'; if(c===0)return'O'; return'E';};
const cellsOnEdge = side => {const o=[];for(let k=0;k<5;k++){o.push(side==='N'?ix(0,k):side==='S'?ix(4,k):side==='O'?ix(k,0):ix(k,4));}return o;};

const pasoHacia = (a,b) => { const ra=Math.floor(a/5), ca=a%5, rb=Math.floor(b/5), cb=b%5;
  return ca===cb ? (rb===ra+1?'S':rb===ra-1?'N':null) : ra===rb ? (cb===ca+1?'E':cb===ca-1?'O':null) : null; };
Object.assign(FG.core, {rc, ix, DIRS, DIR_ES, step, ortho, diag, around8, edgeOf, cellsOnEdge, pasoHacia});
