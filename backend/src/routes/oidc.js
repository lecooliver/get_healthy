const express = require('express')
const passport = require('passport')
const { handleOAuthCallback } = require('../utils/passport-config')

const router = express.Router()

router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  prompt: 'consent'
}))

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => handleOAuthCallback(req, res, req.user)
)

router.get('/github', passport.authenticate('github', {
  scope: ['user:email']
}))

router.get('/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: '/login' }),
  (req, res) => handleOAuthCallback(req, res, req.user)
)

router.get('/keycloak',
  passport.authenticate('keycloak', { scope: ['openid', 'profile', 'email'] })
)

router.get('/keycloak/callback',
  passport.authenticate('keycloak', { session: false, failureRedirect: '/login' }),
  (req, res) => handleOAuthCallback(req, res, req.user)
)

router.get('/authentik',
  passport.authenticate('authentik', { scope: ['openid', 'profile', 'email'] })
)

router.get('/authentik/callback',
  passport.authenticate('authentik', { session: false, failureRedirect: '/login' }),
  (req, res) => handleOAuthCallback(req, res, req.user)
)

router.get('/authelia',
  passport.authenticate('authelia', { scope: ['openid', 'profile', 'email'] })
)

router.get('/authelia/callback',
  passport.authenticate('authelia', { session: false, failureRedirect: '/login' }),
  (req, res) => handleOAuthCallback(req, res, req.user)
)

router.get('/generic',
  passport.authenticate('generic', { scope: ['openid', 'profile', 'email'] })
)

router.get('/generic/callback',
  passport.authenticate('generic', { session: false, failureRedirect: '/login' }),
  (req, res) => handleOAuthCallback(req, res, req.user)
)

router.get('/providers', (req, res) => {
  res.json({
    google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    github: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
    keycloak: !!(process.env.KEYCLOAK_CLIENT_ID && process.env.KEYCLOAK_CLIENT_SECRET),
    authentik: !!(process.env.AUTHENTIK_CLIENT_ID && process.env.AUTHENTIK_CLIENT_SECRET),
    authelia: !!(process.env.AUTHELIA_CLIENT_ID && process.env.AUTHELIA_CLIENT_SECRET),
    generic: !!(process.env.OIDC_CLIENT_ID && process.env.OIDC_CLIENT_SECRET)
  })
})

module.exports = router
