export const USE_ONLINE_TOKENS = true;
export const TOP_LEVEL_OAUTH_COOKIE = "shopify_top_level_oauth";
export const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT, 10);
export const isTest = process.env.NODE_ENV === "test" || !!process.env.VITE_TEST_BUILD;
export const DEV_INDEX_PATH = `${process.cwd()}/frontend/`;
export const PROD_INDEX_PATH = `${process.cwd()}/frontend/dist/`;
export const DB_PATH = `${process.cwd()}/database.sqlite`;
import {BillingInterval} from "../helpers/ensure-billing.js";

// The transactions with Shopify will always be marked as test transactions, unless NODE_ENV is production.
// See the ensureBilling helper to learn more about billing in this template.
export const BILLING_SETTINGS = {
    required: false,
    // This is an example configuration that would do a one-time charge for $5 (only USD is currently supported)
    // chargeName: "My Shopify One-Time Charge",
    // amount: 5.0,
    // currencyCode: "USD",
    // interval: BillingInterval.OneTime,
};

export const MONGO_DB_PATH = process.env.MONGO_DB_PATH
