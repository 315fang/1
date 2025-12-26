import { AuthorizationCode } from 'simple-oauth2';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req, res) {
  const { host } = req.headers;
  const { code } = req.query;
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

  try {
    const accessToken = await client.getToken({
      code,
      redirect_uri: `https://${host}/api/callback`,
    });
    const token = accessToken.token.access_token;

    const script = `
      <script>
        (function() {
          function receiveMessage(e) {
            console.log("receiveMessage %o", e);
            if (!e.origin.match(${JSON.stringify(host)}) && !e.origin.match("localhost")) {
              console.log('Invalid origin: %s', e.origin);
              return;
            }
            window.opener.postMessage(
              'authorization:github:success:${JSON.stringify({ token })}',
              e.origin
            );
          }
          window.addEventListener("message", receiveMessage, false);
          window.opener.postMessage("authorizing:github", "*");
        })()
      </script>
    `;
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(script);
  } catch (error) {
    console.error('Access Token Error', error.message);
    res.status(500).json('Authentication failed');
  }
}
