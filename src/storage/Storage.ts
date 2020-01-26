import { Disposable } from '@jsfsi-core/typescript-cross-platform'

export interface Storage<K, V> extends Disposable {
    set(key: K, value: V): Promise<void>
    set(key: K, value: V): Promise<void>
    get(key: K): Promise<V>
    expireIn(key: K, seconds: number): Promise<void>
    delete(key: K): Promise<void>
    clear(): Promise<void>
}
