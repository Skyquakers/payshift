import path from "node:path"

export const privateKeyPath = path.join(__dirname, '../../../certs/wechat-pay/apiclient-key.pem')
export const publicKeyPath = path.join(__dirname, '../../../certs/wechat-pay/apiclient-cert.pem')
export { appId, mcid, apiKey } from "../../certs/wechat-pay/secret"
