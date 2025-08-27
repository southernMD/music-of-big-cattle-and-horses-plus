import {onMounted,onBeforeUnmount,watch,toRef} from 'vue'
import {useMainMenu,useGlobalVar} from '@renderer/store'

// 基于CSS类的主题切换函数，并设置特定CSS变量
export function applyTheme(theme: 'NMblack' | 'NMred' | 'white' | string, oneself: boolean = false, colors?: {
    primaryColor?: string,
    broundColor?: string,
    MainTitle?: string,
    MainMenu?: string,
    MainMenuHover?: string
}) {
    const html = document.documentElement

    // 移除所有主题类
    html.classList.remove('theme-dark', 'theme-white', 'theme-custom', 'oneself')
    console.log(theme);
    
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

    // 设置特定的CSS变量
    if (colors) {
        if (colors.primaryColor) {
            document.documentElement.style.setProperty('--primaryColor', colors.primaryColor)
        }
        if (colors.broundColor) {
            document.documentElement.style.setProperty('--broundColor', colors.broundColor)
        }
        if (colors.MainTitle) {
            document.documentElement.style.setProperty('--MainTitle', colors.MainTitle)
        }
        if (colors.MainMenu) {
            document.documentElement.style.setProperty('--MainMenu', colors.MainMenu)
        }
        if (colors.MainMenuHover) {
            document.documentElement.style.setProperty('--MainMenuHover', colors.MainMenuHover)
        }
    }
}

// 直接设置CSS变量值
export function applyCustomColorTheme(colors: {
    primaryColor?: string,
    broundColor?: string,
    MainTitle?: string,
    MainMenu?: string,
    MainMenuHover?: string,
    bottomLinearColor?: string,
    btnT?: string,
    btnB?: string
}, oneself: boolean = false) {
    const html = document.documentElement

    // // 切换到自定义主题类
    // html.classList.remove('theme-dark', 'theme-white')
    // html.classList.add('theme-custom')

    // // 处理oneself状态
    if (oneself) {
        html.classList.add('oneself')
    } else {
        html.classList.remove('oneself')
    }

    // 直接设置对应的CSS变量值
    Object.entries(colors).forEach(([key, value]) => {
        if (value !== undefined) {
            document.documentElement.style.setProperty(`--${key}`, value)
        }
    })
}

export default function (): any {
    const MainMenu = useMainMenu();
    const globalVar = useGlobalVar()
    let mainColor = toRef(MainMenu, 'colorBlock')
    let primaryColor = toRef(MainMenu, 'primaryColor')
    
    watch(mainColor, (newValue) => {
        if(mainColor.value == null) return
        if(newValue.length == 0){
            newValue = localStorage.getItem('colorBlock') as string
            MainMenu.iconSrc = "/src/assets/icon.png"
        }

        // 使用CSS类切换主题，完全替代document.documentElement.style.setProperty
        if (newValue === 'NMblack') {
            applyTheme('NMblack', globalVar.oneself === 1, {
                primaryColor: 'rgb(236,65,65)',
                broundColor: globalVar.oneself === 1 ? 'rgba(34,34,37,.8)' : 'rgba(34,34,37,1)',
                MainTitle: 'rgb(255, 255, 255)',
                MainMenu: 'rgba(255, 255, 255,.7)',
                MainMenuHover: 'rgb(255, 255, 255)'
            })
            primaryColor.value = `rgb(236,65,65)`
            MainMenu.iconSrc = "/src/assets/icon.png"
            window.electron.ipcRenderer.send('set-background-color',['rgb(43,43,43)','rgba(255,255,255,.7)'])
        } else {
            // 其他主题（NMred、white、自定义等）
            if (newValue === 'white' || newValue === '1') {
                applyTheme(newValue, globalVar.oneself === 1, {
                    primaryColor: 'rgb(236,65,65)',
                    broundColor: globalVar.oneself === 1 ? 'rgba(245,245,245,.8)' : 'rgba(245,245,245,1)',
                    MainTitle: 'rgb(49,49,49)',
                    MainMenu: 'rgba(0,0,0,.7)',
                    MainMenuHover: 'rgb(0,0,0)'
                })
            } else if(newValue === 'NMred'){
                applyTheme(newValue, globalVar.oneself === 1, {
                    primaryColor: 'rgb(236,65,65)',
                    broundColor: globalVar.oneself === 1 ? 'rgba(236, 65, 65, .8)' : 'rgba(236, 65, 65, 1)',
                    MainTitle: 'rgb(255, 255, 255)',
                    MainMenu: 'rgba(255, 255, 255, .7)',
                    MainMenuHover: 'rgb(255, 255, 255)'
                })

            }else {
                applyTheme(newValue, globalVar.oneself === 1)
            }
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
    // debugger
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

        // 初始化时应用保存的主题，传入保存的颜色参数
        const savedTheme = localStorage.getItem('colorBlock') || 'NMred'

        // 获取保存的颜色值
        const savedPrimaryColor = localStorage.getItem('primaryColor') || '236,65,65'
        const savedBroundColor = localStorage.getItem('broundColor') || '236,65,65,1'
        const savedMainTitle = localStorage.getItem('MainTitle') || '255,255,255'
        const savedMainMenu = localStorage.getItem('MainMenu') || '255,255,255,.7'
        const savedMainMenuHover = localStorage.getItem('MainMenuHover') || '255,255,255'

        applyTheme(savedTheme, globalVar.oneself === 1, {
            primaryColor: `rgb(${savedPrimaryColor})`,
            broundColor: `rgba(${savedBroundColor})`,
            MainTitle: `rgb(${savedMainTitle})`,
            MainMenu: `rgba(${savedMainMenu})`,
            MainMenuHover: `rgb(${savedMainMenuHover})`
        })

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
