<p align="center">
  <a href="https://github.com/southernMD/music-of-big-cattle-and-horses-plus" target="_blank" rel="noopener noreferrer">
    <img width="180" src="https://cdn.jsdelivr.net/gh/southernMD/images@main/img/202305221454973.png" alt="Vite logo">
  </a>
</p>
<br/>
<p align="center">
  <a href=""><img src="https://img.shields.io/github/package-json/v/southernMD/music-of-big-cattle-and-horses-plus" alt="version "></a>
  <a href=""><img src="https://img.shields.io/badge/vue-v3.2-brightgreen" alt="use vue3.2"></a>
  <a href=""><img src="https://img.shields.io/github/license/southernMD/music-of-big-cattle-and-horses-plus" alt="GPL-3.0"></a>
<a href=""><img src="https://img.shields.io/badge/electron-v21.3.3-brightgreen" alt="electron v21.3.3"></a>
</p>

# 大牛马音乐 bigNMuice

基于electron与vue3.2 环境的音乐播放器，只支持windows

## 基于

[electron-vite](https://github.com/alex8088/electron-vite)
[NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi)
## 下载

[v0.0.2-beta](https://github.com/southernMD/music-of-big-cattle-and-horses-plus/releases/download/v0.0.2-beta/bingNMmusic-0.0.2-beta-setup.exe)<br>
[v0.0.3-beta](https://github.com/southernMD/music-of-big-cattle-and-horses-plus/releases/download/v0.0.3-beta/bingNMmusic-0.0.3-beta-setup.exe)修复bug，更新打开方式限.mp3格式<br>
[v0.0.4-beta](https://github.com/southernMD/music-of-big-cattle-and-horses-plus/releases/download/v0.0.4-beta/bingNMmusic-0.0.4-beta-setup.exe)修复bug，应用内更新
## 克隆项目

```shell
git clone https://github.com/southernMD/music-of-big-cattle-and-horses-plus.git
cd music-of-big-cattle-and-horses-plus
yarn
```

## 运行

```shell
yarn dev //开发环境
yarn start //生产环境
```
如果命令行有报错是正常现象，不影响使用
### 构建

```bash
yarn build:win
```

### 注意
注意一下几点

- yarn dev启动可能会卡住，可以使用yarn start(失去热更新)
- 设置内最好不要设置为开机自动启动。
- 启动时请务必联网，没有网络将导致项目无法启动。
- 如果使用自定义皮肤页面可能会很丑,建议使用黑色主题。
- 运行不是很稳定所以默认会启动控制台，如果你不希望有控制台，注释src/main/windows.ts 内的win.webContents.toggleDevTools()
- 更换登录的方式,点击退出登录后直接关闭应用重新打开，再登录
- 应该有很多bug，但是应该不影响使用
- 仅供学习交流个人使用
### 浏览
![Alt Text](https://cdn.jsdelivr.net/gh/southernMD/images@main/img/202305221528523.png)
![Alt Text](https://cdn.jsdelivr.net/gh/southernMD/images@main/img/202305221536997.png)
![Alt Text](https://cdn.jsdelivr.net/gh/southernMD/images@main/img/202305221538403.png)

### 功能
基于NeteaseCloudMusicApi，支持听歌，创建歌单，下载，不支持vip，暂不支持播放声音，私信。

### 自动更新

暂时不支持自动更新
