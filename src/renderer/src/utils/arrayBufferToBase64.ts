export function bufferToBase64(buffer:ArrayBuffer) {
    if(buffer == undefined)return Promise.resolve('')
    const reader = new FileReader();
    reader.readAsDataURL(new Blob([buffer], { type: 'image/jpeg' }));
    return new Promise((resolve, reject) => {
        reader.onloadend = () => {
        const base64String = reader.result;
        resolve(base64String);
        };
        reader.onerror = reject;
    });
}