import { Storage } from './Storage'
import { Inject } from 'typescript-ioc'
import { RedisClient } from 'redis'
import { Disposable } from '@jsfsi-core/typescript-cross-platform'

export abstract class RedisConfiguration {
    host: string
    port: number
    db?: string
    password?: string
    connect_timeout?: number
}

export class RedisStorage implements Storage<string, string>, Disposable {
    private connection: RedisClient

    constructor(@Inject configuration: RedisConfiguration) {
        this.connection = new RedisClient(configuration)
    }

    async set(key: string, value: string) {
        return new Promise<void>((resolve, reject) => {
            this.connection.set(key, value, error => {
                error ? reject(error) : resolve()
            })
        })
    }

    async get(key: string) {
        return new Promise<string>((resolve, reject) => {
            this.connection.get(key, (error, value) => {
                error ? reject(error) : resolve(value)
            })
        })
    }

    async expireIn(key: string, seconds: number) {
        return new Promise<void>((resolve, reject) => {
            this.connection.expire(key, seconds, error => {
                error ? reject(error) : resolve()
            })
        })
    }

    async delete(key: string) {
        return new Promise<void>((resolve, reject) => {
            this.connection.del(key, error => {
                error ? reject(error) : resolve()
            })
        })
    }

    async clear() {
        return new Promise<void>((resolve, reject) => {
            this.connection.flushdb(error => {
                error ? reject(error) : resolve()
            })
        })
    }

    async dispose() {
        return new Promise<void>((resolve, reject) => {
            this.connection.quit(error => {
                error ? reject(error) : resolve()
            })
        })
    }
}
