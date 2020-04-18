import { HttpRequest, HttpMethods } from '@jsfsi-core/typescript-cross-platform'

export interface GoogleUser {
    azp: string
    aud: string
    sub: string
    email: string
    name: string
    picture: string
}

export class Google {
    constructor(private tokenInfoURL: string) {}

    async userInfo(accessToken: string) {
        const request = await HttpRequest.fetch<GoogleUser>({
            href: `${this.tokenInfoURL}${accessToken}`,
            method: HttpMethods.GET,
        })

        return request?.data
    }
}
