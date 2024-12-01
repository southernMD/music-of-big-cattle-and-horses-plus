//1本地 2网络 3b站
export enum VideoType {
    local = 1,
    web = 2,
    bilibili = 3,
}

export interface videoFolderList {
    id: number;
    folderName: string;
    updateTime:string;
    list:VideoInfo[]
}

export interface VideoInfo{
    id: number;
    title: string;
    type: VideoType;
    videoPath:string;
    coverPath:string;
    otherName: string;
    time:string;
    description:string;
    updateTime:string;
    folderId:number
}

export interface AddVideoInfo{
    folderId: number | undefined,
    title: string,
    type: VideoType,
    videoPath: string,
    coverPath: string,
    otherName: string[],
    description:string,
    save:boolean
}

export interface VideoDataInfo{
    id: number;
    data: ArrayBuffer;
}

export interface videoFolder{
    label: string;
    value: number;
}