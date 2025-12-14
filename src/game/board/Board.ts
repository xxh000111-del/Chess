import { Piece } from "@/game/board/Piece";


export class Board {
  readonly rows: number;
  readonly cols: number;
  readonly cellSize: number;

  cursorX = 0;
  cursorY = 0;

  pieces: Piece[] = [];
  selectedPiece: Piece | null = null; // 点击选中棋子
  draggingPiece: Piece | null = null;  // 拖动中的棋子
  dragOffsetX = 0; // 拖动鼠标与棋子中心偏移
  dragOffsetY = 0;

  constructor(rows: number, cols: number, cellSize: number) {
    this.rows = rows;
    this.cols = cols;
    this.cellSize = cellSize;
  }

  addPiece(piece: Piece) {
    this.pieces.push(piece);
  }

  moveCursor(dx: number, dy: number) {
    this.cursorX = Math.max(0, Math.min(this.cols - 1, this.cursorX + dx));
    this.cursorY = Math.max(0, Math.min(this.rows - 1, this.cursorY + dy));
  }

  setCursorByPixel(px: number, py: number) {
    const { x, y } = this.pixelToCell(px, py);
    this.cursorX = Math.max(0, Math.min(this.cols - 1, x));
    this.cursorY = Math.max(0, Math.min(this.rows - 1, y));
  }

  drawCursor(ctx: CanvasRenderingContext2D) {
    const { px, py } = this.cellToPixel(this.cursorX, this.cursorY);
    ctx.fillStyle = 'red';
    ctx.fillRect(px + 2, py + 2, this.cellSize - 4, this.cellSize - 4);
  }

  draw(ctx: CanvasRenderingContext2D) {
    // 绘制棋盘网格
    ctx.strokeStyle = '#555';
    for (let r = 0; r <= this.rows; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * this.cellSize);
      ctx.lineTo(this.cols * this.cellSize, r * this.cellSize);
      ctx.stroke();
    }
    for (let c = 0; c <= this.cols; c++) {
      ctx.beginPath();
      ctx.moveTo(c * this.cellSize, 0);
      ctx.lineTo(c * this.cellSize, this.rows * this.cellSize);
      ctx.stroke();
    }

    // 绘制棋子
    for (const piece of this.pieces) {
      let px = piece.x * this.cellSize;
      let py = piece.y * this.cellSize;

      // 拖动棋子时跟随鼠标
      if (piece === this.draggingPiece) {
        px = this.dragX - this.dragOffsetX;
        py = this.dragY - this.dragOffsetY;
      }

      ctx.fillStyle = piece.color;
      ctx.beginPath();
      ctx.arc(px + this.cellSize / 2, py + this.cellSize / 2, this.cellSize / 3, 0, Math.PI * 2);
      ctx.fill();
    }

    this.drawCursor(ctx);
  }

  /** 将格坐标转换为像素坐标 */
  cellToPixel(x: number, y: number) {
    return { px: x * this.cellSize, py: y * this.cellSize };
  }

  /** 将像素坐标转换为格坐标 */
  pixelToCell(px: number, py: number) {
    return { x: Math.floor(px / this.cellSize), y: Math.floor(py / this.cellSize) };
  }

  // --- 拖拽状态 ---
  private dragX = 0;
  private dragY = 0;

  /** 鼠标按下 */
  handleMouseDown(px: number, py: number) {
    const { x, y } = this.pixelToCell(px, py);
    const piece = this.pieces.find(p => p.x === x && p.y === y);
    if (piece) {
      this.draggingPiece = piece;
      this.dragOffsetX = px - piece.x * this.cellSize;
      this.dragOffsetY = py - piece.y * this.cellSize;
    } else {
      this.selectedPiece = null;
    }
  }

  /** 鼠标移动 */
  handleMouseMove(px: number, py: number) {
    if (this.draggingPiece) {
      this.dragX = px;
      this.dragY = py;
    }
  }

  /** 鼠标松开 */
  handleMouseUp(px: number, py: number) {
    if (this.draggingPiece) {
      const { x, y } = this.pixelToCell(px, py);
      this.draggingPiece.x = Math.max(0, Math.min(this.cols - 1, x));
      this.draggingPiece.y = Math.max(0, Math.min(this.rows - 1, y));
      this.draggingPiece = null;
    }
  }

    /** 根据鼠标点击选择或移动棋子 */
  handleClick(px: number, py: number) {
    const { x, y } = this.pixelToCell(px, py);

    // 查找点击位置是否有棋子
    const clickedPiece = this.pieces.find(p => p.x === x && p.y === y);

    if (this.selectedPiece) {
      // 已选中棋子，点击空格则移动
      if (!clickedPiece) {
        this.selectedPiece.x = x;
        this.selectedPiece.y = y;
        this.selectedPiece = null; // 移动后取消选中
      } else if (clickedPiece === this.selectedPiece) {
        // 点击同一个棋子，取消选中
        this.selectedPiece = null;
      } else {
        // 点击其他棋子，切换选中
        this.selectedPiece = clickedPiece;
      }
    } else {
      // 未选中棋子，点击有棋子则选中
      if (clickedPiece) this.selectedPiece = clickedPiece;
    }

    // 同时更新光标位置
    this.cursorX = x;
    this.cursorY = y;
  }
}
