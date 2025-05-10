/**
 * 移除数组中的重复元素，保留最后一个出现的元素。
 * 该函数通过从数组的末尾开始遍历，使用 `Set` 来记录已经出现过的元素 ID，
 * 从而确保每个 ID 只保留最后一个出现的元素。
 * 
 * @param {Array<{id: any}>} arr - 需要去重的数组，数组中的元素必须包含 `id` 属性。
 * @returns {Array<{id: any}>} - 去重后的数组，保留原始顺序。
 */
export function removeDuplicatesKeepLast<T extends { id: any }>(arr: T[]): T[] {
  const idMap = new Map<string, T>();

  arr.forEach(item => {
      // 更安全的标准化方法
      const idStr = String(item.id);
      const normalizedKey = /^\d+$/.test(idStr) 
          ? `num_${idStr}`  // 纯数字字符串标准化为"num_123"形式
          : `str_${idStr}`; // 其他字符串保持原样

      idMap.set(normalizedKey, item); // 总是保留最后出现的项
  });

  return Array.from(idMap.values());
}