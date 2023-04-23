import {onMounted,onBeforeUnmount,watch,toRef} from 'vue'
import {useMainMenu,useGlobalVar} from '@renderer/store'
export default function (): any {
    const MainMenu = useMainMenu();
    const globalVar = useGlobalVar()
    let mainColor = toRef(MainMenu, 'colorBlock')
    let primaryColor = toRef(MainMenu, 'primaryColor')
    let flag = 0
    watch(mainColor, (newValue) => {
        if(newValue.length == 0){
            newValue = localStorage.getItem('colorBlock') as string
            MainMenu.iconSrc = "/src/assets/icon.png"
        }
        if (newValue === 'NMblack'  || globalVar.oneself && flag++ == 0) {
            if(!globalVar.oneself)document.documentElement.style.setProperty('--broundColor', `rgba(34,34,37,1)`);
            // if(globalVar.oneself)document.documentElement.style.setProperty('--broundColor', `rgba(34,34,37,.8)`);
            document.documentElement.style.setProperty('--radioBkColor', `rgb(34,34,37)`);
            document.documentElement.style.setProperty('--otherBkColor', `rgb(43,43,43)`);
            document.documentElement.style.setProperty('--otherBkColorOp', `rgb(43,43,43,.7)`);
            document.documentElement.style.setProperty('--mianbanBkColor', `rgb(54,54,54)`);
            document.documentElement.style.setProperty('--fontColor', `rgba(255,255,255,.7)`);
            document.documentElement.style.setProperty('--fontColorHover', `rgb(255,255,255)`);
            document.documentElement.style.setProperty('--primaryColor', `rgb(236,65,65)`);
            document.documentElement.style.setProperty('--redLine', `rgb(116, 10, 10)`);
            document.documentElement.style.setProperty('--spanColorHover', `rgb(66, 66, 66)`);
            document.documentElement.style.setProperty('--splitLineColor', `rgb(61, 61, 64)`);
            document.documentElement.style.setProperty('--lineColorOdd', `rgb(47, 47, 47)`);
            document.documentElement.style.setProperty('--lineColorEven', `rgb(43, 43, 43)`);
            document.documentElement.style.setProperty('--lineColorClick', `rgb(65, 65, 65)`);
            document.documentElement.style.setProperty('--smallFontColor', `rgb(105, 105, 105)`);
            document.documentElement.style.setProperty('--smallFontColorHover', `rgb(212,212,212)`);
            document.documentElement.style.setProperty('--leftClickColor', `rgb(51, 51, 51)`);
            document.documentElement.style.setProperty('--urlColor', `rgb(133, 185, 230)`);
            document.documentElement.style.setProperty('--urlColorHover', `rgb(179, 206, 229)`);
            document.documentElement.style.setProperty('--playAllButtonHover', `rgb(217, 63, 63)`);
            document.documentElement.style.setProperty('--lineColorHover', `rgb(55, 55, 55)`);
            document.documentElement.style.setProperty('--noneButton', `rgb(57, 57, 57)`);
            document.documentElement.style.setProperty('--noneFont', `rgb(116, 116, 116)`);
            document.documentElement.style.setProperty('--hotBk', `rgb(58, 58, 58)`);
            document.documentElement.style.setProperty('--hotFill', `rgb(68, 68, 68)`);
            document.documentElement.style.setProperty('--smallCanClick', `rgb(138,138,138)`);
            document.documentElement.style.setProperty('--stopBtnBk', `rgb(43,43,46)`);
            document.documentElement.style.setProperty('--stopColorDisplay', `rgb(110, 110, 112)`);
            document.documentElement.style.setProperty('--playLineBk', `rgb(57, 57, 59)`);
            document.documentElement.style.setProperty('--playLineLoading', `rgb(77, 77, 79)`);
            document.documentElement.style.setProperty('--shengyin', `rgb(37, 37, 37)`);
            document.documentElement.style.setProperty('--lineColorOddSmall', `rgb(54, 54, 54)`);
            document.documentElement.style.setProperty('--lineColorEvenSmall', `rgb(58, 58, 58)`);
            document.documentElement.style.setProperty('--lineColorClickSmall', `rgb(75, 75, 75)`);
            document.documentElement.style.setProperty('--lineColorHoverSmall', `rgb(62, 62, 62)`);
            document.documentElement.style.setProperty('--smallTips', `rgb(35, 35, 35)`);
            document.documentElement.style.setProperty('--leftClickColor', `rgb(51, 51, 51)`);
            document.documentElement.style.setProperty('--audioBorderColor', `rgb(53, 53, 53)`);
            document.documentElement.style.setProperty('--selectColor', `rgb(85, 85, 85)`);
            document.documentElement.style.setProperty('--lrcDetail', `rgb(107, 107, 107)`);
            document.documentElement.style.setProperty('--lrcDetailHover', `rgb(255, 255, 255)`);
            document.documentElement.style.setProperty('--lrcDetailPlaying', `rgb(255, 255, 255)`);
            document.documentElement.style.setProperty('--lrcChoiceLine', `rgb(85,85,85)`);
            document.documentElement.style.setProperty('--lrcOptionBk', `rgb(58,58,58)`);
            document.documentElement.style.setProperty('--commitBkColor', `rgba(51,51,51,1)`);
            document.documentElement.style.setProperty('--iconSmallColor', `rgb(138,138,138)`);
            document.documentElement.style.setProperty('--iconSmallColorHover', `rgb(212,212,212)`);
            document.documentElement.style.setProperty('--paginFontHoverColor', `rgb(40, 43, 50)`);
            document.documentElement.style.setProperty('--paginBkBtnColor', `rgb(57,57,57)`);
            document.documentElement.style.setProperty('--paginDisableFontColor', `rgb(87, 87, 87)`);
            document.documentElement.style.setProperty('--paginFont', `rgb(136,136,136)`);
            document.documentElement.style.setProperty('--floatTagFont', `rgb(216,216,216)`);
            document.documentElement.style.setProperty('--floatTagBk', `rgb(62,62,62)`);
            document.documentElement.style.setProperty('--floatTagHover', `rgb(80,80,80)`);
            document.documentElement.style.setProperty('--pointOutBorder', `rgb(0,0,0,.4)`);
            document.documentElement.style.setProperty('--commitBlockBorderColor', `rgb(39,39,39)`);
            document.documentElement.style.setProperty('--commitBlockColor', `rgb(58,58,58)`);
            document.documentElement.style.setProperty('--commitBlockScrollLine', `rgb(43,43,43)`);
            document.documentElement.style.setProperty('--commitBlockScrollButton', `rgb(64,64,64)`);
            document.documentElement.style.setProperty('--emojiPointActive', `rgb(103,103,103)`);
            document.documentElement.style.setProperty('--emojiPointDisActive', `rgb(48,48,48)`);
            document.documentElement.style.setProperty('--FMAr', `rgb(80,125,175)`);
            document.documentElement.style.setProperty('--FMArHover', `rgb(11,88,176)`);
            document.documentElement.style.setProperty('--borderColor', `rgb(81,81,81)`);
            document.documentElement.style.setProperty('--pickBkColor', `rgb(41, 43, 47)`);
            document.documentElement.style.setProperty('--flowHoverColor', `rgb(53, 54, 56)`);
            
            primaryColor.value = `rgb(236,65,65)`
            MainMenu.iconSrc = "/src/assets/icon.png"
            // document.documentElement.style.setProperty('--fontColorHover',`rgb(255,255,255)`);
        } else {
            document.documentElement.style.setProperty('--radioBkColor', `rgb(255,255,255)`);
            document.documentElement.style.setProperty('--otherBkColor', `rgb(255,255,255)`);
            document.documentElement.style.setProperty('--otherBkColorOp', `rgb(255,255,255,.7)`);
            document.documentElement.style.setProperty('--mianbanBkColor', `rgb(255,255,255)`);
            document.documentElement.style.setProperty('--fontColor', `rgba(0,0,0,.7)`);
            document.documentElement.style.setProperty('--fontColorHover', `rgb(0,0,0)`);
            document.documentElement.style.setProperty('--redLine', `rgba(0,0,0,0)`);
            document.documentElement.style.setProperty('--spanColorHover', `rgb(241, 242, 243)`);
            document.documentElement.style.setProperty('--splitLineColor', `rgb(224,224,224)`);
            document.documentElement.style.setProperty('--lineColorClick', `rgb(229, 229, 229)`);
            document.documentElement.style.setProperty('--lineColorOdd', `rgb(250, 250, 250)`);
            document.documentElement.style.setProperty('--lineColorEven', `rgb(255, 255, 255)`);
            document.documentElement.style.setProperty('--smallFontColor', `rgb(150, 150, 150)`);
            document.documentElement.style.setProperty('--smallFontColorHover', `rgb(48, 48, 48)`);
            document.documentElement.style.setProperty('--leftClickColor', `rgb(246, 246, 247)`);
            document.documentElement.style.setProperty('--urlColor', `rgb(80, 125, 175)`);
            document.documentElement.style.setProperty('--urlColorHover', `rgb(11, 88, 176)`);
            document.documentElement.style.setProperty('--playAllButtonHover', `rgb(204, 50, 50)`);
            document.documentElement.style.setProperty('--lineColorHover', `rgb(241, 242, 243)`);
            document.documentElement.style.setProperty('--noneButton', `rgb(255, 255, 255)`);
            document.documentElement.style.setProperty('--noneFont', `rgb(178, 178, 178)`);
            document.documentElement.style.setProperty('--hotBk', `rgb(229, 229, 229)`);
            document.documentElement.style.setProperty('--hotFill', `rgb(185, 185, 185)`);
            document.documentElement.style.setProperty('--smallCanClick', `rgb(105,105,105)`);
            document.documentElement.style.setProperty('--stopBtnBk', `rgb(245,245,245)`);
            document.documentElement.style.setProperty('--stopColorDisplay', `rgb(166, 166, 166)`);
            document.documentElement.style.setProperty('--playLineBk', `rgb(228, 228, 228)`);
            document.documentElement.style.setProperty('--playLineLoading', `rgb(206, 206, 206)`);
            document.documentElement.style.setProperty('--shengyin', `rgb(255, 255, 255)`);
            document.documentElement.style.setProperty('--lineColorOddSmall', `rgb(250, 250, 250)`);
            document.documentElement.style.setProperty('--lineColorEvenSmall', `rgb(255, 255, 255)`);
            document.documentElement.style.setProperty('--lineColorClickSmall', `rgb(229, 229, 229)`);
            document.documentElement.style.setProperty('--lineColorHoverSmall', `rgb(241, 242, 243)`);
            document.documentElement.style.setProperty('--smallTips', `rgb(61, 61, 61)`);
            document.documentElement.style.setProperty('--leftClickColor', `rgb(246, 246, 246)`);
            document.documentElement.style.setProperty('--audioBorderColor', `rgb(219, 212, 212)`);
            document.documentElement.style.setProperty('--selectColor', `rgb(185, 197, 201)`);
            document.documentElement.style.setProperty('--lrcDetail', `rgb(95, 95, 95)`);
            document.documentElement.style.setProperty('--lrcDetailHover', `rgb(73, 73, 73)`);
            document.documentElement.style.setProperty('--lrcDetailPlaying', `rgb(0, 0, 0)`);
            document.documentElement.style.setProperty('--lrcChoiceLine', `rgb(204,203,203)`);
            document.documentElement.style.setProperty('--lrcOptionBk', `rgb(224,224,224)`);
            document.documentElement.style.setProperty('--commitBkColor', `rgba(245,245,245,1)`);
            document.documentElement.style.setProperty('--iconSmallColor', `rgb(102,102,102)`);
            document.documentElement.style.setProperty('--iconSmallColorHover', `rgb(51,51,51)`);
            document.documentElement.style.setProperty('--paginFontHoverColor', `rgb(245, 245, 245)`);
            document.documentElement.style.setProperty('--paginBkBtnColor', `rgb(255,255,255)`);
            document.documentElement.style.setProperty('--paginDisableFontColor', `rgb(204, 204, 204)`);
            document.documentElement.style.setProperty('--paginFont', `rgb(102,102,102)`);
    
            document.documentElement.style.setProperty('--floatTagFont', `rgb(48,48,48)`);
            document.documentElement.style.setProperty('--floatTagBk', `rgb(241,241,241)`);
            document.documentElement.style.setProperty('--floatTagHover', `rgb(225,225,225)`);
            document.documentElement.style.setProperty('--pointOutBorder', `rgb(0,0,0,.2)`);
            document.documentElement.style.setProperty('--commitBlockBorderColor', `rgb(229,229,229)`);
            document.documentElement.style.setProperty('--commitBlockColor', `rgb(255,255,255)`);
            document.documentElement.style.setProperty('--commitBlockScrollLine', `rgb(255,255,255)`);
            document.documentElement.style.setProperty('--commitBlockScrollButton', `rgb(224,224,224)`);
    
            document.documentElement.style.setProperty('--emojiPointActive', `rgb(153,153,153)`);
            document.documentElement.style.setProperty('--emojiPointDisActive', `rgb(242,242,242)`);
            document.documentElement.style.setProperty('--FMAr', `rgb(46,91,142)`);
            document.documentElement.style.setProperty('--FMArHover', `rgb(46,89,138)`);
            document.documentElement.style.setProperty('--borderColor', `rgb(216,216,216)`);
            document.documentElement.style.setProperty('--pickBkColor', `rgb(0, 0, 0)`);
            document.documentElement.style.setProperty('--flowHoverColor', `rgb(239, 239, 240)`);

        }
        if (newValue === 'NMred') {
            MainMenu.iconSrc = "/src/assets/icon.png"
        }
    })

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
    
        MainMenu.primaryColor = `rgb(${localStorage.getItem('primaryColor')})`
        MainMenu.colorBlock = `${localStorage.getItem('colorBlock')}`
    })
}
