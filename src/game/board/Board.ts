import { Piece } from "@/game/board/Piece";


export class Board {
  readonly rows: number;
  readonly cols: number;
  readonly cellSize: number;

  // 光标已移除；使用鼠标选中/拖动棋子进行控制

  pieces: Piece[] = [];
  selectedPiece: Piece | null = null; // 点击选中棋子
  draggingPiece: Piece | null = null;  // 拖动中的棋子
  dragOffsetX = 0; // 拖动鼠标与棋子中心偏移
  dragOffsetY = 0;
  // 布局 / 视觉
  private originX = 0;
  private originY = 0;
  private pieceImages: Record<string, HTMLImageElement> = {};

  constructor(rows: number, cols: number, cellSize: number) {
    this.rows = rows;
    this.cols = cols;
    this.cellSize = cellSize;
  }

  /** 返回目标格列表，表示选中棋子可以移动到的格 */
  getMoveTargets(piece: Piece) {
    const targets: Array<{ x: number; y: number }> = [];
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (piece.canMoveTo(x, y, this)) targets.push({ x, y });
      }
    }
    return targets;
  }

  addPiece(piece: Piece) {
    this.pieces.push(piece);
  }

  isCellOccupied(x: number, y: number) {
    return this.pieces.some(p => p.x === x && p.y === y);
  }

  // 光标控制已移除，改为直接通过鼠标选中和拖拽棋子
  draw(ctx: CanvasRenderingContext2D) {
    // 计算并应用居中布局
    const boardWidth = this.cols * this.cellSize;
    const boardHeight = this.rows * this.cellSize;
    // 使用预先计算的布局（由 `layout` 在 resize 时设置）
    const canvasWidth = ctx.canvas.clientWidth || ctx.canvas.width;
    const canvasHeight = ctx.canvas.clientHeight || ctx.canvas.height;
    // 如果 origin 尚未设置（例如未调用 layout），则根据 canvas CSS 大小进行一次性计算
    if (!this.originX && !this.originY) {
      this.originX = Math.round((canvasWidth - boardWidth) / 2);
      this.originY = Math.round((canvasHeight - boardHeight) / 2);
    }

    // 背景：圆角板块 + 投影
    ctx.save();
    ctx.fillStyle = '#1e1b18';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 12;
    roundRect(ctx, this.originX - 8, this.originY - 8, boardWidth + 16, boardHeight + 16, 8, true, false);
    ctx.restore();

    // 将原点平移到棋盘左上角，便于按格绘制
    ctx.save();
    ctx.translate(this.originX, this.originY);

    // 网格
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

    // 绘制棋子（确保拖动棋子绘制在最上层）。非拖动棋子正常绘制；选中棋子绘制描边
    // 如果有选中棋子，先绘制可移动目标高亮
    if (this.selectedPiece && !this.draggingPiece) {
      const targets = this.getMoveTargets(this.selectedPiece);
      ctx.save();
      ctx.fillStyle = 'rgba(80,160,255,0.18)';
      ctx.strokeStyle = 'rgba(80,160,255,0.35)';
      for (const t of targets) {
        const rx = t.x * this.cellSize;
        const ry = t.y * this.cellSize;
        ctx.fillRect(rx + 2, ry + 2, this.cellSize - 4, this.cellSize - 4);
        ctx.strokeRect(rx + 2, ry + 2, this.cellSize - 4, this.cellSize - 4);
      }
      ctx.restore();
    }

    for (const piece of this.pieces) {
      if (piece === this.draggingPiece) continue;
      this.drawPieceAt(ctx, piece, piece.x * this.cellSize, piece.y * this.cellSize);
      // 选中描边
      if (piece === this.selectedPiece) {
        const px = piece.x * this.cellSize;
        const py = piece.y * this.cellSize;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(px + this.cellSize / 2, py + this.cellSize / 2, this.cellSize * 0.35 + 2, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    if (this.draggingPiece) {
      const localX = this.dragX - this.originX - this.dragOffsetX;
      const localY = this.dragY - this.originY - this.dragOffsetY;
      this.drawPieceAt(ctx, this.draggingPiece, localX, localY);
    }

    ctx.restore();
  }

  /**
   * 预计算布局（在需要时由外部在初始阶段调用）
   */
  layout(canvasWidth: number, canvasHeight: number) {
    const boardWidth = this.cols * this.cellSize;
    const boardHeight = this.rows * this.cellSize;
    this.originX = Math.round((canvasWidth - boardWidth) / 2);
    this.originY = Math.round((canvasHeight - boardHeight) / 2);
  }

  /** 将格坐标转换为像素坐标 */
  cellToPixel(x: number, y: number) {
    return { px: this.originX + x * this.cellSize, py: this.originY + y * this.cellSize };
  }

  /** 将像素坐标转换为格坐标 */
  pixelToCell(px: number, py: number) {
    return { x: Math.floor((px - this.originX) / this.cellSize), y: Math.floor((py - this.originY) / this.cellSize) };
  }

  /**
   * 移动当前选中棋子（键盘控制）
   */
  moveSelected(dx: number, dy: number) {
    if (!this.selectedPiece) return;
    this.selectedPiece.x = Math.max(0, Math.min(this.cols - 1, this.selectedPiece.x + dx));
    this.selectedPiece.y = Math.max(0, Math.min(this.rows - 1, this.selectedPiece.y + dy));
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
      // dragOffset 使用本地坐标（相对于棋盘左上角）
      const localX = px - this.originX;
      const localY = py - this.originY;
      this.dragOffsetX = localX - piece.x * this.cellSize;
      this.dragOffsetY = localY - piece.y * this.cellSize;
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
      const tx = Math.max(0, Math.min(this.cols - 1, x));
      const ty = Math.max(0, Math.min(this.rows - 1, y));
      // 只有当目标格合法且根据 piece 规则允许时才执行移动
      if (this.draggingPiece.canMoveTo(tx, ty, this)) {
        this.draggingPiece.moveTo(tx, ty, this);
      }
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
        // 若当前选中棋子允许移动到该位置则移动
        if (this.selectedPiece.canMoveTo(x, y, this)) {
          this.selectedPiece.moveTo(x, y, this);
        }
        this.selectedPiece = null; // 移动后取消选中
      } else if (clickedPiece === this.selectedPiece) {
        // 点击同一个棋子，取消选中
        this.selectedPiece = null;
      } else {
        // 点击其他棋子，切换选中
        this.selectedPiece = clickedPiece;
        if (this.selectedPiece.onSelect) this.selectedPiece.onSelect(this);
      }
    } else {
      // 未选中棋子，点击有棋子则选中
      if (clickedPiece) this.selectedPiece = clickedPiece;
      if (this.selectedPiece && this.selectedPiece.onSelect) this.selectedPiece.onSelect(this);
    }

    // 同时更新光标位置
    // removed cursor; selection already updated above
  }

  private drawPieceAt(ctx: CanvasRenderingContext2D, piece: Piece, px: number, py: number) {
    // px/py are local to board (not canvas). 绘制图片或圆形
    if (piece.imgKey && this.pieceImages[piece.imgKey]) {
      const img = this.pieceImages[piece.imgKey];
      ctx.drawImage(img, px + 4, py + 4, this.cellSize - 8, this.cellSize - 8);
    } else {
      ctx.fillStyle = piece.color;
      ctx.beginPath();
      ctx.arc(px + this.cellSize / 2, py + this.cellSize / 2, this.cellSize / 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /** 异步加载默认图片资源 */
  async loadAssets() {
    const assets: Record<string, string> = {
      white: 'piece_white.svg',
      black: 'piece_black.svg'
    };
    const promises: Promise<void>[] = [];
    for (const key of Object.keys(assets)) {
      const img = new Image();
      // 当 dev server 有 base（例如 /Chess/），确保 URL 使用当前路径作为基底
      const base = window.location.pathname.replace(/\/$/, '');
      const src = base + '/' + assets[key];
      const p = new Promise<void>((res) => {
        img.onload = () => res();
        img.onerror = () => res();
      });
      img.src = src;
      this.pieceImages[key] = img;
      promises.push(p);
    }
    await Promise.all(promises);
  }
}

/** 绘制一个圆角矩形（辅助） */
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill = false, stroke = true) {
  const radius = Math.max(0, Math.min(r, Math.min(w / 2, h / 2)));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}
