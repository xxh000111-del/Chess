/**
 * 棋子类，记录棋子位置和颜色
 */
export class Piece {
  constructor(
    public x: number, // 列索引
    public y: number, // 行索引
    public color: string = 'blue' // 默认颜色
  ) {}
}
