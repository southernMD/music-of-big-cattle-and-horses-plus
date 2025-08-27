import {onMounted,onBeforeUnmount,watch,toRef} from 'vue'
import {useMainMenu,useGlobalVar} from '@renderer/store'

// 基于CSS类的主题切换函数 - 完全替代document.documentElement.style.setProperty
function applyTheme(theme: 'NMblack' | 'NMred' | 'white' | string, oneself: boolean = false) {
    const html = document.documentElement

    // 移除所有主题类
    html.classList.remove('theme-dark', 'theme-white', 'theme-custom', 'oneself')

    // 根据主题添加对应的CSS类
    if (theme === 'NMblack') {
        html.classList.add('theme-dark')
    } else if (theme === 'white' || theme === '1') {
        html.classList.add('theme-white')
    } else if (theme !== 'NMred' && theme !== '' && theme !== null) {
        // 自定义主题（ColorPick或ColorBlock的自定义颜色）
        html.classList.add('theme-custom')
    }
    // NMred 使用默认主题，不需要添加类

    // 处理oneself状态
    if (oneself) {
        html.classList.add('oneself')
    }
}

export default function (): any {
    const MainMenu = useMainMenu();
    const globalVar = useGlobalVar()
    let mainColor = toRef(MainMenu, 'colorBlock')
    let primaryColor = toRef(MainMenu, 'primaryColor')
    let flag = 0
    watch(mainColor, (newValue) => {
        if(mainColor.value == null) return
        if(newValue.length == 0){
            newValue = localStorage.getItem('colorBlock') as string
            MainMenu.iconSrc = "/src/assets/icon.png"
        }

        // 使用CSS类切换主题，完全替代document.documentElement.style.setProperty
        if (newValue === 'NMblack') {
            applyTheme('NMblack', globalVar.oneself === 1)
            primaryColor.value = `rgb(236,65,65)`
            MainMenu.iconSrc = "/src/assets/icon.png"
            window.electron.ipcRenderer.send('set-background-color',['rgb(43,43,43)','rgba(255,255,255,.7)'])
        } else {
            // 其他主题（NMred、white、自定义等）
            applyTheme(newValue, globalVar.oneself === 1)
            window.electron.ipcRenderer.send('set-background-color',['rgb(255,255,255)','rgba(0,0,0,.7)'])
        }
        if (newValue === 'NMred') {
            MainMenu.iconSrc = "/src/assets/icon.png"
        }
        if(globalVar.setting.canvasColor){
            globalVar.setting.canvasColorRGB = getComputedStyle(document.documentElement).getPropertyValue('--primaryColor')
        }
    })
    document.documentElement.style.setProperty('--fontFamily', globalVar.setting.fontFamily);

    onMounted(() => {
        if (!localStorage.getItem('primaryColor')) {
            localStorage.setItem('primaryColor', '236,65,65')    //默认颜色
            localStorage.setItem('broundColor', '236,65,65,1')
            localStorage.setItem('MainMenu', '255,255,255,.7')
            localStorage.setItem('MainTitle', '255,255,255')
            localStorage.setItem('MainMenuHover', '255,255,255')
        }
        if(!localStorage.getItem('baseLine') ){
            localStorage.setItem('baseLine', '50')
        }

        // 初始化时应用保存的主题，不再手动设置CSS变量
        const savedTheme = localStorage.getItem('colorBlock') || 'NMred'
        applyTheme(savedTheme, globalVar.oneself === 1)

        // 如果是自定义颜色，需要设置自定义的CSS变量
        if (savedTheme !== 'NMblack' && savedTheme !== 'NMred' && savedTheme !== 'white' && savedTheme !== '1') {
            // 自定义颜色需要动态设置
            let str = localStorage.getItem('primaryColor') as string
            let arr: string[] = str.split(',');
            document.documentElement.style.setProperty('--primaryColor', `rgb(${arr[0]},${arr[1]},${arr[2]})`);

            str = localStorage.getItem('broundColor') as string
            arr = str.split(',');
            document.documentElement.style.setProperty('--broundColor', `rgba(${arr[0]},${arr[1]},${arr[2]},${arr[3]})`);

            str = localStorage.getItem('MainMenu') as string
            arr = str.split(',');
            document.documentElement.style.setProperty('--MainMenu', `rgba(${arr[0]},${arr[1]},${arr[2]},${arr[3]})`);

            str = localStorage.getItem('MainTitle') as string
            arr = str.split(',');
            document.documentElement.style.setProperty('--MainTitle', `rgb(${arr[0]},${arr[1]},${arr[2]})`);

            str = localStorage.getItem('MainMenuHover') as string
            arr = str.split(',');
            document.documentElement.style.setProperty('--MainMenuHover', `rgb(${arr[0]},${arr[1]},${arr[2]})`);
        }

        MainMenu.primaryColor = `rgb(${localStorage.getItem('primaryColor')})`
        MainMenu.colorBlock = `${localStorage.getItem('colorBlock')}`
    })
}
