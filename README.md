<p align="center">
  <a href="https://github.com/southernMD/music-of-big-cattle-and-horses-plus" target="_blank" rel="noopener noreferrer">
    <img width="180" src="https://cdn.jsdelivr.net/gh/southernMD/images@main/img/202305221454973.png" alt="Vite logo">
  </a>
</p>
<br/>
<p align="center">
  <a href=""><img src="https://img.shields.io/github/package-json/v/southernMD/music-of-big-cattle-and-horses-plus" alt="version "></a>
  <a href=""><img src="https://img.shields.io/badge/vue-v3.5-brightgreen" alt="use vue3.5"></a>
  <a href=""><img src="https://img.shields.io/github/license/southernMD/music-of-big-cattle-and-horses-plus" alt="GPL-3.0"></a>
<a href=""><img src="https://img.shields.io/badge/electron-v33.2.1-brightgreen" alt="electron v33.2.1"></a>
</p>

# 大牛马音乐 bigNMuice

基于electron与vue3.5 环境的音乐播放器，只支持windows

## 基于

[electron-vite](https://github.com/alex8088/electron-vite)
[NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi)
## 下载

[v0.0.2-beta](https://github.com/southernMD/music-of-big-cattle-and-horses-plus/releases/download/v0.0.2-beta/bingNMmusic-0.0.2-beta-setup.exe)<br>
[v0.0.3-beta](https://github.com/southernMD/music-of-big-cattle-and-horses-plus/releases/download/v0.0.3-beta/bingNMmusic-0.0.3-beta-setup.exe)修复bug，更新打开方式限.mp3格式<br>
[v0.0.4-beta](https://github.com/southernMD/music-of-big-cattle-and-horses-plus/releases/download/v0.0.4-beta/bingNMmusic-0.0.4-beta-setup.exe)修复bug，应用内更新<br>
[v0.0.5-beta](https://github.com/southernMD/music-of-big-cattle-and-horses-plus/releases/download/v0.0.5-beta/bingNMmusic-0.0.5-beta-setup.exe)修复bug<br>
[v0.0.6-beta](https://github.com/southernMD/music-of-big-cattle-and-horses-plus/releases/download/v0.0.6-beta/bingNMmusic-0.0.6-beta-setup.exe)无牛马api的最后一个版本，存在部分bug<br>
[v0.0.7-beta](https://github.com/southernMD/music-of-big-cattle-and-horses-plus/releases/download/v0.0.7-beta/bingNMmusic-0.0.7-beta-setup.exe)牛马api的第一个版本，修复部分bug<br>
[v0.0.8-beta](https://github.com/southernMD/music-of-big-cattle-and-horses-plus/releases/download/v0.0.8-beta/bingNMmusic-0.0.8-beta-setup.exe)优化启动<br>
[v0.0.9-beta](https://github.com/southernMD/music-of-big-cattle-and-horses-plus/releases/download/v0.0.9-beta/bingNMmusic-0.0.9-beta-setup.exe)支持播客<br>

后续版本不再列出，自行重release内查看。

[目前最新的版本 v1.1.0](https://github.com/southernMD/music-of-big-cattle-and-horses-plus/releases/download/v1.1.0/bingNMmusic-1.1.0-setup.exe)<br>
## 克隆项目

```shell
git clone https://github.com/southernMD/music-of-big-cattle-and-horses-plus.git
cd music-of-big-cattle-and-horses-plus
yarn
```

## 运行

```shell
yarn dev //开发环境
yarn start //生产环境 , 由于ffmpeg路径问题，无法使用
```
如果命令行有报错是正常现象，不影响使用

### .env
开发环境下,接口服务(默认2233)与页面服务端口(默认5522)在.env文件下修改。
打包环境下,接口服务(默认2233)在src/main/server/port下修改。无页面服务端口(file协议)
### 构建

```bash
yarn build:win
```

### 注意
注意一下几点
- 下载浏览器报毒属于正常现象，本应用保证未窃取个人信息
- 设置内最好不要设置为开机自动启动。
- 如果使用自定义皮肤页面可能会很丑,建议使用黑色主题。
- 运行不是很稳定所以默认会启动控制台，如果你不希望有控制台，注释src/main/windows.ts 内的win.webContents.toggleDevTools(),应用内可点击f12弹出开发者工具，可能弹不出来
- 应该有很多bug，但是应该不影响使用
- 本地播放可以播放已经下载的电台声音，但是本地资源无法被app解析成电台声音,只会解析成一般歌曲，也有可能回被跳过播放
- 重启应用可以解决95%的问题
- 仅供学习交流个人使用

### 已知问题
- <del>播放暂停后一段时间音乐会无法播放，再次点击播放会卡死，需要清空播放列表(音乐链接403导致)。</del>
- 长时间拖拽歌单内歌曲会时内存显著增加直到电脑死机。
- 下载模块目前占用主线程，大量下载会导致卡死。
- 获取搜索时会触发两次搜索建议的提示。
- 获取大量歌单歌曲会等待时间过长，后续做分页少量请求，缺点，搜索歌单内歌曲可能会搜不到，考虑超过500条使用。
- 当桌面歌词被锁定时，拖动主窗口到歌词窗口内时，主窗口会鬼畜。
- <del>音频可视化模块报错导致的进度条的无法拖动。</del>
- 在v1.1.1版本后,dev模式下音频可视化因为音乐链接跨域问题无法显示，build模式下无跨域问题。
- <del>dev下，下载后，在歌单内无法播放已下载歌曲</del>
- <del>在播放本地歌曲时，会向歌单列表重复添加内容</del>
  
### 浏览
![Alt Text](https://cdn.jsdelivr.net/gh/southernMD/images@main/img/202305221528523.png)
![Alt Text](https://cdn.jsdelivr.net/gh/southernMD/images@main/img/202305221536997.png)
![Alt Text](https://cdn.jsdelivr.net/gh/southernMD/images@main/img/202305221538403.png)

### 功能
基于NeteaseCloudMusicApi，支持听歌，创建歌单，下载，不支持vip，暂不支持私信。

### 自动更新

暂时不支持自动更新
