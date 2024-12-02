
export interface videoFolderList {
    id: number;
    folderName: string;
    updateTime: string;
    list: VideoInfo[]
}

export interface VideoInfo {
    id: number;
    title: string;
    type: VideoType;
    videoPath: string;
    coverPath: string;
    otherName: string;
    time: string;
    description: string;
    updateTime: string;
    folderId: number
}

export interface AddVideoInfo {
    folderId: number | undefined,
    title: string,
    type: VideoType,
    videoPath: string,
    coverPath: string,
    otherName: string[],
    description: string,
    save: boolean
}

export interface EditVideoInfo {
    id: number;
    title: string;
    type: VideoType;
    videoPath: string;
    coverPath: string;
    otherName: string[];
    updateTime: string;
    description: string;
    folderId: number
    save: boolean;
    updatePic: boolean;
}

export interface VideoDataInfo {
    id: number;
    data: ArrayBuffer;
}

export interface videoFolder {
    label: string;
    value: number;
}

export interface videoSearchInfo extends videoFolderList {
    folderSearchName: string;
    folderSearchNameFl: string;
    romoji: string | undefined;
    list:(VideoInfo & {
        titleSearchName: string;
        titleSearchNameFl: string;
        otherNameSearchName: string[];
        otherNameSearchNameFl: string[];
        romojiTitle: string | undefined;
        romojiOtherName: (string | undefined)[];
    })[];
}