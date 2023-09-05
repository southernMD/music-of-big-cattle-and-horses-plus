// worker.js
let musiceUintPiece = new Uint8Array()
let flag = true
let st:'start' | 'loading' |'end' = 'start'
let t

function sendMusiceUintPiece() {
    postMessage({ musiceUintPiece, st });
}

addEventListener('message', (event) => {
    const url = event.data.url;
    postMessage({musiceUintPiece,st});
    t = setInterval(sendMusiceUintPiece, 1000);
    fetch(url, { mode: 'cors' })
    .then((response) => {
        const reader = response.body?.getReader() as ReadableStreamDefaultReader<Uint8Array>
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
