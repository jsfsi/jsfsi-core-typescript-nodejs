import { Configuration } from '../configuration/Configuration'
import { TokenGenerator, JWTSigningOptions, JWTDecodingOptions } from '../../src/'

type Payload = { test: string; exp?: number }

describe('Generate JWT token', () => {
    it('with valid private key and public key', async () => {
        const payload: Payload = { test: 'jwt token generator' }

        const signingOptions: JWTSigningOptions = {
            expirationDate: (new Date().getTime() + 300000) / 1000,
            algorithm: Configuration.jwt.algorithm,
            privateKey: Buffer.from(Configuration.jwt.privateKey, 'base64'),
        }

        const token = await TokenGenerator.generateJWT(payload, signingOptions)

        const decodingOptions: JWTDecodingOptions = {
            publicKey: Buffer.from(Configuration.jwt.publicKey, 'base64'),
            algorithms: [Configuration.jwt.algorithm],
        }

        const decodedPayload = await TokenGenerator.verifyJWT<Payload>(
            token,
            decodingOptions,
        )

        expect(decodedPayload).toBeTruthy()
        expect(decodedPayload.test).toBe(payload.test)
        expect(decodedPayload.exp).toBeTruthy()
        expect(decodedPayload.exp).toBe(signingOptions.expirationDate)
    })
})

describe('Verify JWT token', () => {
    it('expired', async () => {
        const payload: Payload = { test: 'jwt token generator' }

        const signingOptions: JWTSigningOptions = {
            expirationDate: (new Date().getTime() - 300000) / 1000,
            algorithm: Configuration.jwt.algorithm,
            privateKey: Buffer.from(Configuration.jwt.privateKey, 'base64'),
        }

        const token = await TokenGenerator.generateJWT(payload, signingOptions)

        try {
            await TokenGenerator.verifyJWT<Payload>(token, {
                publicKey: Buffer.from(Configuration.jwt.publicKey, 'base64'),
            })
        } catch (error) {
            expect(error).toBeTruthy()
            expect(error.message).toBe('jwt expired')
        }
    })

    it('with invalid public key', async () => {
        const payload: Payload = { test: 'jwt token generator' }

        const signingOptions: JWTSigningOptions = {
            expirationDate: (new Date().getTime() - 300000) / 1000,
            algorithm: Configuration.jwt.algorithm,
            privateKey: Buffer.from(Configuration.jwt.privateKey, 'base64'),
        }

        const token = await TokenGenerator.generateJWT(payload, signingOptions)

        try {
            await TokenGenerator.verifyJWT<Payload>(token, {
                publicKey: Buffer.from('invalid', 'base64'),
            })
        } catch (error) {
            expect(error).toBeTruthy()
            expect(error.message).toBe('invalid algorithm')
        }
    })

    it('with invalid algorithm', async () => {
        const payload: Payload = { test: 'jwt token generator' }

        const signingOptions: JWTSigningOptions = {
            expirationDate: (new Date().getTime() - 300000) / 1000,
            algorithm: Configuration.jwt.algorithm,
            privateKey: Buffer.from(Configuration.jwt.privateKey, 'base64'),
        }

        const token = await TokenGenerator.generateJWT(payload, signingOptions)

        try {
            await TokenGenerator.verifyJWT<Payload>(token, {
                publicKey: Buffer.from(Configuration.jwt.publicKey, 'base64'),
                algorithms: ['PS512'],
            })
        } catch (error) {
            expect(error).toBeTruthy()
            expect(error.message).toBe('invalid algorithm')
        }
    })
})
