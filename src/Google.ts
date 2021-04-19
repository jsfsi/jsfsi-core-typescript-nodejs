import { HttpRequest, HttpMethods } from '@jsfsi-core/typescript-cross-platform'
import { executeShell } from './Shell'

export interface GoogleUser {
  id?: string
  email?: string
  given_name?: string
  family_name?: string
  picture?: string
  locale?: string
}

export class Google {
  constructor(
    private tokenInfoURL = 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=',
  ) {}

  async userInfo(accessToken: string) {
    const request = await HttpRequest.fetch<GoogleUser>({
      href: `${this.tokenInfoURL}${accessToken}`,
      method: HttpMethods.GET,
    })

    return request?.data
  }

  async getToken() {
    let googleAccessToken = (await executeShell(
      'gcloud auth print-access-token',
    )) as string
    googleAccessToken = googleAccessToken.substring(0, googleAccessToken.length - 1)
    return googleAccessToken
  }
}
