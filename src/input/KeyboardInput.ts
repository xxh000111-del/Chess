/**
 * 简单的键盘输入监听器，记录当前按下的按键
 */
export class KeyboardInput {
  private keys = new Set<string>();

  constructor() {
    // 按下时加入集合
    window.addEventListener('keydown', e => this.keys.add(e.key));
    // 松开时移除集合
    window.addEventListener('keyup', e => this.keys.delete(e.key));
  }

  /**
   * 查询指定键当前是否按下
   * @param key 要查询的键名（例如 'ArrowUp'）
   */
  isPressed(key: string) {
    return this.keys.has(key);
  }
}
