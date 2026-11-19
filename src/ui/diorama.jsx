// Fossilis · diorama 3D del yacimiento con modelos low-poly de polyfork.dev (enlazados desde su CDN).
// Si three o los modelos no cargan (sin red), no se pinta nada y manda la ilustración SVG de debajo.
const {useRef, useEffect, useState} = React;
const {quieto} = FG.fx;

const CDN = 'https://polyfork.dev/cdn/';
const ALTO = 1.3;                       // el campamento está a ras de suelo; el tajo, ALTO metros más abajo
const TAJO = [7, 7];                    // el tajo es cuadrado: su cuadrícula 5x5 es la del tablero
// [id, x, z, giro en radianes, abajo en el tajo]
const PARTES = [
  ['canvas-wall-tent-de8a04', -10.5, -5.5, .75],
  ['camp-kitchen-table-dfa2ab', -5.4, 1.2, 1.2],
  ['folding-camp-chair-2fc7d1', -6.6, 2.2, 2.3],
  ['stone-ring-campfire-8a0c6f', -6.2, 5.4, 0],
  ['wooden-crate-e46521', -4.6, -1.6, .3],
  ['wooden-crate-e46521', -4.5, -2.4, 1.1],
  ['wheelbarrow-0f8406', 5.3, 2.4, -.8],
  ['shovel-997c4d', 4.5, -1.2, .4],
  ['fossil-ribcage-b243c5', -.3, .2, .5, true],
  ['dinosaur-skull-4c3a3c', 2.3, -2, -.9, true],
  ['dinosaur-bone-pile-3c285a', -2.2, 1.9, 1.3, true],
  ['dinosaur-trackway-f0aec5', 7.6, 6.2, .4],
  ['basalt-column-outcrop-f1339d', 10.5, -9.5, .3],
  ['basalt-column-outcrop-f1339d', -13, -11, 1.9],
  ['volcanic-boulder-cluster-7e29ea', 8.4, -3.6, 1],
  ['volcanic-boulder-cluster-7e29ea', -11.5, 5.5, 2.4],
  ['termite-mound-9bc94b', 11.5, 4.6, 0],
  ['dead-snag-0b1891', -3.5, -10.5, .8],
];
const FAROL = [-5.4, 1.2];
// En partida, la arenisca cierra el tajo por detrás y por los lados, como la bandeja del juego de mesa;
// por delante queda baja para no tapar la última fila. [x, z, giro, altura relativa]
const ARENISCA = 'sandstone-outcrop-75800b';
const BANDEJA = [[-1.9,-5.2,0,1],[1.9,-5.2,Math.PI,1],[-5.2,-1.9,Math.PI/2,1],[-5.2,1.9,Math.PI/2,.8],
  [5.2,-1.9,-Math.PI/2,1],[5.2,1.9,-Math.PI/2,.8],[-1.9,5,0,.35],[1.9,5,Math.PI,.35]];
// Los dinosaurios del juego que tienen modelo; el resto se queda con su silueta.
const DINO_3D = {
  'Tyrannosaurus rex':'tyrannosaurus-rex-adf79f', Stegosaurus:'stegosaurus-96f08c', Triceratops:'triceratops-6ce6f5',
  Pteranodon:'pteranodon-e88e96', Velociraptor:'velociraptor-094793', Plesiosaurus:'plesiosaurus-d58997',
  Ankylosaurus:'ankylosaurus-b063ec', Brachiosaurus:'brachiosaurus-f795d5', Compsognathus:'compsognathus-c8975e',
  Parasaurolophus:'parasaurolophus-c27741',
};
const tieneDino3D = d => !!(d && DINO_3D[d.name]);

/* Descargas compartidas: la portada, la apertura y el cierre piden lo mismo y solo se baja una vez.
   Empiezan al cargar este módulo, mientras el resto del juego aún se compila. */
