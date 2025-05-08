import Cookies from "js-cookie";

// 获取 Cookie
export const getCookie = (key?: string) => {
  if (key) {
    // 如果传入了 key，返回指定的 Cookie
    return Cookies.get(key);
  } else {
    // 如果没有传入 key，返回所有 Cookies
    const cookies = document.cookie.split(";");
    const cookieMap: Record<string, string> = {};
    cookies.forEach((cookie) => {
      const [name, value] = cookie.split("=").map((part) => part.trim());
      if (name) {
        cookieMap[name] = value;
      }
    });
    return cookieMap;
  }
};
// 移除 Cookie
export const removeCookie = (key?: string) => {
  if (key) {
    // 如果传入了 key，只移除指定的 Cookie
    Cookies.remove(key);
  } else {
    // 如果没有传入 key，移除所有 Cookies
    const cookies = document.cookie.split(";");
    cookies.forEach((cookie) => {
      const name = cookie.split("=")[0].trim();
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    });
  }
};

// 设置 Cookie
export const setCookies = (cookieValue: string,forver:boolean) => {
  const cookies = cookieValue.split(";");
  const date = new Date();
  // 永不过期
  date.setFullYear(date.getFullYear() + 50);
  const expires = `expires=${date.toUTCString()}`;
  cookies.forEach((cookie) => {
    const cookieParts = cookie.split(";");
    const nameValuePair = cookieParts[0].split("=");
    const name = nameValuePair[0]?.trim();
    const value = nameValuePair[1]?.trim();
    console.info(`name: ${name}, value: ${value}`);
    document.cookie = forver ? `${name}=${value}; ${expires}; path=/` : `${name}=${value}; path=/`;
  });
};
