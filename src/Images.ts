import fs from 'fs'
import path from 'path'

export const encodeImgToBase64 = (imagePath: string) => {
    const extension = path.extname(imagePath).substr(1)
    const content = fs.readFileSync(imagePath, 'base64')
    return `data:image/${extension};base64,${content}`
}
