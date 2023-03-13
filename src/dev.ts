import { Payshift } from "./index"
import { AlipayProvider } from "./providers/alipay"
import { privateKeyPath, alipayPublicKeyPath, appId } from "./configs/alipay"

const alipay = new AlipayProvider(appId, privateKeyPath, alipayPublicKeyPath)
const payshift = new Payshift([alipay])
payshift.startWebServer('http://localhost:3000', 3000)