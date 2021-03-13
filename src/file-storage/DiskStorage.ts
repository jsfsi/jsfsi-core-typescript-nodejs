import fs from 'fs'
import path from 'path'

import { FileStorage } from './FileStorage'

export type DiskStorageConfiguration = {
    notFoundPath: string
}

export class DiskStorage extends FileStorage<DiskStorageConfiguration> {
    public async getFile(filePath: string): Promise<string> {
        return new Promise<string>(resolve => {
            fs.access(filePath, error => {
                error ? resolve(this.configuration.notFoundPath) : resolve(filePath)
            })
        })
    }
    public async saveFile(filePath: string, file: Buffer): Promise<string> {
        return new Promise((resolve, reject) => {
            const dir = path.dirname(filePath)

            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir)
            }

            fs.writeFile(filePath, file, 'binary', async error => {
                error ? reject(error) : resolve(filePath)
            })
        })
    }
}
