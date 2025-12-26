import { AuthorizationCode } from 'simple-oauth2';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req, res) {
  const { host } = req.headers;
  const client = new AuthorizationCode({
    client: {
      id: process.env.OAUTH_CLIENT_ID,
      secret: process.env.OAUTH_CLIENT_SECRET,
    },
    auth: {
      tokenHost: 'https://github.com',
      tokenPath: '/login/oauth/access_token',
      authorizePath: '/login/oauth/authorize',
    },
  });

  const authorizationUri = client.authorizeURL({
    redirect_uri: `https://${host}/api/callback`,
    scope: 'repo,user',
    state: Math.random().toString(36).substring(2),
  });

  res.redirect(authorizationUri);
}
