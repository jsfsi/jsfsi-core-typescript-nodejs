import { Disposable } from '@jsfsi-core/typescript-cross-platform'

export abstract class Storage<K, V> implements Disposable {
  abstract set(key: K, value: V): Promise<void>
  abstract set(key: K, value: V): Promise<void>
  abstract get(key: K): Promise<V>
  abstract expireIn(key: K, seconds: number): Promise<void>
  abstract delete(key: K): Promise<void>
  abstract clear(): Promise<void>
  abstract dispose(): Promise<void>
}
