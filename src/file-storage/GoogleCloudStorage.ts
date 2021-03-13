import fs from 'fs'
import path from 'path'
import { Storage as GCPStorage } from '@google-cloud/storage'

import { FileStorage } from './FileStorage'
import { Logger } from '../Logger'

export type GoogleCloudStorageConfiguration = {
    notFoundPath: string
    bucket: string
    version: string
    ttl: number
    gzip: boolean
    keyFilename?: string
}

export class GoogleCloudStorage extends FileStorage<GoogleCloudStorageConfiguration> {
    private storage: GCPStorage
    constructor(configuration: GoogleCloudStorageConfiguration) {
        super(configuration)
        this.storage = new GCPStorage({
            keyFilename: configuration.keyFilename,
        })
    }

    public async getFile(filename: string): Promise<URL> {
        try {
            await this.storage
                .bucket(this.configuration.bucket)
                .file(filename)
                .getMetadata()
            const [url] = await this.storage
                .bucket(this.configuration.bucket)
                .file(filename)
                .getSignedUrl({
                    version: this.configuration.version as 'v2' | 'v4',
                    action: 'read',
                    expires: Date.now() + this.configuration.ttl,
                })
            return new URL(url)
        } catch (e) {
            Logger.debug('GoogleCloudStorage', `Failed to get file ${filename}`, e)
            const error = e as Error
            if (!error.message.includes('No such object:')) {
                throw e
            }
        }

        return new URL(this.configuration.notFoundPath)
    }
    public async saveFile(filePath: string, file: Buffer): Promise<URL> {
        const dir = path.dirname(filePath)
        const filename = path.basename(filePath)
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir)
        }

        fs.writeFile(filename, file, 'binary', error => {
            error &&
                Logger.warn('GoogleCloudStorage', 'Failed to write temporary file', error)
        })

        await this.storage
            .bucket(this.configuration.bucket)
            .upload(filename, { gzip: this.configuration.gzip, destination: filePath })

        const [url] = await this.storage
            .bucket(this.configuration.bucket)
            .file(filePath)
            .getMetadata()

        fs.unlink(filename, error => {
            error &&
                Logger.warn(
                    'GoogleCloudStorage',
                    'Failed to delete temporary file',
                    error,
                )
        })

        return new URL(url.selfLink)
    }
}
