import {Shopify} from "@shopify/shopify-api";
import {appUninstallHandler} from "./handlers/app-uninstalled.js";

export function setupAppWebHooks(path) {

    Shopify.Webhooks.Registry.addHandler("APP_UNINSTALLED", {
        path,
        webhookHandler: appUninstallHandler
    });

    /*
    *  Your apps webhooks below
    * */
}
