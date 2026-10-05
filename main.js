import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const specimens = [
  { name:'六角板', english:'HEXAGONAL PLATE', form:'薄い六角形の板', feature:'6つの辺と、平らな面', description:'シンプルな六角形をした板状の結晶。正面と横から見比べると、平らな面と薄い厚みの違いがよく分かります。' },
  { name:'星状六花', english:'STELLAR PLATE', form:'星形に広がる板', feature:'中心から広がる6本の腕', description:'六角形の角から腕が伸びた、星形の板状結晶。幅のある6本の腕と、その間にできるくぼみを観察してみましょう。' },
  { name:'樹枝状六花', english:'STELLAR DENDRITE', form:'枝分かれした6本の腕', feature:'木の枝のような側枝', description:'6本の腕から細かな枝が伸びる、華やかな結晶。中心から先端へ、さらに側枝へと続く形を、拡大してたどってみましょう。' },
  { name:'角柱', english:'HEXAGONAL COLUMN', form:'六角形の柱', feature:'六角形の端面と長い側面', description:'板状の結晶とは異なり、長さ方向に成長した六角柱。端から見る六角形と、横から見る柱の姿を比べてみましょう。' },
  { name:'針状', english:'NEEDLE', form:'細長い柱', feature:'細さと長さのバランス', description:'柱が細く長く伸びた、針のような結晶。六角板とは大きく異なる輪郭ですが、同じ氷の結晶の仲間です。' },
  { name:'鼓型', english:'CAPPED COLUMN', form:'両端に板を持つ柱', feature:'柱と2枚の六角板', description:'柱の両端に板状の結晶が付いた形。成長中に環境が変わると、柱の端に板が育つことがあります。横から見ると糸巻きのような姿です。' },
];
const $ = id => document.getElementById(id);
const host = $('viewer');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, 1, .1, 100);
const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;
host.appendChild(renderer.domElement);
renderer.domElement.setAttribute('aria-label','雪の結晶の3Dモデル。ドラッグまたはタッチで回転できます。');
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 3.8;
controls.maxDistance = 15;
controls.autoRotate = !matchMedia('(prefers-reduced-motion: reduce)').matches;
controls.autoRotateSpeed = .7;
scene.add(new THREE.HemisphereLight(0xd5f6ff,0x315666,2.4));
for (const [color,intensity,position] of [[0xffffff,4,[3,4,5]],[0x6acfff,3,[-4,0,2]],[0xb1c9ff,2,[0,-3,-4]]]) {
  const light = new THREE.DirectionalLight(color,intensity); light.position.set(...position); scene.add(light);
}
const ice = new THREE.MeshPhysicalMaterial({ color:0xbce8f3,metalness:.18,roughness:.2,transparent:true,opacity:.83,clearcoat:1,clearcoatRoughness:.1,side:THREE.DoubleSide,depthWrite:true });
const edgeMaterial = new THREE.LineBasicMaterial({color:0xd9faff,transparent:true,opacity:.65});
let crystal;
let selectedIndex=0;
function addSolid(group, geometry, position = [0,0,0]) {
  const mesh = new THREE.Mesh(geometry,ice); mesh.position.set(...position); group.add(mesh);
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geometry,24),edgeMaterial); edges.position.copy(mesh.position); group.add(edges);
}
function plateGeometry(points, depth=.09) {
  const shape = new THREE.Shape(points.map(([x,y])=>new THREE.Vector2(x,y)));
  const g = new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelThickness:.012,bevelSize:.012,bevelSegments:1,steps:1});
  g.translate(0,0,-depth/2); return g;
}
function hex(radius,depth) {
  return plateGeometry(Array.from({length:6},(_,i)=>[Math.cos(i*Math.PI/3)*radius,Math.sin(i*Math.PI/3)*radius]),depth);
}
function branch(group,a,b,width=.055) {
  const dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy),nx=-dy/length*width/2,ny=dx/length*width/2;
  addSolid(group,plateGeometry([[a[0]+nx,a[1]+ny],[a[0]-nx,a[1]-ny],[b[0]-nx,b[1]-ny],[b[0]+nx,b[1]+ny]],.075));
}
export function makeCrystal(index) {
  const group = new THREE.Group();
  if(index===0) {
    addSolid(group,hex(1.65,.12));
    // Concentric growth markings on the upper and lower faces.
    for(const z of [-.071,.071]) for(const radius of [.58,1.1,1.43]) {
      const points = Array.from({length:7},(_,i)=>new THREE.Vector3(Math.cos(i*Math.PI/3)*radius,Math.sin(i*Math.PI/3)*radius,z));
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),edgeMaterial));
    }
  } else if(index===1) {
    const points=[];
    for(let i=0;i<6;i++) for(const [offset,radius] of [[-.21,.65],[-.095,1.38],[0,1.9],[.095,1.38],[.21,.65]]) {
      const a=i*Math.PI/3+offset;points.push([Math.cos(a)*radius,Math.sin(a)*radius]);
    }
    addSolid(group,plateGeometry(points));
    for(let i=0;i<6;i++){const a=i*Math.PI/3;group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,.06),new THREE.Vector3(1.78*Math.cos(a),1.78*Math.sin(a),.06)]),edgeMaterial));}
  } else if(index===2) {
    addSolid(group,hex(.32,.095));
    for(let i=0;i<6;i++) {
      const a=i*Math.PI/3,rotate=([x,y])=>[x*Math.cos(a)-y*Math.sin(a),x*Math.sin(a)+y*Math.cos(a)];
      branch(group,rotate([.15,0]),rotate([2,0]),.085);
      for(const x of [.55,.9,1.25,1.6]) for(const side of [-1,1]) {
        const length=(2-x)*.43,start=[x,0],end=[x+length*.65,side*length];
        branch(group,rotate(start),rotate(end),.055);
        if(x<1.3) {
          const mid=[x+length*.35,side*length*.55];
          branch(group,rotate(mid),rotate([mid[0]+length*.4,mid[1]]),.035);
        }
      }
    }
  } else if(index===3) {
    addSolid(group,hex(.57,2.8));
  } else if(index===4) {
    addSolid(group,hex(.14,3.7));
  } else {
    addSolid(group,hex(.32,1.65));
    for(const z of [-.85,.85]) addSolid(group,hex(1.3,.09),[0,0,z]);
  }
  return group;
}
function resetView(front=false) {
  crystal.rotation.set(0,0,0);
  if(!front&&selectedIndex>=3){crystal.rotation.x=.85;crystal.rotation.y=.45;}
  camera.position.set(...(front?[0,0,8.8]:[2.9,1.9,8.1]));controls.target.set(0,0,0);controls.update();
}
function select(index) {
  selectedIndex=index;
  if(crystal){scene.remove(crystal);crystal.traverse(obj=>obj.geometry?.dispose());}
  crystal=makeCrystal(index);scene.add(crystal);
  // Columns lie diagonally so their length and hexagonal end can both be seen.
  if(index>=3){crystal.rotation.x=.85;crystal.rotation.y=.45;}
  const item=specimens[index];
  for(const key of ['name','english','description','form','feature']) $(key).textContent=item[key];
  $('number').textContent=String(index+1).padStart(2,'0');
  document.querySelectorAll('.card').forEach((el,i)=>el.setAttribute('aria-pressed',String(i===index)));
  resetView();
}
function icon(index) {
  if(index===0) return '<polygon points="25,6 45,18 45,42 25,54 5,42 5,18"/><polygon points="25,14 38,22 38,38 25,46 12,38 12,22"/>';
  if(index<3){let paths='';for(let i=0;i<6;i++){let d=index===1?'M0 0 L-4 -16 L0 -25 L4 -16 Z':'M0 0V-25 M0 -8L-8 -15 M0 -8L8 -15 M0 -14L-7 -21 M0 -14L7 -21';paths+=`<path d="${d}" transform="translate(25 30) rotate(${i*60})"/>`;}return paths;}
  const w=index===4?3:10;
  return `<path d="M${25-w} 10L25 6L${25+w} 10V48L25 54L${25-w} 48Z M${25-w} 10L25 14L${25+w} 10 M25 14V54"/>`+(index===5?'<path d="M8 6L25 1L42 6L25 12Z M8 49L25 43L42 49L25 59Z"/>':'');
}
specimens.forEach((item,index)=>{
  const button=document.createElement('button');button.className='card';button.setAttribute('aria-pressed','false');
  button.innerHTML=`<span class="card-number">0${index+1}</span><svg viewBox="0 0 50 60" aria-hidden="true">${icon(index)}</svg><strong>${item.name}</strong><small>${item.english}</small>`;
  button.addEventListener('click',()=>select(index));$('collection').appendChild(button);
});
function syncRotate(){ $('rotate').setAttribute('aria-pressed',String(controls.autoRotate));$('rotate').textContent=`自動回転 ${controls.autoRotate?'ON':'OFF'}`; }
$('rotate').addEventListener('click',()=>{controls.autoRotate=!controls.autoRotate;syncRotate();});
$('reset').addEventListener('click',()=>resetView());
$('front').addEventListener('click',()=>{crystal.rotation.set(0,0,0);controls.autoRotate=false;syncRotate();resetView(true);});
new ResizeObserver(()=>{const {width,height}=host.getBoundingClientRect();camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height);}).observe(host);
select(0);syncRotate();$('status').remove();
let lastTime;
renderer.setAnimationLoop(time=>{const delta=lastTime===undefined?0:Math.min((time-lastTime)/1000,.1);lastTime=time;controls.update(delta);renderer.render(scene,camera);});
