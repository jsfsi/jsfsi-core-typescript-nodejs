import { Logger } from '../Logger'
import { DiskStorage, DiskStorageConfiguration } from './DiskStorage'
import { GoogleCloudStorage, GoogleCloudStorageConfiguration } from './GoogleCloudStorage'

export type FILE_STORAGE_TYPE = 'disk' | 'google-cloud'

export type FileStorageFactoryConfiguration = {
    disk?: DiskStorageConfiguration
    googleCloud?: GoogleCloudStorageConfiguration
}

export class FileStorageFactory {
    constructor(private configuration: FileStorageFactoryConfiguration) {}

    private diskStorage = new DiskStorage({
        notFoundPath: this.configuration.disk.notFoundPath,
    })
    private gcpStorage = new GoogleCloudStorage({
        notFoundPath: this.configuration.googleCloud.notFoundPath,
        bucket: this.configuration.googleCloud.bucket,
        version: this.configuration.googleCloud.version,
        ttl: this.configuration.googleCloud.ttl,
        gzip: this.configuration.googleCloud.gzip,
        keyFilename: this.configuration.googleCloud.keyFilename,
    })

    public getInstance(type: FILE_STORAGE_TYPE) {
        Logger.debug(`Get storage instance for type ${type}`)
        switch (type) {
            case 'disk':
                return this.diskStorage
            case 'google-cloud':
                return this.gcpStorage
            default:
                return null
        }
    }
}