const MODULOS = new Map();
const traer = id => {
  if(!MODULOS.has(id)) MODULOS.set(id, import(CDN+id+'.mjs').then(m=>m.createAsset));
  return MODULOS.get(id);
};
const THREE_P = import('three');
THREE_P.catch(()=>{});
const IDS_YACIMIENTO = [...new Set(PARTES.map(p=>p[0])), 'camping-lantern-21d14b', ARENISCA];
IDS_YACIMIENTO.forEach(id => traer(id).catch(()=>{}));

const LUZ = {
  noche: {cielo:0x0d1426, niebla:[30,85], hemi:[0x8ea6dc, 0x2a2018, 1.25], sol:[0xa9c0ee, 1.0, [-14,22,8]], fuego:26, suelo:0x9a8058, estrellas:true},
  ocaso: {cielo:0x7a3f36, niebla:[30,80], hemi:[0xf0b78a, 0x3a2620, 1.15], sol:[0xffb070, 1.5, [-22,9,-6]], fuego:16, suelo:0xb48a58},
  alba:  {cielo:0xd9e6e6, niebla:[34,95], hemi:[0xffffff, 0x9a8468, 1.5], sol:[0xfff0d2, 1.7, [16,24,10]], fuego:0, suelo:0xcaa66c},
};
// Planos: la cámara va de `de` a `a` en `dura` s mirando a `mira`. Sin plano, orbita despacio.
const PLANOS = {
  apertura: {de:[15,10,18], a:[6.5,3.6,8.5], mira:[0,-.4,0], dura:4.2},
  cierre:   {de:[5,2.6,7], a:[13,11,20], mira:[0,.6,0], dura:3.6},
};

/* plano 'tablero': la cámara se coloca sobre el tajo para que el foso enmarque el tablero DOM.
   encuadre: ref a {cx, cy, lado} en px del lienzo (centro y ancho de la rejilla);
   desde 'apertura': antes de `vuelo` hace el plano de apertura y al llegar `vuelo` baja al tablero. */
