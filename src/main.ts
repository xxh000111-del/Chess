console.log('main.ts loaded');

const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

// 适配屏幕
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// ===== 输入系统 =====
const keys: Record<string, boolean> = {};

window.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;
});

window.addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false;
});

// ===== 玩家 =====
const player = {
  x: 100,
  y: 100,
  size: 40,
  speed: 300 // 像素 / 秒
};

// ===== 主循环 =====
let lastTime = 0;

function loop(time: number) {
  const dt = (time - lastTime) / 1000; // 转成秒
  lastTime = time;

  update(dt);
  render();

  requestAnimationFrame(loop);
}

function update(dt: number) {
  if (keys['arrowup'] || keys['w']) player.y -= player.speed * dt;
  if (keys['arrowdown'] || keys['s']) player.y += player.speed * dt;
  if (keys['arrowleft'] || keys['a']) player.x -= player.speed * dt;
  if (keys['arrowright'] || keys['d']) player.x += player.speed * dt;
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'white';
  ctx.fillRect(player.x, player.y, player.size, player.size);
}



requestAnimationFrame(loop);
