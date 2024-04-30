const jwt = require('jsonwebtoken')
const jwksClient = require('jwks-ec')
const fs = require('fs')
 

function verifyJwt(token, jwksUri) {
  return new Promise((resolve, reject) => {
    const options = {
      algorithms: ['ES384'],
    }

    const client = jwksClient({
      strictSsl: false,
      jwksUri,
      requestHeaders: {},
      requestAgentOptions: {}
    })

    function getKey(header, callback) {
      client.getSigningKey(header.kid, (err, key) => {
        if (err) {
          console.error('Failed to get signing key:', err)
          return callback(err)
        }
        const signingKey = key.publicKey || key.rsaPublicKey
        callback(null, signingKey)
      })
    }

    jwt.verify(token, getKey, options, (err, decoded) => {
      if (err) {
        console.error('JWT verification failed:', err)
        reject(err)
      } else {
        console.log('Decoded payload:', decoded)
        resolve(decoded)
      }
    })
  })
}

async function main() {
   // This example read the jwt from a local file
   const token = fs.readFileSync('jwt').toString()
   const jwksUri = 'https://oidc-api.mesh.in/.well-known/jwks.json'

  try {
    const decodedPayload = await verifyJwt(token, jwksUri)
    console.log('Decoded payload:', decodedPayload)
  } catch (error) {
    console.error('Invalid token:', error)
  }
}

main().catch(console.error)

