// 主入口脚本，初始化画布并运行一个简单示例主循环
import { Game } from '@/game/Game';

const canvas = document.getElementById('game') as HTMLCanvasElement;

// 可选：自适应窗口
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const game = new Game(canvas);
// 启动游戏主循环
game.start();
