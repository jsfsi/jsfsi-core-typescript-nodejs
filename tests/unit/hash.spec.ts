import { md5 } from '../../src'

describe('Generate Hash', () => {
    it('with string', async () => {
        const hash = md5('some text')
        expect(hash).toBeTruthy()
        expect(hash.length).toBeGreaterThan(0)
    })

    it('with object', async () => {
        const hash = md5({ id: 'some id', value: 'some value' })
        expect(hash).toBeTruthy()
        expect(hash.length).toBeGreaterThan(0)
    })
})
