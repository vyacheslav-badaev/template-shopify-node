import {PROD_INDEX_PATH} from "../config/constants.js";

export const applyServeStaticFiles = async (app) => {
    const compression = await import("compression").then(
        ({default: fn}) => fn
    );
    const serveStatic = await import("serve-static").then(
        ({default: fn}) => fn
    );
    app.use(compression());
    app.use(serveStatic(PROD_INDEX_PATH, {index: false}));
}