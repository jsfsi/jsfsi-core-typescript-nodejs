import { Google } from '../../src/Google'

describe('Google user info', () => {
  const google = new Google()

  let googleAccessToken: string
  beforeAll(async () => {
    googleAccessToken = await google.getToken()
  })

  it('Get user info with token', async () => {
    const userInfo = await google.userInfo(googleAccessToken)
    expect(userInfo.id).toBeDefined()
    expect(userInfo.email).toBeDefined()
    expect(userInfo.picture).toBeDefined()
  })
})
