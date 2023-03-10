import path from "node:path"

export { appId } from "../../certs/alipay/secret"
export const privateKeyPath = path.join(__dirname, '../../../certs/alipay/private-key.pem')
export const publicKeyPath = path.join(__dirname, '../../../certs/alipay/public-key.crt')
export const alipayPublicKeyPath = path.join(__dirname, '../../../certs/alipay/alipay-public-key.crt')
