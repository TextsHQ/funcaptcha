import { createHash, createCipheriv, createDecipheriv } from "crypto";

interface EncryptionData {
    ct: string;
    iv: string;
    s: string;
}

const alphabet = "abcdefghijklmnopqrstuvwxyz";
let md5 = createHash("md5");

function encrypt(data: string, key: string): string {
    let salt = "";
    let salted = "";
    let dx = Buffer.alloc(0);

    salt = Array(8)
        .fill(0)
        .map((v) => alphabet[Math.floor(Math.random() * alphabet.length)])
        .join(""); // 8 random letters
    data =
        data +
        Array(17 - (data.length % 16)).join(
            String.fromCharCode(16 - (data.length % 16))
        ); // Padding (pkcs7?)

    for (let x = 0; x < 3; x++) {
        dx = md5
            .update(
                Buffer.concat([
                    Buffer.from(dx),
                    Buffer.from(key),
                    Buffer.from(salt),
                ])
            )
            .digest();

        salted += dx.toString("hex");
        md5 = createHash("md5");
    }

    let aes = createCipheriv(
        "aes-256-cbc",
        Buffer.from(salted, "hex").slice(0, 32),
        Buffer.from(salted, "hex").slice(32, 32 + 16)
    );
    aes.setAutoPadding(false);

    return JSON.stringify({
        ct: aes.update(data, null, "base64") + aes.final("base64"),
        iv: salted.substring(64, 64 + 32),
        s: Buffer.from(salt).toString("hex"),
    });
}

function decrypt(rawData: string, key: string): string {
    let data: EncryptionData = JSON.parse(rawData);

    let dk = Buffer.concat([Buffer.from(key), Buffer.from(data.s, "hex")]);

    let md5 = createHash("md5");
    let arr = [Buffer.from(md5.update(dk).digest()).toString("hex")];
    let result = arr[0];

    for (let x = 1; x < 3; x++) {
        md5 = createHash("md5");
        arr.push(
            Buffer.from(
                md5
                    .update(Buffer.concat([Buffer.from(arr[x - 1], "hex"), dk]))
                    .digest()
            ).toString("hex")
        );
        result += arr[x];
    }

    let aes = createDecipheriv(
        "aes-256-cbc",
        Buffer.from(result, "hex").slice(0, 32),
        Buffer.from(data.iv, "hex")
    );
    return aes.update(data.ct, "base64", "utf8") + aes.final("utf8");
}

function md5Hash(data: string): string {
    return createHash("md5").update(data).digest("hex");
}

export {
    encrypt,
    decrypt,
    md5Hash
};
