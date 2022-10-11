import crypto from "crypto"

export const sha256 = (string) => crypto.createHash("sha256").update(string).digest("hex")