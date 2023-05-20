import fs from 'fs';
import path from 'path';
import { workerData, parentPort } from 'worker_threads';
import { Worker } from 'worker_threads'

const { downloadPath, destinationPath } = workerData;

// 移动文件的函数
async function moveFiles() {
  try {
    const files = await fs.promises.readdir(downloadPath);
    const promise:Promise<void>[] = []
    for (const file of files) {
      const filePath = path.join(downloadPath, file);
      if (file.endsWith('.mp3')) {
        const destinationFilePath = path.join(destinationPath, file);
        promise.push(fs.promises.rename(filePath, destinationFilePath))
      }
    }
  Promise.allSettled(promise).then(()=>{
    parentPort!.postMessage({ success: true }); // 发送成功消息给父线程
  }) 
  } catch (error) {
    console.error('移动文件失败:', error);
    parentPort!.postMessage({ success: false, error }); // 发送失败消息给父线程
  }
}

moveFiles();
