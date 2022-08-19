import fs from "fs";

export const getCurrentVersionApp = (path) => {
    let templateVersion = "unknown";
    if (fs.existsSync(path)) {
        templateVersion = fs.readFileSync(path, "utf8").trim();
    }
    return templateVersion
}