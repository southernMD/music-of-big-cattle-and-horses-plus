// worker.js
import { parentPort, workerData } from 'worker_threads';
import crypto from 'crypto';
import fs from 'fs';
/**
 * 计算单个文件的哈希值
 * @param filePath 文件路径
 * @param algorithm 哈希算法，默认为 'sha256'
 * @returns 文件的哈希值
 */
function calculateFileHash(filePath: string, algorithm: string = 'sha256'): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash(algorithm);
    const stream = fs.createReadStream(filePath);

    stream.on('data', (chunk) => {
      hash.update(chunk);
    });

    stream.on('end', () => {
      resolve(hash.digest('hex'));
    });

    stream.on('error', (err) => {
      reject(err);
    });
  });
}

const { filePaths, algorithm } = workerData;
const hashPromises = filePaths.map((filePath:string) =>
  calculateFileHash(filePath, algorithm).catch((err) => {
    console.error(`计算文件 ${filePath} 的哈希值时出错:`, err);
    return null;
  })
);

Promise.all(hashPromises).then((hashes) => {
   
  if (parentPort) {
    parentPort.postMessage(hashes);
  }
});

