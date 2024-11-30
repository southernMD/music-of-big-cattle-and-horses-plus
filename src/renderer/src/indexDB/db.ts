// src/db.ts
import Dexie from 'dexie';
import type { videos_folders_table, videos_table,video_data_table } from './dbType.d.ts';
export class AppDatabase extends Dexie {
  videos!: Dexie.Table<videos_table, number>;
  videos_folders!: Dexie.Table<videos_folders_table, number>;
  videos_data!: Dexie.Table<video_data_table, number>;

  constructor() {
    super('AppDatabase');
    this.version(1).stores({
      videos: '++id, title, type, videoPath, coverPath, otherName, time ,updateTime, description ,folderId',
      videos_folders: '++id, &folderName,updateTime',
      videos_data: '&id, data',
    });
  }
}

export const db = new AppDatabase();