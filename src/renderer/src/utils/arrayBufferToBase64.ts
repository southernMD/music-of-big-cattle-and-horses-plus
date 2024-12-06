export function bufferToBase64(buffer:ArrayBuffer):Promise<string> {
    if(buffer == undefined)return Promise.resolve('')
    const reader = new FileReader();
    reader.readAsDataURL(new Blob([buffer], { type: 'image/jpeg' }));
    return new Promise((resolve, reject) => {
        reader.onloadend = () => {
        const base64String = reader.result;
        resolve(base64String as string);
        };
        reader.onerror = reject;
    });
}