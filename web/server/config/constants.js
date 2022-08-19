export const USE_ONLINE_TOKENS = true;
export const TOP_LEVEL_OAUTH_COOKIE = "shopify_top_level_oauth";
export const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT, 10);
export const isTest = process.env.NODE_ENV === "test" || !!process.env.VITE_TEST_BUILD;
export const DEV_INDEX_PATH = `${process.cwd()}/frontend/`;
export const PROD_INDEX_PATH = `${process.cwd()}/frontend/dist/`;
export const DB_PATH = `${process.cwd()}/database.sqlite`;
import {BillingInterval} from "../helpers/ensure-billing.js";

export const BILLING_SETTINGS = {
    required: true,
    chargeName: "App subscription",
    amount: 5.99,
    currencyCode: "USD",
    interval: BillingInterval.Every30Days,
    trialDays: 14
};
