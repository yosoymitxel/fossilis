const {MAT, BONE, BONE_BOX, HAMMERS, DINOS, TOOL_DESIGNS, SUPPLY_DESIGNS, SKILLS, EVENTS, FR, COLORS, CORNERS, STONE_SPOTS} = FG.data;
const {ix, rc, shuffle, ri, sembrar, rnd} = FG.core;
let TID = 0;
function makeTile(mat){
  const n = MAT[mat].nf, frags = [];
  for(let i=0;i<n;i++){
    if(mat==='stone' && i===n-1 && rnd()<0.45) frags.push('comodin');
    else frags.push(FR[ri(3)]);
  }
  return {id:'t'+(TID++), mat, frags};
}

function setupGame(cfg){
  sembrar(cfg.seed);
  TID = 0;
  const P = cfg.players.length;
  const bag = [];
  Object.entries(BONE_BOX).forEach(([b,n])=>{for(let i=0;i<n;i++)bag.push(b);});
  for(let i=0;i<HAMMERS;i++) bag.push('martillo');
  const pits = Array.from({length:25},()=>[]);
  shuffle(bag).forEach(o => pits[ri(25)].push(o));

  const discard = FR.map(f=>{const t=makeTile('sand'); t.frags=[f]; return t;});
  let sand=[],clay=[],stone=[];
  for(let i=0;i<18;i++) sand.push(makeTile('sand'));
  for(let i=0;i<9;i++)  clay.push(makeTile('clay'));
  for(let i=0;i<8;i++)  stone.push(makeTile('stone'));

  const cells = Array.from({length:25},()=>[]);
  STONE_SPOTS.forEach(s => cells[s].push(stone.pop()));
  const soft = shuffle(sand.concat(clay));
  for(let i=0;i<25;i++) if(cells[i].length===0) cells[i].push(soft.pop());
  const top = shuffle(soft.concat(stone));
  const spots = shuffle([...Array(25).keys()].filter(i=>!CORNERS.includes(i)));
  let placed = 0;
  for(const t of top){
    if(placed>=10) break;
    const s = spots.find(s => cells[s].length===1 && !(t.mat==='stone' && cells[s][0].mat==='stone'));
    if(s===undefined) continue;
    cells[s].push(t); spots.splice(spots.indexOf(s),1); placed++;
  }

  const toolDeck = shuffle(TOOL_DESIGNS.flatMap(d=>Array.from({length:d.q},(_,i)=>({...d,uid:d.k+i}))));
  const supDeck  = shuffle(SUPPLY_DESIGNS.flatMap(d=>Array.from({length:d.q},(_,i)=>({...d,uid:d.k+i}))));
  const dinoDeck = shuffle(DINOS.slice());
  let skillPool = SKILLS.slice();
  if(!cfg.opts.agresivas) skillPool = skillPool.filter(s=>!s.agg);
  const skillRow = shuffle(skillPool).slice(0,9);

  const freeStart = shuffle(CORNERS.concat(P===5?[12]:[]));
  const players = cfg.players.map((p,i)=>({
    id:i, name:p.name, isAI:p.isAI, color:COLORS[i],
    pos:freeStart[i], fell:null,
    plaster:0, storage:{diente:0,femur:0,costilla:0,cadera:0,craneo:0},
    lab:[], scored:[], tiles:[], tools:[], supplies:[], skills:[], vp:0,
  }));

  return {
    seed:cfg.seed, opts:cfg.opts, cells, pits, players,
    turn:0, phase:'actions', energy:4, hammers:0, bought:0, usedSkill:{},
    pool: 4*P, reserve: 40 - 4*P, poolIndex:1,
    dinoDeck: dinoDeck.slice(4), dinoRow: dinoDeck.slice(0,4),
    toolDeck: toolDeck.slice(2), supDeck: supDeck.slice(2),
    market: [toolDeck[0],toolDeck[1],supDeck[0],supDeck[1]].map((c,i)=>({...c, kind:i<2?'tool':'supply'})),
    skillRow, eventDeck: shuffle(EVENTS).slice(0,3), pendingEvent:null,
    discard, log:[{t:'Montaje completo. Empieza '+players[0].name+'.'}],
    endTrigger:false, finalTurns:null, over:false, breakdown:null,
  };
}

const cur = g => g.players[g.turn];
const has = (p,k) => p.skills.some(s=>s.k===k);
const digCost = (p,mat) => mat==='clay'&&has(p,'arcilla1') ? 1 : mat==='stone'&&has(p,'piedra2') ? 2 : MAT[mat].dig;
const bonePlaster = (p,b) => has(p,'yesoDesc') ? Math.max(1, BONE[b].pl-1) : BONE[b].pl;
const labCap = p => has(p,'lab2') ? 2 : 1;
const marketCap = p => has(p,'mercado2') ? 2 : 1;
const startEnergy = p => has(p,'energia5') ? 5 : 4;
const pawnAt = (g,i) => g.players.find(p=>p.pos===i);
const openPit = (g,i) => g.cells[i].length===0 && g.pits[i].length>0;

const clone = g => structuredClone(g);
const totalBones = p => Object.values(p.storage).reduce((a,b)=>a+b,0);
Object.assign(FG.core, {makeTile, setupGame, cur, has, digCost, bonePlaster, labCap, marketCap, startEnergy, pawnAt, openPit, clone, totalBones});
