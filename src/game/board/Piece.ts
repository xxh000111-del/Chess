/**
 * 棋子类，记录棋子位置和颜色
 */
export class Piece {
  constructor(
    public x: number, // 列索引
    public y: number, // 行索引
    public color: string = 'blue', // 默认颜色
    public imgKey?: string // 可选图片键，供 Board 加载并绘制
  ) {}

  /**
   * 检查是否能移动到目标格（子类可覆盖实现特定规则）
   */
  canMoveTo(tx: number, ty: number, board: import('./Board').Board): boolean {
    // 默认规则：只能移动到相邻格（包含对角）且目标在棋盘内且不为当前格
    const dx = Math.abs(tx - this.x);
    const dy = Math.abs(ty - this.y);
    if ((dx === 0 && dy === 0) || tx < 0 || ty < 0 || tx >= board.cols || ty >= board.rows) return false;
    return dx <= 1 && dy <= 1;
  }

  /**
   * 执行移动（子类可覆盖实现额外副作用）
   */
  moveTo(tx: number, ty: number, _board: import('./Board').Board) {
    this.x = tx;
    this.y = ty;
  }

  /** 当被选中时触发（可用于显示提示/激活技能） */
  onSelect?(_board: import('./Board').Board): void;
}

// 下面定义具体子类，每个子类在内部指定自己的初始位置和颜色
export class RedPiece extends Piece {
  constructor() { super(0, 0, '#e53935'); }
  // 红子：像王一样移动一步
  canMoveTo(tx: number, ty: number, board: import('./Board').Board) {
    const dx = Math.abs(tx - this.x);
    const dy = Math.abs(ty - this.y);
    if ((dx === 0 && dy === 0)) return false;
    return dx <= 1 && dy <= 1 && tx >= 0 && ty >= 0 && tx < board.cols && ty < board.rows && !board.isCellOccupied(tx, ty);
  }
}

export class OrangePiece extends Piece {
  constructor() { super(1, 0, '#fb8c00'); }
  // 橙子：直线最多两格
  canMoveTo(tx: number, ty: number, board: import('./Board').Board) {
    const dx = Math.abs(tx - this.x);
    const dy = Math.abs(ty - this.y);
    if ((dx === 0 && dy === 0)) return false;
    const straight = (dx === 0 && dy <= 2) || (dy === 0 && dx <= 2);
    return straight && !board.isCellOccupied(tx, ty);
  }
}

export class YellowPiece extends Piece {
  constructor() { super(2, 1, '#fdd835'); }
  // 黄子：可以跳跃，最多两格任意方向（不受阻挡）
  canMoveTo(tx: number, ty: number, board: import('./Board').Board) {
    const dx = Math.abs(tx - this.x);
    const dy = Math.abs(ty - this.y);
    if (dx === 0 && dy === 0) return false;
    return (dx <= 2 && dy <= 2) && !(tx < 0 || ty < 0 || tx >= board.cols || ty >= board.rows) && !board.isCellOccupied(tx, ty);
  }
}

export class GreenPiece extends Piece {
  constructor() { super(3, 3, '#2e7d32'); }
  // 绿子：沿对角无限移动（主教）
  canMoveTo(tx: number, ty: number, board: import('./Board').Board) {
    const dx = Math.abs(tx - this.x);
    const dy = Math.abs(ty - this.y);
    if (dx === 0 || dy === 0) return false;
    if (dx !== dy) return false;
    if (board.isCellOccupied(tx, ty)) return false;
    return true;
  }
}

export class TealPiece extends Piece {
  constructor() { super(4, 2, '#00897b'); }
  // 青子：直线无限（车）
  canMoveTo(tx: number, ty: number, board: import('./Board').Board) {
    const dx = Math.abs(tx - this.x);
    const dy = Math.abs(ty - this.y);
    if (dx !== 0 && dy !== 0) return false;
    if (board.isCellOccupied(tx, ty)) return false;
    return dx !== 0 || dy !== 0;
  }
}

export class BluePiece extends Piece {
  constructor() { super(5, 1, '#1e88e5'); }
  // 蓝子：骑士跳跃
  canMoveTo(tx: number, ty: number, board: import('./Board').Board) {
    const dx = Math.abs(tx - this.x);
    const dy = Math.abs(ty - this.y);
    const ok = (dx === 1 && dy === 2) || (dx === 2 && dy === 1);
    return ok && !board.isCellOccupied(tx, ty);
  }
}

export class IndigoPiece extends Piece {
  constructor() { super(6, 2, '#3949ab'); }
  // 靛蓝：皇后（直线或对角）
  canMoveTo(tx: number, ty: number, board: import('./Board').Board) {
    const dx = Math.abs(tx - this.x);
    const dy = Math.abs(ty - this.y);
    if (dx === 0 && dy === 0) return false;
    const straightOrDiag = (dx === 0 || dy === 0) || (dx === dy);
    return straightOrDiag && !board.isCellOccupied(tx, ty);
  }
}

export class PurplePiece extends Piece {
  constructor() { super(5, 4, '#8e24aa'); }
  // 紫子：能沿对角走两格
  canMoveTo(tx: number, ty: number, board: import('./Board').Board) {
    const dx = Math.abs(tx - this.x);
    const dy = Math.abs(ty - this.y);
    if (dx === 0 && dy === 0) return false;
    return dx === dy && dx <= 2 && !board.isCellOccupied(tx, ty);
  }
}

export class BlackPiece extends Piece {
  constructor() { super(7, 2, '#000000', 'black'); }
  // 黑子：不能移动（不可移动）
  canMoveTo() { return false; }
  onSelect?(_board: import('./Board').Board) {
    // 选中时切换颜色以示提醒
    this.color = this.color === '#000000' ? '#333' : '#000000';
  }
}

export class WhitePiece extends Piece {
  constructor() { super(6, 0, '#ffffff', 'white'); }
  // 白子：可以瞬移到任意空格
  canMoveTo(tx: number, ty: number, board: import('./Board').Board) {
    if (tx < 0 || ty < 0 || tx >= board.cols || ty >= board.rows) return false;
    if (tx === this.x && ty === this.y) return false;
    return !board.isCellOccupied(tx, ty);
  }
}
