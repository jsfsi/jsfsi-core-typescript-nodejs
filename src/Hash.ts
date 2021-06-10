import crypto from 'crypto'

type data = Record<string, unknown>

export function md5(data: string): string
export function md5(data: data): string

export function md5(data: string | data): string {
  const textData = typeof data === 'object' ? JSON.stringify(data) : data

  return crypto.createHash('md5').update(textData).digest('hex')
}
