import util from "./util";
import { md5Hash } from './crypt'

export interface GenerateRequestOptions {
    pkey: string;
    // Service URL
    surl?: string;
    data?: { [key: string]: string };
    headers?: { [key: string]: string };
    site?: string;
    // Page URL
    location?: string;
    canvasFp?: string;
}

export interface GeneratedRequest {
    url: string;
    body: string;
    headers: Record<string, string>;
}

export function generateRequest(options: GenerateRequestOptions): GeneratedRequest {
    options = {
        surl: "https://client-api.arkoselabs.com",
        data: {},
        ...options,
    };

    if (!options.headers)
        options.headers = { "User-Agent": util.DEFAULT_USER_AGENT };
    else if (!Object.keys(options.headers).map(v => v.toLowerCase()).includes("user-agent"))
        options.headers["User-Agent"] = util.DEFAULT_USER_AGENT;

    options.headers["Accept-Language"] = "en-US,en;q=0.9";
    options.headers["Sec-Fetch-Site"] = "same-origin";
    options.headers["Accept"] = "*/*";
    options.headers["Content-Type"] = "application/x-www-form-urlencoded; charset=UTF-8";
    options.headers["sec-fetch-mode"] = "cors"

    if (options.site) {
        options.headers["Origin"] = options.surl
        options.headers["Referer"] = `${options.surl}/v2/${options.pkey}/1.5.2/enforcement.${md5Hash(util.random().toString())}.html`
    }

    let ua = options.headers[Object.keys(options.headers).find(v => v.toLowerCase() == "user-agent")]

    return {
        url: options.surl + '/fc/gt2/public_key/' + options.pkey,
        body: util.constructFormData({
            bda: util.getBda(ua, options.pkey, options.surl, options.headers["Referer"], options.location, options.canvasFp),
            public_key: options.pkey,
            site: options.site,
            userbrowser: ua,
            capi_version: "1.5.2",
            capi_mode: "lightbox",
            style_theme: "default",
            rnd: Math.random().toString(),
            ...Object.fromEntries(Object.keys(options.data).map(v => ["data[" + v + "]", options.data[v]]))
        }),
        headers: options.headers,
    }
}
