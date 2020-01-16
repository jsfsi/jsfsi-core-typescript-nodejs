export const Configuration = {
    jwt: {
        publicKey: process.env.TEST_JWT_PUBLIC_KEY,
        privateKey: process.env.TEST_JWT_PRIVATE_KEY,
        algorithm: process.env.TEST_JWT_ALGORITHM,
    },
}
