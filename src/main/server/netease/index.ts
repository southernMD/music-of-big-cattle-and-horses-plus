import express, { type Request, type Response } from 'express';
import NeteaseCloudMusicApi from 'NeteaseCloudMusicApi';
import { pathCase } from "change-case";

// 注册 NeteaseCloudMusicApi 所有接口
const getHandler = (name: string, neteaseApi: (params: any) => any) => {
    return async (
        req: Request,
        res: Response,
    ) => {
        // 获取 NcmAPI 数据
        try {
            const result = await neteaseApi(Object.assign(
                {},
                { cookie: req.body.cookie ?? req.cookies },
                req.query,
                req.body,
                req.files,
              ));
            return res.json(result.body);
        } catch (error: any) {
            if ([400, 301].includes(error.status)) {
                return res.status(error.status).json(error.body);
            }
            return res.sendStatus(500);
        }
    };
};
const initNcmAPI = () => {
    const router = express.Router();
    router.get("/", (_, res) => {
        res.json({
          name: "NeteaseCloudMusicApi",
          version: "4.25.0",
          description: "网易云音乐 Node.js API service",
          author: "@binaryify",
          license: "MIT",
          url: "https://gitlab.com/Binaryify/neteasecloudmusicapi",
        });
      });
    Object.entries(NeteaseCloudMusicApi).forEach(([routerName, neteaseApi]: [string, any]) => {
        if (["serveNcmApi", "getModulesDefinitions"].includes(routerName)) return;
        const pathName = pathCase(routerName);
        const handler = getHandler(pathName, neteaseApi);
        console.info(`[NcmAPI] ${pathName}`);
        router.get(`/${pathName}`, handler);
        router.post(`/${pathName}`, handler);
        if (routerName.includes("_")) {
            router.get(`/${routerName}`, handler);
            router.post(`/${routerName}`, handler);
        }
    });
    return router;
}

export default initNcmAPI;