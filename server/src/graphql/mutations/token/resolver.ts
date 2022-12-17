import Hana from 'hana.js'
import { env } from 'process'

export const token = async (
  _: any,
  args: { input: any },
  { ctx }: any
): Promise<any> => {
  try {
    const refreshToken = ctx.request.cookies.refresh_token

    Hana.init({
      clientId: env.CLIENT_ID as string
    })

    const token = await Hana.Auth.token({
      grantType: args.input.grantType,
      code: args.input.code,
      refreshToken: refreshToken,
      redirectUri: env.REDIRECT_URI as string,
      clientSecret: env.CLIENT_SECRET ?? undefined
    })

    return {
      accessToken: token.access_token,
      expiresIn: token.expires_in,
      idToken: token.id_token,
      scope: token.scope,
      tokenType: token.token_type
    }
  } catch (err) {
    console.error(err)
  }
}
