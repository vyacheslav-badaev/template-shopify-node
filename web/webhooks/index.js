import {Shopify} from "@shopify/shopify-api";
import {appUninstallHandler} from "./app-uninstalled";

export function setupAppWebHooks(path) {

    Shopify.Webhooks.Registry.addHandler("APP_UNINSTALLED", {
        path: "/api/webhooks",
        webhookHandler: appUninstallHandler
    });
    
    /*
    *  Your apps webhooks below
    * */
}
