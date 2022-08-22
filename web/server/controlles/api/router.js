import express from "express";
import {handleProxyShopifyGraphql} from "./proxyShopifyGraphql.js";
import {getCountProducts} from "./products.js";

const routerApi = express.Router();

routerApi.get('/products-count', getCountProducts);
routerApi.post("/graphql", handleProxyShopifyGraphql);

export default routerApi