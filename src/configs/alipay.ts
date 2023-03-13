import path from "node:path"

export { appId } from "../../certs/alipay/secret"
export const privateKeyPath = path.join(__filename, '../../../certs/alipay/private-key.pem')
export const publicKeyPath = path.join(__filename, '../../../certs/alipay/public-key.crt')
export const alipayPublicKeyPath = path.join(__filename, '../../../certs/alipay/alipay-public-key.crt')
