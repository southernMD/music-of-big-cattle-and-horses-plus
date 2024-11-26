// modInput.ts
let undoStack: string[] = [""];
let currentKey = "";
export const modInput = async (e: KeyboardEvent, inputRef: HTMLInputElement, key: string): Promise<string> => {
  let st = inputRef.selectionStart || 0;
  let end = inputRef.selectionEnd || 0;
  // 撤销功能

    console.log(undoStack,currentKey);
  const handleUndo = (): string => {
    if (undoStack.length >= 1) {
      const previousKey = undoStack[undoStack.length - 1];
      const t = undoStack.pop(); // 移除当前状态
      currentKey = previousKey;
      if(undoStack.length === 0)undoStack.push("")
      return t ?? "";
    }
    return key;
  };

  // 剪切功能
  const handleCut = async(): Promise<string> => {
    if (st !== end) {
      const cutText = key.slice(st, end);
      return navigator.clipboard.writeText(cutText).then(() => {
        key = key.slice(0, st) + key.slice(end);
        inputRef.value = key; // 更新 inputRef 的值
        inputRef.setSelectionRange(st, st); // 重置光标位置
        return key;
      });
    }
    return key;
  };

  // 复制功能
  const handleCopy = (): void => {
    if (st !== end) {
      const copyText = key.slice(st, end);
      navigator.clipboard.writeText(copyText);
    }
  };

  // 粘贴功能
  const handlePaste = async (): Promise<string> => {
    const pasteText = await navigator.clipboard.readText();
    key = key.slice(0, st) + pasteText + key.slice(end);
    inputRef.value = key; // 更新 inputRef 的值
    inputRef.setSelectionRange(st + pasteText.length, st + pasteText.length); // 重置光标位置
    return key;
  };

  // 全选功能
  const handleSelectAll = (): void => {
    inputRef.setSelectionRange(0, key.length);
  };

  // 监听组合键
  if (e.ctrlKey) {
    switch (e.key) {
      case 'z':
        e.preventDefault();
        key = handleUndo();
        break;
      case 'x':
        e.preventDefault();
        key = await handleCut();
        break;
      case 'c':
        e.preventDefault();
        handleCopy();
        break;
      case 'v':
        e.preventDefault();
        key = await handlePaste();
        break;
      case 'a':
        e.preventDefault();
        handleSelectAll();
        break;
      default:
        break;
    }
  } else {
    if (e.key.length == 1) {
      if (inputRef.selectionStart != inputRef.selectionEnd) {
        key = key.slice(0, st) + e.key + key.slice(end);
      } else {
        key = key.slice(0, st) + e.key + key.slice(st);
      }
      inputRef.value = key; // 更新 inputRef 的值
      inputRef.setSelectionRange(st + 1, st + 1); // 重置光标位置
    } else if (e.key == 'Backspace' || e.key == 'Delete') {
      if (st != end) {
        key = key.slice(0, st) + key.slice(end);
      } else {
        if (e.key == 'Backspace' && st > 0) {
          key = key.slice(0, st - 1) + key.slice(st);
        } else if (e.key == 'Delete' && end < key.length) {
          key = key.slice(0, st) + key.slice(st + 1);
        }
      }
    } else if (e.key == 'ArrowLeft') {
      if (st != end) {
        inputRef.setSelectionRange(st, st);
      } else {
        let p = st - 1 <= 0 ? 0 : st - 1;
        inputRef.setSelectionRange(p, p);
      }
    } else if (e.key == 'ArrowRight') {
      if (st != end) {
        inputRef.setSelectionRange(end, end);
      } else {
        inputRef.setSelectionRange(st + 1, st + 1);
      }
    }
  }
  if (currentKey !== key) {
    undoStack.push(currentKey);
    currentKey = key;
  }
  return key;
};