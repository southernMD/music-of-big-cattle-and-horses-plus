import { Worker } from 'worker_threads';
import * as os from 'os';
import HashWorker from '../workers/hashWorker?nodeWorker';

/**
 * 主线程：分配任务给 Worker 线程并收集结果
 * @param filePaths 文件路径数组
 * @param algorithm 哈希算法，默认为 'sha256'
 * @returns 文件哈希值数组
 */
export const getFileHashes = async (filePaths: string[], algorithm: string = 'sha256'): Promise<string[]> => {
    console.log(filePaths);

    const cpuCount = os.cpus().length; // 获取 CPU 核心数
    const workers: Worker[] = [];
    const chunkSize = Math.ceil(filePaths.length / cpuCount); // 每个 Worker 处理的任务数

    // 创建 Worker 线程
    for (let i = 0; i < cpuCount; i++) {
        const start = i * chunkSize;
        const end = start + chunkSize;
        const chunk = filePaths.slice(start, end);

        if (chunk.length > 0) {
            const worker = HashWorker({
                workerData: { filePaths: chunk, algorithm },
            })
            workers.push(worker);
        }
    }

    // 收集 Worker 线程的结果
    const results = await Promise.all(
        workers.map(
            (worker) =>
                new Promise<string[]>((resolve) => {
                    worker.on('message', (hashes: string[]) => {
                        resolve(hashes);
                    });
                })
        )
    );
    workers.forEach((worker) => worker.terminate());
    // 合并结果并过滤掉 null 值
    const hashes = results.flat().filter((hash) => hash !== null) as string[];
    return hashes;
}