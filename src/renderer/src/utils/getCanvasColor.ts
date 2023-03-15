export function getPxColor(imageData: ImageData, x: number, y: number) {
    let color:any = [];
    // 有多宽，就是一排有多少个像素点
    let width = imageData.width;
    for (let i = 0; i < imageData.data.length; i++) {
        color[0] = imageData.data[(y * width + x) * 4];
        color[1] = imageData.data[(y * width + x) * 4 + 1];
        color[2] = imageData.data[(y * width + x) * 4 + 2];
    }
    return color;
}