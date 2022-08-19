import {Shopify} from "@shopify/shopify-api";
import {appUninstallHandler} from "./handlers/app-uninstalled.js";
import {setupGDPRWebHooks} from "./gdpr.js";

export function setupAppWebHooks(path) {
    // GDPR https://help.shopify.com/en/manual/your-account/privacy/GDPR
    setupGDPRWebHooks(path);
    // Uninstall APP
    Shopify.Webhooks.Registry.addHandler("APP_UNINSTALLED", {
        path,
        webhookHandler: appUninstallHandler
    });
    // Other webhooks
}
