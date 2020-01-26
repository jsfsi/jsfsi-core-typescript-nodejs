export interface Storage<K, V> {
    set(key: K, value: V): Promise<void>
    set(key: K, value: V): Promise<void>
    get(key: K): Promise<V>
    expireIn(key: K, seconds: number): Promise<void>
    delete(key: K): Promise<void>
    clear(): Promise<void>
}
