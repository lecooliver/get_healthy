const GoogleStrategy = require('passport-google-oauth20').Strategy
const GitHubStrategy = require('passport-github2').Strategy
const OIDCStrategy = require('passport-openidconnect').Strategy
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const jwt = require('jsonwebtoken')

const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

const findOrCreateOAuthUser = async (provider, providerId, email, displayName, avatarUrl) => {
  let user = await prisma.user.findFirst({
    where: {
      provider,
      providerId
    }
  })

  if (user) {
    if (avatarUrl && user.avatarUrl !== avatarUrl) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { avatarUrl }
      })
    }
    return user
  }

  user = await prisma.user.findUnique({ where: { email } })

  if (user) {
    return await prisma.user.update({
      where: { id: user.id },
      data: {
        provider,
        providerId,
        emailVerified: true,
        avatarUrl: avatarUrl || user.avatarUrl
      }
    })
  }

  return await prisma.user.create({
    data: {
      email,
      displayName,
      provider,
      providerId,
      emailVerified: true,
      avatarUrl,
      passwordHash: null
    }
  })
}

const configurePassport = (passport) => {
  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { id } })
      done(null, user)
    } catch (error) {
      done(error, null)
    }
  })

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/oidc/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await findOrCreateOAuthUser(
          'google',
          profile.id,
          profile.emails[0].value,
          profile.displayName,
          profile.photos?.[0]?.value
        )
        done(null, user)
      } catch (error) {
        done(error, null)
      }
    }))
  }

  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(new GitHubStrategy({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL || '/api/auth/oidc/github/callback',
      scope: ['user:email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value || `${profile.username}@github.placeholder`
        const displayName = profile.displayName || profile.username
        const user = await findOrCreateOAuthUser(
          'github',
          profile.id,
          email,
          displayName,
          profile.photos?.[0]?.value
        )
        done(null, user)
      } catch (error) {
        done(error, null)
      }
    }))
  }

  const oidcProviders = [
    {
      name: 'keycloak',
      enabled: process.env.KEYCLOAK_CLIENT_ID && process.env.KEYCLOAK_CLIENT_SECRET,
      config: {
        clientID: process.env.KEYCLOAK_CLIENT_ID,
        clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
        issuer: process.env.KEYCLOAK_ISSUER,
        authorizationURL: process.env.KEYCLOAK_AUTHORIZATION_URL,
        tokenURL: process.env.KEYCLOAK_TOKEN_URL,
        userInfoURL: process.env.KEYCLOAK_USERINFO_URL,
        callbackURL: process.env.KEYCLOAK_CALLBACK_URL || '/api/auth/oidc/keycloak/callback',
        scope: ['openid', 'profile', 'email']
      }
    },
    {
      name: 'authentik',
      enabled: process.env.AUTHENTIK_CLIENT_ID && process.env.AUTHENTIK_CLIENT_SECRET,
      config: {
        clientID: process.env.AUTHENTIK_CLIENT_ID,
        clientSecret: process.env.AUTHENTIK_CLIENT_SECRET,
        issuer: process.env.AUTHENTIK_ISSUER,
        authorizationURL: process.env.AUTHENTIK_AUTHORIZATION_URL,
        tokenURL: process.env.AUTHENTIK_TOKEN_URL,
        userInfoURL: process.env.AUTHENTIK_USERINFO_URL,
        callbackURL: process.env.AUTHENTIK_CALLBACK_URL || '/api/auth/oidc/authentik/callback',
        scope: ['openid', 'profile', 'email']
      }
    },
    {
      name: 'authelia',
      enabled: process.env.AUTHELIA_CLIENT_ID && process.env.AUTHELIA_CLIENT_SECRET,
      config: {
        clientID: process.env.AUTHELIA_CLIENT_ID,
        clientSecret: process.env.AUTHELIA_CLIENT_SECRET,
        issuer: process.env.AUTHELIA_ISSUER,
        authorizationURL: process.env.AUTHELIA_AUTHORIZATION_URL,
        tokenURL: process.env.AUTHELIA_TOKEN_URL,
        userInfoURL: process.env.AUTHELIA_USERINFO_URL,
        callbackURL: process.env.AUTHELIA_CALLBACK_URL || '/api/auth/oidc/authelia/callback',
        scope: ['openid', 'profile', 'email']
      }
    },
    {
      name: 'generic',
      enabled: process.env.OIDC_CLIENT_ID && process.env.OIDC_CLIENT_SECRET && process.env.OIDC_ISSUER,
      config: {
        clientID: process.env.OIDC_CLIENT_ID,
        clientSecret: process.env.OIDC_CLIENT_SECRET,
        issuer: process.env.OIDC_ISSUER,
        authorizationURL: process.env.OIDC_AUTHORIZATION_URL,
        tokenURL: process.env.OIDC_TOKEN_URL,
        userInfoURL: process.env.OIDC_USERINFO_URL,
        callbackURL: process.env.OIDC_CALLBACK_URL || '/api/auth/oidc/generic/callback',
        scope: ['openid', 'profile', 'email']
      }
    }
  ]

  oidcProviders.forEach(provider => {
    if (provider.enabled) {
      passport.use(provider.name, new OIDCStrategy({
        clientID: provider.config.clientID,
        clientSecret: provider.config.clientSecret,
        issuer: provider.config.issuer,
        authorizationURL: provider.config.authorizationURL,
        tokenURL: provider.config.tokenURL,
        userInfoURL: provider.config.userInfoURL,
        callbackURL: provider.config.callbackURL,
        scope: provider.config.scope,
        state: true
      },
      async (issuer, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value || profile.email
          const displayName = profile.displayName || profile.display_name || profile.preferred_username || email.split('@')[0]
          const avatarUrl = profile.picture || profile.photos?.[0]?.value
          
          const user = await findOrCreateOAuthUser(
            provider.name,
            profile.sub || profile.id,
            email,
            displayName,
            avatarUrl
          )
          done(null, user)
        } catch (error) {
          done(error, null)
        }
      }))
    }
  })
}

const handleOAuthCallback = (req, res, user) => {
  if (!user) {
    return res.redirect('/login?error=oauth_failed')
  }

  const token = generateToken(user.id)

  if (process.env.FRONTEND_URL) {
    return res.redirect(`${process.env.FRONTEND_URL}/oauth/callback?token=${token}`)
  }

  return res.json({
    user: {
      id: user.id,
      displayName: user.displayName,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl
    },
    token
  })
}

module.exports = {
  configurePassport,
  handleOAuthCallback
}
