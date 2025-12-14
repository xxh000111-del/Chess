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
}

// 下面定义具体子类，每个子类在内部指定自己的初始位置和颜色
export class RedPiece extends Piece {
  constructor() { super(0, 0, '#e53935'); }
}

export class OrangePiece extends Piece {
  constructor() { super(1, 0, '#fb8c00'); }
}

export class YellowPiece extends Piece {
  constructor() { super(2, 1, '#fdd835'); }
}

export class GreenPiece extends Piece {
  constructor() { super(3, 3, '#2e7d32'); }
}

export class TealPiece extends Piece {
  constructor() { super(4, 2, '#00897b'); }
}

export class BluePiece extends Piece {
  constructor() { super(5, 1, '#1e88e5'); }
}

export class IndigoPiece extends Piece {
  constructor() { super(6, 2, '#3949ab'); }
}

export class PurplePiece extends Piece {
  constructor() { super(5, 4, '#8e24aa'); }
}

export class BlackPiece extends Piece {
  constructor() { super(7, 2, '#000000', 'black'); }
}

export class WhitePiece extends Piece {
  constructor() { super(6, 0, '#ffffff', 'white'); }
}
