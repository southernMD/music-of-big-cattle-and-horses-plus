
addEventListener('message', (event) => {
    const { videoPath, coverPath, type } = event.data;
    // console.log(type === VideoType.web);
    if (type === 1 || type === 2) {
        postMessage({ type:'ffmpeg',value:{videoPath,coverPath} })
    } else if (type === 3) {

    }

})

// fetch(videoPath)
// .then((response) => {
//     let loaded = 0
//     let totalBase = +(response.headers.get('content-length') ?? 0)
//     const reader = response.body?.getReader() as ReadableStreamDefaultReader<Uint8Array>
//     return new ReadableStream({
//         start(controller) {
//             function push() {
//                 reader.read().then(({ done, value }) => {
//                     if (done) {
//                         controller.close()
//                         return
//                     }

//                     loaded += value.byteLength
//                     postMessage({type: 'progress', value:loaded/totalBase})
//                     controller.enqueue(value)
//                     push()
//                 })
//             }
//             push()
//         }
//     })
// })
// .then(stream => new Response(stream))
// .then(response => response.arrayBuffer())
// .then((arrayBuffer) => {
//     postMessage({ type:"arrayBuffer",value:arrayBuffer })
// })