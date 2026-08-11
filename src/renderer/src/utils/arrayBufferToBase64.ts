export function bufferToBase64(buffer: ArrayBuffer | ArrayBufferView | undefined): Promise<string> {
    if (buffer == undefined) return Promise.resolve('')
    const reader = new FileReader();
    reader.readAsDataURL(new Blob([buffer as any], { type: 'image/jpeg' }));
    return new Promise((resolve, reject) => {
        reader.onloadend = () => {
        const base64String = reader.result;
        resolve(base64String as string);
        };
        reader.onerror = reject;
    });
}