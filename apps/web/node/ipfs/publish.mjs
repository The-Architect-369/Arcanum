import { createHelia } from 'helia'
import { unixfs } from '@helia/unixfs'
import { FsBlockstore } from 'blockstore-fs'
import { MemoryDatastore } from 'datastore-core'
import { globby } from 'globby'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

const dir = process.argv[2] || './apps/web/out'
const blockstore = new FsBlockstore('./.ipfs-blocks')
const datastore = new MemoryDatastore()
const helia = await createHelia({ datastore, blockstore })
const fs = unixfs(helia)

const files = await globby('**/*', { cwd: dir, dot: false })
const addeds = []
for (const f of files) {
  const content = await readFile(path.join(dir, f))
  const cid = await fs.addBytes(content)
  addeds.push({ f, cid: cid.toString() })
}
const manifest = JSON.stringify(addeds, null, 2)
console.log(manifest)

const rootCid = await fs.addDirectory()
console.log("ROOT_CID", rootCid.toString())
await helia.stop()
