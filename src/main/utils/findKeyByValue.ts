export const noPrintName = ["to-currentTime"]
export function findKeyByValue<T>(obj: T, value: any): keyof T | undefined {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)&& obj[key] === value) {
        return key as keyof T;
      }
    }
    return undefined;
  }