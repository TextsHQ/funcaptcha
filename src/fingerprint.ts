import * as os from 'os'

const baseFingerprint = {
    DNT: '1', // Do not track On/Off | Previous Value: 1
    L: "en-US", // Browser language
    D: 24, // Screen color depth (in bits)
    PR: 1, // Pixel ratio
    S: [1920, 1200], // Screen resolution
    AS: [1920, 1200], // Available screen resolution
    TO: 9999, // Timezone offset
    SS: true, // Screen orientation (landscape/portrait)
    LS: true, // Local storage available
    IDB: true, // IndexedDB available
    B: false, // addBehaviour support
    ODB: true, // OpenDatabase support
    CPUC: "Others", // CPU Class
    PK: "Win32", // Platform
    CFP: false, /*`canvas winding:yes~canvas fp:data:image/png;base64,${Buffer.from(
        Math.random().toString()
    ).toString("base64")}`,*/ // Canvas fingerprint (if canvas is supported)
    FR: false, // Fake screen resolution?
    FOS: false, // Fake OS?
    FB: false, // Fake Browser?
    JSF: '', /*[
        "Andale Mono",
        "Arial",
        "Arial Black",
        "Arial Hebrew",
        "Arial MT",
        "Arial Narrow",
        "Arial Rounded MT Bold",
        "Arial Unicode MS",
        "Bitstream Vera Sans Mono",
        "Book Antiqua",
        "Bookman Old Style",
        "Calibri",
        "Cambria",
        "Cambria Math",
        "Century",
        "Century Gothic",
        "Century Schoolbook",
        "Comic Sans",
        "Comic Sans MS",
        "Consolas",
        "Courier",
        "Courier New",
        "Garamond",
        "Geneva",
        "Georgia",
        "Helvetica",
        "Helvetica Neue",
        "Impact",
        "Lucida Bright",
        "Lucida Calligraphy",
        "Lucida Console",
        "Lucida Fax",
        "LUCIDA GRANDE",
        "Lucida Handwriting",
        "Lucida Sans",
        "Lucida Sans Typewriter",
        "Lucida Sans Unicode",
        "Microsoft Sans Serif",
        "Monaco",
        "Monotype Corsiva",
        "MS Gothic",
        "MS Outlook",
        "MS PGothic",
        "MS Reference Sans Serif",
        "MS Sans Serif",
        "MS Serif",
        "MYRIAD",
        "MYRIAD PRO",
        "Palatino",
        "Palatino Linotype",
        "Segoe Print",
        "Segoe Script",
        "Segoe UI",
        "Segoe UI Light",
        "Segoe UI Semibold",
        "Segoe UI Symbol",
        "Tahoma",
        "Times",
        "Times New Roman",
        "Times New Roman PS",
        "Trebuchet MS",
        "Verdana",
        "Wingdings",
        "Wingdings 2",
        "Wingdings 3",
    ], // Available fonts*/
    P: [
        "Chrome PDF Plugin::Portable Document Format::application/x-google-chrome-pdf~pdf",
        "Chrome PDF Viewer::::application/pdf~pdf",
        "Native Client::::application/x-nacl~,application/x-pnacl~",
    ], // Plugins
    T: [0, false, false], // Touch screen (maxTouchPoints, TouchEvent event listener support, ontouchstart support)
    H: os.cpus().length, // Cpu threads
    SWF: false, // Flash
};

let screenRes = [
    [1920, 1080],
    [1920, 1200],
    [2048, 1080],
    [2560, 1440],
    [1366, 768],
    [1440, 900],
    [1536, 864],
    [1680, 1050],
    [1280, 1024],
    [1280, 800],
    [1280, 720],
    [1600, 1200],
    [1600, 900],
];
function randomScreenRes() {
    return screenRes[Math.floor(Math.random() * screenRes.length)];
}

// Get fingerprint
function getFingerprint(canvasFp?: string) {
    let fingerprint = { ...baseFingerprint }; // Create a copy of the base fingerprint

    // Randomization time!
    fingerprint["D"] = [1, 4, 8, 15, 16, 24, 32, 48][
        Math.floor(Math.random() * 8)
    ];
    fingerprint["PR"] = Math.round(Math.random() * 100) / 100 * 2 + 0.5;
    fingerprint["S"] = randomScreenRes();
    fingerprint["AS"] = [fingerprint["S"][0], fingerprint["S"][1] - 40];
    fingerprint["TO"] = (Math.floor(Math.random() * 24) - 12) * 60;
    fingerprint["SS"] = Math.random() > 0.5;
    fingerprint["LS"] = Math.random() > 0.5;
    fingerprint["IDB"] = Math.random() > 0.5;
    fingerprint["B"] = Math.random() > 0.5;
    fingerprint["ODB"] = Math.random() > 0.5;
    // ["68K", "Alpha", "PPC", "x86", "Other", "unknown"]
    fingerprint["CPUC"] = "Other";
    // ["HP-UX", "Mac68K", "MacPPC", "SunOS", "Win16", "Win32", "WinCE"]
    fingerprint["PK"] = "Win32";

    fingerprint["CFP"] = false; //canvasFp || ''; // Canvas Fingerprint
    fingerprint["FR"] = false; // Fake Resolution
    fingerprint["FOS"] = false; // Fake Operating System
    fingerprint["FB"] = false; // Fake Browser
    fingerprint["JSF"] = ''; //fingerprint["JSF"].filter(() => Math.random() > 0.5);
    fingerprint["P"] = fingerprint["P"].filter(() => Math.random() > 0.5);
    // fingerprint["T"] = [
    //     Math.floor(Math.random() * 8),
    //     Math.random() > 0.5,
    //     Math.random() > 0.5,
    // ];

    return fingerprint;
}

function prepareF(fingerprint) {
    let f = [];
    let keys = Object.keys(fingerprint);
    for (let i = 0; i < keys.length; i++) {
        if (fingerprint[keys[i]].join) f.push(fingerprint[keys[i]].join(";"));
        else f.push(fingerprint[keys[i]]);
    }
    return f.join("~~~");
}

function prepareFe(fingerprint) {
    let fe = [];
    let keys = Object.keys(fingerprint);
    for (let i = 0; i < keys.length; i++) {
        switch (keys[i]) {
            case "CFP":
                fe.push(`${keys[i]}:${cfpHash(fingerprint[keys[i]])}`);
                break;
            case "P":
                fe.push(
                    `${keys[i]}:${fingerprint[keys[i]].map(
                        (v) => v.split("::")[0]
                    )}`
                );
                break;
            default:
                fe.push(`${keys[i]}:${fingerprint[keys[i]]}`);
                break;
        }
    }

    return fe;
}

function cfpHash(H8W) {
    var l8W, U8W;
    if (!H8W) return "";
    if (Array.prototype.reduce)
        return H8W.split("").reduce(function (p8W, z8W) {
            p8W = (p8W << 5) - p8W + z8W.charCodeAt(0);
            return p8W & p8W;
        }, 0);
    l8W = 0;
    if (H8W.length === 0) return l8W;
    for (var k8W = 0; k8W < H8W.length; k8W++) {
        U8W = H8W.charCodeAt(k8W);
        l8W = (l8W << 5) - l8W + U8W;
        l8W = l8W & l8W;
    }
    return l8W;
}

export default {
    getFingerprint,
    prepareF,
    prepareFe,
};
