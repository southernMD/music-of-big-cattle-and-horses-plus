import { useMainMenu, useGlobalVar } from '@renderer/store'
import icon from '@renderer/assets/icon.png'
import { mainBackgroundRef, mainBackgroundVideoRef, songDetailRef } from './refs';

export const changeNMblack = (e?: MouseEvent) => {
    const MainMenu = useMainMenu();
    const globalVar = useGlobalVar();

    MainMenu.colorBlock = 'NMblack'
    MainMenu.iconSrc = icon

    // 使用CSS类切换主题，完全替代document.documentElement.style.setProperty
    const html = document.documentElement
    html.classList.remove('theme-white', 'theme-custom')
    html.classList.add('theme-dark')

    if (globalVar.oneself) {
        html.classList.add('oneself')
    } else {
        html.classList.remove('oneself')
    }

    localStorage.setItem('primaryColor', '236,65,65')
    localStorage.setItem('broundColor', '33,33,36,1')
    localStorage.setItem('colorBlock', 'NMblack');
    localStorage.setItem('MainTitle', `255, 255, 255`)
    localStorage.setItem('MainMenu', `255, 255, 255,.7`)
    localStorage.setItem('MainMenuHover', `255, 255, 255`)
}

export const changeNMred = () => {
    const MainMenu = useMainMenu();

    MainMenu.colorBlock = 'NMred'
    MainMenu.iconSrc = icon

    // 使用CSS类切换主题，NMred是默认主题，移除所有主题类
    const html = document.documentElement
    html.classList.remove('theme-dark', 'theme-white', 'theme-custom', 'oneself')

    localStorage.setItem('primaryColor', '236,65,65')
    localStorage.setItem('broundColor', '236,65,65,1')
    localStorage.setItem('colorBlock', 'NMred');
    localStorage.setItem('MainTitle', `255, 255, 255`)
    localStorage.setItem('MainMenu', `255, 255, 255,.7`)
    localStorage.setItem('MainMenuHover', `255, 255, 255`)
}

export const recover = () => {
    const globalVar = useGlobalVar();
    if (mainBackgroundVideoRef.value) mainBackgroundVideoRef.value.src = ''
    if (mainBackgroundRef.value) mainBackgroundRef.value.src = ''
    window.electron.ipcRenderer.send('recove-background')
    changeNMred()
    localStorage.setItem('oneself', '0')
    globalVar.oneself = 0
    if (songDetailRef.value) songDetailRef.value.style.backgroundImage = ''
}