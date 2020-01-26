import crypto from 'crypto'

export function md5(data: string): string
export function md5(data: object): string

export function md5(data: string | object): string {
    const textData = typeof data === 'object' ? JSON.stringify(data) : data

    return crypto
        .createHash('md5')
        .update(textData)
        .digest('hex')
}
