import {onMounted,onBeforeUnmount,defineEmits, Ref} from 'vue'
//deleteDilog任意名称用于绑定事件
//$emit一个包含close的自定义事件,用于在父组件处关闭子组件
//id承载子组件的最外层父组件的id属性值
//是最大化是最小化是user标签是换肤按钮就关闭dom
//不是在id为bkSearchTip点击input标签
export default function (deleteDilog:any,$emit:any,vDom:Ref<HTMLElement | null>): any {
    onMounted(() => {
        deleteDilog = (e: any) => {
            try {
                // let dom = document.querySelector(`#${id}`) as HTMLElement;
                console.log(vDom.value);
                const path = e.composedPath()
                if (!(path.includes(vDom.value))) {
                    let flag = path.every((element: HTMLElement) => {
                        return !(
                         (vDom.value?.id=='bkSearchTip'?element.className?.includes('search-input'):false)||
                         element.className?.includes('icon-24gl-minimize')
                        || element.className?.includes('user')
                        || element.className?.includes('icon-huanfu')
                        || element.className?.includes('icon-3zuidahua-1')
                        )
                    });
                    console.log(flag);
                    if (flag){
                        $emit('close')
                    }
                }
            } catch (error) {
                console.log(error);
            }
        }
        window.addEventListener('click', deleteDilog)
    })

    onBeforeUnmount(() => {
        window.removeEventListener('click', deleteDilog)
    })
}