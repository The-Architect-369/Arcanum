// PSEUDO: Managing IPNS keys across CI securely is non-trivial. This stub shows the interface you’ll want.
// In practice, store the IPNS private key (libp2p ed25519) in CI secrets and load it here.
import { createHelia } from 'helia'
import { name } from '@helia/name'
const cid = process.argv[2] // CID of current app
const helia = await createHelia()
const naming = name(helia)
const keyName = process.env.IPNS_KEY || 'arcanum-site'
await naming.publish(cid, { key: keyName }) // requires the named key to exist/imported
console.log("Published IPNS for", cid)
await helia.stop()