const ELEVA = 71*Math.PI/180;           // la misma inclinación que el tablero DOM (rotateX 19°)
function Diorama({hora='noche', plano, dino, cls='', onEstado, encuadre, vuelo, desde}){
  const lienzo = useRef(null);
  const vivo = useRef({});
  vivo.current = {encuadre, vuelo};
  const [listo,setListo] = useState(false);
  useEffect(()=>{
    let muerto = false, raf = 0, renderer = null, alSalir = null;
    const canvas = lienzo.current;
    (async ()=>{
      const THREE = await THREE_P;
      const ids = dino ? [DINO_3D[dino.name]] : IDS_YACIMIENTO;
      const mods = await Promise.allSettled(ids.map(id => traer(id).then(f=>[id, f])));
      const crear = Object.fromEntries(mods.filter(m=>m.status==='fulfilled').map(m=>m.value));
      if(muerto) return;
      if(!Object.keys(crear).length) throw new Error('sin modelos');
      const pieza = id => { try { return crear[id]({climate:'dry', season:'summer'}); } catch(e){ return crear[id](); } };

      renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:!!dino, powerPreference:'low-power'});
      let escala = Math.min(window.devicePixelRatio || 1, 1.5);
      const scene = new THREE.Scene();
      const L = LUZ[hora] || LUZ.noche;
      scene.add(new THREE.HemisphereLight(L.hemi[0], L.hemi[1], dino ? 1.5 : L.hemi[2]));
      const sol = new THREE.DirectionalLight(dino ? 0xffffff : L.sol[0], dino ? 1.6 : L.sol[1]);
      sol.position.set(...L.sol[2]); scene.add(sol);
      const camera = new THREE.PerspectiveCamera(dino ? 30 : 40, 1, .3, 240);
      let radio = 17, centro = [0, .2, 0], alto = 6.2, fuego = null;

      if(dino){
        const obj = pieza(DINO_3D[dino.name]);
        const caja = new THREE.Box3().setFromObject(obj), t = caja.getSize(new THREE.Vector3());
        scene.add(obj);
        radio = Math.max(t.x, t.z)*1.25 + t.y*1.1; alto = t.y*.62; centro = [0, t.y*.46, 0];
      } else {
        scene.background = new THREE.Color(L.cielo);
        scene.fog = new THREE.Fog(L.cielo, L.niebla[0], L.niebla[1]);
        if(L.estrellas){
          const pts = [];
          for(let i=0;i<260;i++){ const a = i*2.399, r = 150, y = 12+((i*37)%90); pts.push(Math.cos(a)*r, y, Math.sin(a)*r); }
          const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
          scene.add(new THREE.Points(geo, new THREE.PointsMaterial({color:0xf4efe4, size:1.6, sizeAttenuation:false, fog:false})));
        }
        // El terreno: cuatro bloques alrededor del tajo, cuyas paredes enseñan arena, arcilla y piedra.
        const [w,d] = TAJO, G = 120;
        const arena = new THREE.MeshLambertMaterial({color:L.suelo});
        const losa = (sx, sz, x, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(sx, ALTO, sz), arena); m.position.set(x, -ALTO/2, z); scene.add(m); };
        losa(G, (G-d)/2, 0, -(d/2+(G-d)/4)); losa(G, (G-d)/2, 0, d/2+(G-d)/4);
        losa((G-w)/2, d, -(w/2+(G-w)/4), 0); losa((G-w)/2, d, w/2+(G-w)/4, 0);
        const fondo = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshLambertMaterial({color:0x6c5140}));
        fondo.rotation.x = -Math.PI/2; fondo.position.y = -ALTO; scene.add(fondo);
        [[0xa9603f, -.42, .5],[0x6c7781, -ALTO+.21, .42]].forEach(([c, y, h])=>{   // vetas de arcilla y piedra en las paredes
          const mat = new THREE.MeshLambertMaterial({color:c});
          [[w+.02, .04, 0, -d/2],[w+.02, .04, 0, d/2],[.04, d+.02, -w/2, 0],[.04, d+.02, w/2, 0]].forEach(([sx, sz, x, z])=>{
            const m = new THREE.Mesh(new THREE.BoxGeometry(sx, h, sz), mat); m.position.set(x, y, z); scene.add(m); });
        });
        // La cuadrícula de excavación: estacas en el borde y cordel.
        // En partida el cordel va a ras de suelo, en las juntas de las losetas; en las vistas, sobre estacas.
        const hCordel = plano==='tablero' ? .03 : .42, hEstaca = plano==='tablero' ? .1 : .5;
        const palo = new THREE.MeshLambertMaterial({color:0xd8c9a8}), puntos = [];
        for(let i=0;i<=5;i++) for(const s of [-1,1]){
          const a = [-w/2 + i*w/5, s*d/2], b = [s*w/2, -d/2 + i*d/5];
          for(const [x,z] of [a,b]){ const e = new THREE.Mesh(new THREE.BoxGeometry(.06,hEstaca,.06), palo); e.position.set(x,hEstaca/2,z); scene.add(e); }
        }
        for(let i=0;i<=5;i++){
          const x = -w/2 + i*w/5, z = -d/2 + i*d/5;
          puntos.push(new THREE.Vector3(x,hCordel,-d/2), new THREE.Vector3(x,hCordel,d/2), new THREE.Vector3(-w/2,hCordel,z), new THREE.Vector3(w/2,hCordel,z));
        }
        scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(puntos), new THREE.LineBasicMaterial({color:0xf1e7ce, transparent:true, opacity:.55})));

        for(const [id, x, z, giro, abajo] of PARTES){
          if(!crear[id] || (abajo && plano==='tablero')) continue;   // en partida el tajo lo ocupan las losetas
          const obj = pieza(id);
          obj.position.set(x, abajo ? -ALTO : 0, z); obj.rotation.y = giro;
          if(abajo) obj.position.y -= .12;            // medio enterrado
          scene.add(obj);
        }
        if(plano==='tablero' && crear[ARENISCA]) BANDEJA.forEach(([x,z,r,h])=>{
          const o = pieza(ARENISCA); o.position.set(x,-ALTO,z); o.rotation.y = r; o.scale.set(1,h*.9,1); scene.add(o); });
        if(crear['camping-lantern-21d14b']){ const f = pieza('camping-lantern-21d14b'); f.position.set(FAROL[0], .86, FAROL[1]); f.scale.setScalar(1.6); scene.add(f); }
        if(L.fuego){
          fuego = new THREE.PointLight(0xffb060, L.fuego, 16); fuego.position.set(-6.2, 1.1, 5.4); scene.add(fuego);
          const farol = new THREE.PointLight(0xffd38a, L.fuego*.7, 11); farol.position.set(FAROL[0], 1.5, FAROL[1]); scene.add(farol);
          const tajo = new THREE.PointLight(0xcfe0e8, L.fuego*.35, 9); tajo.position.set(0, .6, 0); scene.add(tajo);
          if(plano==='tablero'){   // focos de trabajo sobre el tajo: el tablero es la zona iluminada de la noche
            const foco = new THREE.SpotLight(0xffe4bd, 120, 30, .42, .55, 1.4);
            foco.position.set(1.5, 11, 6); foco.target.position.set(0, 0, 0);
            scene.add(foco); scene.add(foco.target);
          }
        }
      }

      const medir = () => {
        const r = canvas.getBoundingClientRect(), w = Math.max(1, r.width), h = Math.max(1, r.height);
        renderer.setSize(Math.round(w*escala), Math.round(h*escala), false);
        camera.aspect = w/h;
        // en vertical la escena se aleja para que quepan el campamento y el tajo
        camera.userData.zoom = !dino && w/h < .8 ? 1.5 : 1;
        camera.updateProjectionMatrix();
      };
      medir();
      window.addEventListener('resize', medir);
      alSalir = () => window.removeEventListener('resize', medir);

      const P = PLANOS[plano], quietud = quieto();
      let t0 = 0, ultimo = 0, vuelta = dino ? .7 : 2.35, lentos = 0, cuadros = 0;
      /* Pose del tablero: la misma proyección que hace el CSS. El plano del suelo (y=0, tajo de TAJO m) se lleva
         al plano de la rejilla en píxeles (escala, giro del rotateX alrededor de su eje) y la cámara se pone donde
         está el ojo de la perspectiva CSS, deshaciendo esa transformación. Así la cuadrícula cae sobre las losetas. */
      const poseTablero = (W, H) => {
        const e = vivo.current.encuadre && vivo.current.encuadre.current;
        if(!e || !e.S){
          const D = 14;
          return {pos:[0, D*Math.sin(ELEVA), D*Math.cos(ELEVA)], mira:[0,0,0], up:[0,1,0], fov:40, ox:0, oy:0};
        }
        const s = e.S/TAJO[0];
        const L = new THREE.Matrix4().set(s,0,0,e.bx, 0,0,-s,-e.by, 0,s,0,0, 0,0,0,1);
        const R = new THREE.Matrix4().makeTranslation(0,-e.ax,0)
          .multiply(new THREE.Matrix4().makeRotationX(-e.a)).multiply(new THREE.Matrix4().makeTranslation(0,e.ax,0));
        const Mi = R.multiply(L).invert();
        const pos = new THREE.Vector3(e.ex, -e.ey, e.P).applyMatrix4(Mi);
        const fwd = new THREE.Vector3(0,0,-1).transformDirection(Mi), up = new THREE.Vector3(0,1,0).transformDirection(Mi);
        return {pos:pos.toArray(), mira:new THREE.Vector3().copy(pos).addScaledVector(fwd, 10).toArray(), up:up.toArray(),
                fov:2*Math.atan(H/2/e.P)*180/Math.PI, ox:W/2-e.ex, oy:H/2-e.ey};
      };
      const mezcla = (a, b, k) => a.map((v,i)=>v+(b[i]-v)*k);
      const AP = PLANOS.apertura;
      let tVuelo = 0, salida = null;
      const cuadro = t => {
        raf = requestAnimationFrame(cuadro);
        if(document.hidden || t-ultimo < (plano==='tablero' && canvas.dataset.posado ? 100 : 32)) return;
        if(!t0) t0 = t;
        const dt = ultimo ? t-ultimo : 0; ultimo = t;
        // Equipo justo: si los cuadros se atrasan, se pinta más pequeño y el navegador amplía.
        if(dt > 55) lentos++;
        if(++cuadros >= 12){ if(lentos >= 7 && escala > .34){ escala *= .6; medir(); } cuadros = lentos = 0; }
        const z = camera.userData.zoom;
        if(plano==='tablero'){
          const r = canvas.getBoundingClientRect(), W = r.width, H = r.height, T = poseTablero(W, H);
          const enApertura = desde==='apertura' && !vivo.current.vuelo;
          let pos, mira, up = [0,1,0], fov = 40, k = 1;
          if(enApertura){
            const ka = quietud ? 1 : Math.min(1, (t-t0)/(AP.dura*1000)), ea = 1-Math.pow(1-ka, 3);
            pos = AP.de.map((v,i)=>(v+(AP.a[i]-v)*ea)*z*1.25); mira = AP.mira; k = 0;
            salida = {pos, mira, up, fov};
          } else {
            if(!tVuelo){ tVuelo = t;
              if(!salida) salida = {pos:mezcla(T.mira, T.pos, 1.7), mira:T.mira, up:T.up, fov:T.fov}; }
            k = quietud ? 1 : Math.min(1, (t-tVuelo)/1700);
            const e = k<.5 ? 4*k*k*k : 1-Math.pow(-2*k+2, 3)/2;
            pos = mezcla(salida.pos, T.pos, e); mira = mezcla(salida.mira, T.mira, e);
            up = mezcla(salida.up, T.up, e); fov = salida.fov+(T.fov-salida.fov)*e;
            k = e;
          }
          camera.up.set(up[0], up[1], up[2]);
          camera.position.set(pos[0], pos[1], pos[2]); camera.lookAt(mira[0], mira[1], mira[2]);
          if(camera.fov!==fov){ camera.fov = fov; camera.updateProjectionMatrix(); }
          if(k>0) camera.setViewOffset(W, H, T.ox*k, T.oy*k, W, H); else camera.clearViewOffset();
        } else if(P && !dino){
          const k = quietud ? 1 : Math.min(1, (t-t0)/(P.dura*1000)), e = 1-Math.pow(1-k, 3);
          camera.position.set((P.de[0]+(P.a[0]-P.de[0])*e)*z, (P.de[1]+(P.a[1]-P.de[1])*e)*z, (P.de[2]+(P.a[2]-P.de[2])*e)*z);
          camera.lookAt(P.mira[0], P.mira[1], P.mira[2]);
        } else {
          if(!quietud) vuelta += dt*(dino ? .00045 : .00005);
          camera.position.set(centro[0]+Math.cos(vuelta)*radio*z, alto*z, centro[2]+Math.sin(vuelta)*radio*z);
          camera.lookAt(centro[0], centro[1], centro[2]);
        }
        if(fuego && !quietud) fuego.intensity = L.fuego*(.82+Math.sin(t*.011)*.1+Math.sin(t*.031)*.08);
        renderer.render(scene, camera);
        if(plano==='tablero' && tVuelo && t-tVuelo > 1800) canvas.dataset.posado = '1';
        if(!muerto && !canvas.dataset.listo){ canvas.dataset.listo = '1'; setListo(true); if(onEstado) onEstado('listo'); }
      };
      raf = requestAnimationFrame(cuadro);
    })().catch(()=>{ if(!muerto && onEstado) onEstado('fallo'); });
    return ()=>{
      muerto = true; cancelAnimationFrame(raf);
      if(alSalir) alSalir();
      if(renderer){ renderer.dispose(); renderer.forceContextLoss(); }
    };
  },[hora, plano, dino && dino.name]);
  return <canvas ref={lienzo} aria-hidden="true" className={'diorama '+(listo?'listo ':'')+cls}/>;
}
Object.assign(FG.ui, {Diorama, tieneDino3D});
