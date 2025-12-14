import { Board } from "@/game/board/Board";
import { KeyboardInput } from "@/input/KeyboardInput";
import { MouseInput } from "@/input/MouseInput";
import { Piece } from "@/game/board/Piece";

/**
 * 主游戏类，负责更新与渲染主循环以及输入的协调。
 */
export class Game {
  private lastTime = 0;
  private ctx: CanvasRenderingContext2D;
  private dpr = 1;

  private board: Board;
  private keyboard: KeyboardInput;
  private mouse: MouseInput;

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;

    this.board = new Board(8, 8, 64);

    // 初始化一些棋子示例
    this.board.addPiece(new Piece(0, 0, 'white'));
    this.board.addPiece(new Piece(3, 3, 'green'));
    this.board.addPiece(new Piece(5, 2, 'black'));

    this.keyboard = new KeyboardInput();
    this.mouse = new MouseInput(canvas);

    // 初始化画布尺寸并计算棋盘布局（考虑 devicePixelRatio）
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    window.addEventListener('orientationchange', () => this.resizeCanvas());

    // 当窗口尺寸改变时，Board.layout 会在 resizeCanvas 中更新
    // 绑定鼠标事件
    this.mouse.onMouseDown = (x, y) => this.board.handleMouseDown(x, y);
    this.mouse.onMouseMove = (x, y) => this.board.handleMouseMove(x, y);
    this.mouse.onMouseUp = (x, y) => this.board.handleMouseUp(x, y);
    this.mouse.onClick = (x, y) => this.board.handleClick(x, y);

    // 加载图片资源（非阻塞），加载后给部分棋子分配图片键
    this.board.loadAssets().then(() => {
      // 将 (0,0) 设为白棋图片，(5,2) 设为黑棋图片
      const p0 = this.board.pieces[0];
      if (p0) p0.imgKey = 'white';
      const p2 = this.board.pieces[2];
      if (p2) p2.imgKey = 'black';
    });

    this.start();
  }

  resizeCanvas() {
    this.dpr = Math.max(1, window.devicePixelRatio || 1);
    const cssWidth = Math.floor(window.innerWidth);
    const cssHeight = Math.floor(window.innerHeight);

    // 设置 CSS 大小用于布局和页面流
    this.canvas.style.width = cssWidth + 'px';
    this.canvas.style.height = cssHeight + 'px';

    // 设置画布像素大小并缩放上下文以考虑 DPR
    this.canvas.width = Math.floor(cssWidth * this.dpr);
    this.canvas.height = Math.floor(cssHeight * this.dpr);

    // 重置坐标变换并按 DPR 缩放，使后续以 CSS 像素为单位绘制
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    // 告知棋盘新的布局（使用 CSS 像素）
    this.board.layout(cssWidth, cssHeight);
  }

  /** 启动主循环 */
  start() {
    requestAnimationFrame(this.loop);
  }

  /** 主循环 */
  private loop = (time: number) => {
    const dt = time - this.lastTime;
    this.lastTime = time;

    this.update(dt);
    this.render();

    requestAnimationFrame(this.loop);
  };

  /** 更新游戏逻辑 */
  private update(_: number) {
    // 键盘控制光标移动
    if (this.keyboard.isPressed('ArrowUp')) this.board.moveCursor(0, -1);
    if (this.keyboard.isPressed('ArrowDown')) this.board.moveCursor(0, 1);
    if (this.keyboard.isPressed('ArrowLeft')) this.board.moveCursor(-1, 0);
    if (this.keyboard.isPressed('ArrowRight')) this.board.moveCursor(1, 0);
  }

  /** 绘制 */
  private render() {
    // 清屏
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 绘制棋盘 + 棋子 +光标
    this.board.draw(this.ctx);
  }
}
