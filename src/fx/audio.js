// Fossilis · audio de la excavación (WebAudio).
const {AJUSTES} = FG.fx;
let AC = null, MASTER = null;
function contexto(){
  if(typeof window==='undefined') return null;
  if(!AC){
    const C = window.AudioContext || window.webkitAudioContext; if(!C) return null;
    AC = new C(); MASTER = AC.createGain(); MASTER.connect(AC.destination); volumen();
  }
  if(AC.state==='suspended') AC.resume();
  return AC;
}
const audio = () => AJUSTES.sonido ? contexto() : null;
function volumen(){ if(MASTER) MASTER.gain.value = Math.max(0, Math.min(1, AJUSTES.volumen)); }
function tono(f0, f1, dur, tipo, vol, retraso){
  const ac = audio(); if(!ac) return;
  const t = ac.currentTime + (retraso||0);
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = tipo || 'sine';
  o.frequency.setValueAtTime(f0, t);
  if(f1 && f1!==f0) o.frequency.exponentialRampToValueAtTime(Math.max(f1,1), t+dur);
  g.gain.setValueAtTime(.0001, t);
  g.gain.exponentialRampToValueAtTime(vol || .12, t+.012);
  g.gain.exponentialRampToValueAtTime(.0001, t+dur);
  o.connect(g); g.connect(MASTER);
  o.start(t); o.stop(t+dur+.03);
}
function ruido(dur, vol, corte){
  const ac = audio(); if(!ac) return;
  const n = Math.max(1, Math.floor(ac.sampleRate*dur));
  const buf = ac.createBuffer(1, n, ac.sampleRate), d = buf.getChannelData(0);
  for(let i=0;i<n;i++) d[i] = (Math.random()*2-1) * Math.pow(1-i/n, 2.2);
  const s = ac.createBufferSource(); s.buffer = buf;
  const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = corte || 420;
  const g = ac.createGain(); g.gain.value = vol || .28;
  s.connect(f); f.connect(g); g.connect(MASTER); s.start();
}
const arpegio = (fs, vol, paso, tipo) => fs.forEach((f,i)=>tono(f, f, .15, tipo||'triangle', vol||.09, i*(paso||.055)));
const SON = {
  mover:    ()=>tono(300, 400, .07, 'sine', .05),
  subir:    ()=>tono(260, 520, .16, 'sine', .07),
  arena:    ()=>ruido(.16, .18, 900),
  yeso:     ()=>tono(640, 900, .11, 'triangle', .07),
  cavar:    ()=>{ ruido(.24, .30, 520); tono(130, 72, .2, 'sine', .09); },
  piedra:   ()=>{ ruido(.34, .42, 240); tono(92, 52, .3, 'sine', .12); },
  extraer:  ()=>arpegio([523,659,784], .09),
  raro:     ()=>arpegio([523,659,784,1046], .11, .06),
  martillo: ()=>{ ruido(.12, .3, 1800); tono(880, 620, .12, 'square', .05); },
  compra:   ()=>{ tono(440, 660, .1, 'square', .05); tono(880, 1180, .13, 'triangle', .06, .08); },
  habilidad:()=>arpegio([392,587,784], .09, .05, 'sine'),
  evento:   ()=>{ tono(175, 88, .55, 'sawtooth', .07); ruido(.4, .16, 300); },
  turno:    ()=>tono(523, 784, .17, 'sine', .06),
  esqueleto:()=>arpegio([523,659,784,1046,1318], .1, .08),
  ui:       ()=>tono(520, 610, .05, 'sine', .04),
  abrir:    ()=>{ ruido(.3, .14, 700); arpegio([294,392,587], .07, .09, 'sine'); },
  sello:    ()=>{ ruido(.14, .34, 300); tono(110, 58, .22, 'sine', .14); },
  cierre:   ()=>arpegio([587,440,392,294], .08, .16, 'sine'),
};
const son = k => { const f = SON[k]; if(f) try{ f(); }catch(e){} };

/* Ambiente del campamento: viento filtrado que respira y notas sueltas en pentatónica.
   Va por su propia ganancia para poder apagarlo sin tocar los efectos. */
let AMB = null;
const NOTAS_AMB = [196, 220, 261.6, 293.7, 392, 440];
function ambiente(){
  const quiere = AJUSTES.sonido && AJUSTES.ambiente;
  if(!quiere){
    if(AMB){ clearInterval(AMB.reloj); try{ AMB.src.stop(); AMB.lfo.stop(); }catch(e){} AMB.g.disconnect(); AMB = null; }
    return;
  }
  if(AMB) return;
  const ac = contexto(); if(!ac) return;
  const n = ac.sampleRate*3, buf = ac.createBuffer(1, n, ac.sampleRate), d = buf.getChannelData(0);
  let v = 0;
  for(let i=0;i<n;i++){ v = v*.985 + (Math.random()*2-1)*.015; d[i] = v*9; }
  const src = ac.createBufferSource(); src.buffer = buf; src.loop = true;
  const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 420; f.Q.value = .5;
  const g = ac.createGain(); g.gain.value = .05;
  const lfo = ac.createOscillator(), lg = ac.createGain();
  lfo.frequency.value = .07; lg.gain.value = .03; lfo.connect(lg); lg.connect(g.gain);
  src.connect(f); f.connect(g); g.connect(MASTER); src.start(); lfo.start();
  const reloj = setInterval(()=>{
    if(document.hidden || Math.random()<.45) return;
    const fq = NOTAS_AMB[Math.floor(Math.random()*NOTAS_AMB.length)];
    tono(fq, fq, 2.4, 'sine', .022); tono(fq*2, fq*2, 1.6, 'sine', .008, .02);
  }, 3400);
  AMB = {src, lfo, g, reloj};
}
if(typeof document!=='undefined'){
  // El navegador solo deja sonar tras un gesto: el primero enciende el ambiente.
  const primer = () => { ambiente(); document.removeEventListener('pointerdown', primer, true); document.removeEventListener('keydown', primer, true); };
  document.addEventListener('pointerdown', primer, true);
  document.addEventListener('keydown', primer, true);
}
Object.assign(FG.fx, {audio, tono, ruido, arpegio, SON, son, volumen, ambiente});
