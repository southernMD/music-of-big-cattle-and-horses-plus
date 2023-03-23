import {onMounted,onBeforeUnmount,defineEmits} from 'vue'
//deleteDilog任意名称用于绑定事件
//$emit一个包含close的自定义事件,用于在父组件处关闭子组件
//id承载子组件的最外层父组件的id属性值
//是最大化是最小化是user标签是换肤按钮就关闭dom
//不是在id为bkSearchTip点击input标签
export default function (deleteDilog:any,$emit:any,id:string): any {
    onMounted(() => {
        deleteDilog = (e: any) => {
            try {
                let dom = document.querySelector(`#${id}`) as HTMLElement;
                if (!(e.path.includes(dom))) {
                    let flag = e.path.every((element: any) => {
                        return !( (id=='bkSearchTip'?element.className?.includes('search-input'):false)
                        || element.className?.includes('icon-24gl-minimize')
                        || element.className?.includes('user')
                        || element.className?.includes('icon-huanfu')
                        || element.className?.includes('icon-3zuidahua-1')
                        )
                    });
                    console.log(id,flag);
                    if (flag) $emit('close')
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