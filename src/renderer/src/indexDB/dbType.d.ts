

export interface videos_table{
    id?:number;
    title:string;
    type:VideoType;
    videoPath:string;
    coverPath:string;
    otherName:string;
    time:string;
    folderId:number;
    description:string;
    updateTime:string;
}
export interface videos_folders_table{
    id?:number;
    folderName:string;
    updateTime:string;
}
export interface video_data_table{
    id:number;
    data:ArrayBuffer;
}
export enum VideoType {
    local = 1,
    web = 2,
    bilibili = 3,
}