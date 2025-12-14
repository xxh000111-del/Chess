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

  private board: Board;
  private keyboard: KeyboardInput;
  private mouse: MouseInput;

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;

    this.board = new Board(8, 8, 64);

    // 初始化一些棋子示例
    this.board.addPiece(new Piece(0, 0, 'blue'));
    this.board.addPiece(new Piece(3, 3, 'green'));
    this.board.addPiece(new Piece(5, 2, 'orange'));

    this.keyboard = new KeyboardInput();
    this.mouse = new MouseInput(canvas);

    // 绑定鼠标事件
    this.mouse.onMouseDown = (x, y) => this.board.handleMouseDown(x, y);
    this.mouse.onMouseMove = (x, y) => this.board.handleMouseMove(x, y);
    this.mouse.onMouseUp = (x, y) => this.board.handleMouseUp(x, y);
   // this.mouse.onClick = (x, y) => this.board.handleClick(x, y);

    this.start();
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
