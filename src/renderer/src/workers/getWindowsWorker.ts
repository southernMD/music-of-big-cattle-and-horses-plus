let dragMessageId: number | undefined = 0;
let ciId: number | undefined = 0;
let mainId: number | undefined = 0;
let intervalMainId
let intervalCiId
let intervalDragMessageId
let loadingStep = 0
function sendWindowId(windowName: string, id: number) {
    postMessage({ windowName, id });
}

addEventListener('message', (event) => {
    console.log("收到请求");
    console.log("类型为",event.data);
    
    
    if (event.data.type === 'requestId') {
        const { windowName } = event.data;
        switch (windowName) {
            case 'drageMessage':
                intervalDragMessageId = setInterval(() => {
                    if (dragMessageId !== undefined) {
                        sendWindowId("drageMessage", dragMessageId);
                    }
                }, 5000);
                break;
            case 'Ci':
                intervalCiId = setInterval(() => {
                    if (ciId !== undefined) {
                        sendWindowId("Ci", ciId);
                    }
                }, 5000);
                break;
            case 'Main':
                intervalMainId = setInterval(() => {
                    if (mainId !== undefined) {
                        sendWindowId("Main", mainId);
                    }
                }, 5000);
                break;
        }
    }else if(event.data.type === 'finished'){
        const { windowName } = event.data;
        switch (windowName) {
            case 'drageMessage':
                clearInterval(intervalDragMessageId)
                console.log("clearInterval","drageMessage");
                loadingStep++;
                break;
            case 'Ci':
                clearInterval(intervalCiId)
                console.log("clearInterval","Ci");
                loadingStep++;
                break;
            case 'Main':
                clearInterval(intervalMainId)
                console.log("clearInterval","Main");
                loadingStep++;
                break;
        }
    }
    if(loadingStep >= 3){
        console.log("全部加载完毕关闭getWindowsWorker");
        close();
    }
});