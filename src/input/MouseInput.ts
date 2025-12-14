/**
 * 鼠标输入处理器，追踪在 canvas 上的光标位置与按下状态
 * 支持注册事件回调
 */
export class MouseInput {
  x = 0;
  y = 0;
  pressed = false;

  // 可选回调
  onMouseDown: ((x: number, y: number) => void) | null = null;
  onMouseMove: ((x: number, y: number) => void) | null = null;
  onMouseUp: ((x: number, y: number) => void) | null = null;
  onClick: ((x: number, y: number) => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    canvas.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      this.x = e.clientX - rect.left;
      this.y = e.clientY - rect.top;

      if (this.onMouseMove) this.onMouseMove(this.x, this.y);
    });

    canvas.addEventListener('mousedown', e => {
      this.pressed = true;
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;

      if (this.onMouseDown) this.onMouseDown(px, py);
    });

    canvas.addEventListener('mouseup', e => {
      this.pressed = false;
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;

      if (this.onMouseUp) this.onMouseUp(px, py);
    });

    canvas.addEventListener('click', e => {
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;

      if (this.onClick) this.onClick(px, py);
    });
  }
}
