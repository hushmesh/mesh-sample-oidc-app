import {
  AuthorizationServiceConfiguration,
  RedirectRequestHandler,
  AuthorizationRequest,
  AuthorizationNotifier,
  TokenRequest,
  BaseTokenRequestHandler,
  FetchRequestor,
  GRANT_TYPE_AUTHORIZATION_CODE,
} from '@openid/appauth'

export interface SavedTokens {
  accessToken: string
  idToken: string
  expireTime: Date
}

export interface UserProfile {
  sub: string
  name?: string
  email?: string
  client_id: string
}

class AuthService {
  onLoginFailed: (() => void) | null = null
  onLoginSuccess: (() => void) | null = null

  private clientId: string
  private redirectUri: string
  private scope: string
  private authority: string
  private authConfig: AuthorizationServiceConfiguration | null
  private requestHandler: RedirectRequestHandler
  private requestor: FetchRequestor
  private tokenHandler: BaseTokenRequestHandler
  private notifier: AuthorizationNotifier

  constructor() {
    this.clientId = process.env.REACT_APP_CLIENT_ID || ''
    this.redirectUri = process.env.REACT_APP_REDIRECT_URI || ''
    this.scope = 'email'
    this.authority = process.env.REACT_APP_AUTHORITY || ''
    this.authConfig = null
    this.requestHandler = new RedirectRequestHandler()
    this.requestor = new FetchRequestor()
    this.tokenHandler = new BaseTokenRequestHandler(this.requestor)
    this.notifier = new AuthorizationNotifier()
    this.requestHandler.setAuthorizationNotifier(this.notifier)
  }

  private saveTokens(tokens: SavedTokens) {
    sessionStorage.setItem('tokens', JSON.stringify(tokens))
  }

  getTokens(): SavedTokens | null {
    const tokens = sessionStorage.getItem('tokens')
    if (!tokens) {
      return null
    }
    const tokensJson = JSON.parse(tokens)
    const tokensObj: SavedTokens = {
      accessToken: tokensJson.accessToken,
      idToken: tokensJson.idToken,
      expireTime: new Date(tokensJson.expireTime),
    }
    if (new Date() > tokensObj.expireTime) {
      console.error('Access token has expired.')
      return null
    }
    return tokensObj
  }

  clearTokens() {
    sessionStorage.removeItem('tokens')
  }

  private async initConfig(): Promise<void> {
    try {
      this.authConfig = await AuthorizationServiceConfiguration.fetchFromIssuer(this.authority, this.requestor)
    } catch (error) {
      console.error('Error fetching authorization configuration:', error)
    }
    this.notifier.setAuthorizationListener(async (request, response, error) => {
      if (response && response.code) {
        await this.exchangeCodeForToken(request, response.code)
      }
    })
  }

  private loginFailed() {
    this.clearTokens()
    this.onLoginFailed && this.onLoginFailed()
  }

  private async exchangeCodeForToken(request: AuthorizationRequest, code: string): Promise<void> {
    if (!request.internal?.code_verifier) {
      console.error('Code verifier is missing.')
      this.onLoginFailed && this.onLoginFailed()
      return
    }
    if (!this.authConfig) {
      console.error('Authorization configuration is missing.')
      this.onLoginFailed && this.onLoginFailed()
      return
    }
    const tokenRequest = new TokenRequest({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      grant_type: GRANT_TYPE_AUTHORIZATION_CODE,
      code: code,
      extras: { code_verifier: request.internal.code_verifier },
    })

    try {
      const tokenResponse = await this.tokenHandler.performTokenRequest(this.authConfig, tokenRequest)
      if (!tokenResponse.accessToken || !tokenResponse.idToken || !tokenResponse.expiresIn) {
        console.error('Token response is missing required fields.')
        this.loginFailed()
        return
      }
      this.saveTokens({
        idToken: tokenResponse.idToken,
        accessToken: tokenResponse.accessToken,
        expireTime: new Date(new Date().getTime() + tokenResponse.expiresIn * 1000),
      })
      this.onLoginSuccess && this.onLoginSuccess()
    } catch (error) {
      console.error('Failed to exchange token:', error)
      this.loginFailed()
    }
  }

  async login(): Promise<void> {
    if (!this.authConfig) {
      await this.initConfig()
      if (!this.authConfig) {
        console.error('Failed to load authorization configuration, cannot proceed with login.')
        return
      }
    }

    const authRequest = new AuthorizationRequest({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: this.scope,
      response_type: AuthorizationRequest.RESPONSE_TYPE_CODE,
    })

    this.requestHandler.performAuthorizationRequest(this.authConfig, authRequest)
  }

  async processCallback(): Promise<void> {
    if (!this.authConfig) {
      await this.initConfig()
      if (!this.authConfig) {
        console.error('Failed to load authorization configuration, cannot proceed with login.')
        return
      }
    }
    await this.requestHandler.completeAuthorizationRequestIfPossible()
  }

  logout() {
    this.clearTokens()
  }

  async loadConfig(): Promise<void> {
    if (!this.authConfig) {
      await this.initConfig()
    }
  }
  async fetchUserProfile(): Promise<UserProfile> {
    if (!this.authConfig) {
      await this.initConfig()
    }
    const tokens = this.getTokens()
    if (!this.authConfig?.userInfoEndpoint || !tokens?.accessToken) {
      throw new Error('Missing configuration or access token.')
    }
    let data = await fetch(this.authConfig.userInfoEndpoint, {
      headers: {
        Authorization: `Bearer ${tokens?.accessToken}`,
      },
    })
    return (await data.json()) as UserProfile
  }
}
const authService = new AuthService()
export default authService
