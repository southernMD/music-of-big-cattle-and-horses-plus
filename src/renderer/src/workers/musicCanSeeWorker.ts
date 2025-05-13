// worker.js
let musiceUintPiece = new Uint8Array()
let flag = true
let st:'start' | 'loading' |'end' = 'start'
let t

function sendMusiceUintPiece() {
    postMessage({ musiceUintPiece, st });
}

addEventListener('message', (event) => {
    if(import.meta.env.MODE === 'development')return
    const url = event.data.url;
    const range:undefined | number = event.data.range
    const time:undefined | number = event.data.time ?? 1000
    t = setInterval(sendMusiceUintPiece, time);
    fetch(url, { mode: 'cors',
        headers:{
            Range:range ? `bytes=${range}-` :  'bytes=0-'
        }
    })
    .then((response) => {
        const reader = response.body?.getReader() as ReadableStreamDefaultReader<Uint8Array>
        postMessage({musiceUintPiece,st,len:Number(response.headers.get('Content-Length'))});
        st = "loading"
        return new ReadableStream({
            start(controller) {
                function push() {
                    reader.read().then(({ done, value }) => {
                        if (done) {
                            controller.close()
                            st = 'end'
                            postMessage({musiceUintPiece,st});
                            clearInterval(t)
                            return
                        }
                        controller.enqueue(value)
                        musiceUintPiece = Uint8Array.from([...musiceUintPiece, ...value])
                        push()
                    })
                }
                push()
            }
        })
    })
})
