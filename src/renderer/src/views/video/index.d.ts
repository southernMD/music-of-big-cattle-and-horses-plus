//1本地 2网络 3b站
export enum VideoType {
    local = 1,
    web = 2,
    bilibili = 3,
}

export interface VideoListInfo {
    id: number;
    folderName: string;
    list:VideoInfo[]
}

export interface VideoInfo{
    id: number;
    title: string;
    type: VideoType;
    videoPath:string;
    coverPath:string;
    otherName: string[];
    time:string;
}