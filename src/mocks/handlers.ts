import {http, HttpResponse} from "msw";

import { initialNFTs } from "./fixtures/nfts";

export const handlers = [
    http.get("/api/nfts", () => {
        return HttpResponse.json({
            data: initialNFTs,
            total: initialNFTs.length,
        })
    })
]