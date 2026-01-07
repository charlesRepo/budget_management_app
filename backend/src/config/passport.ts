import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import prisma from './prisma';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback';

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile: Profile, done) => {
      try {
        // Extract user info from Google profile
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName;
        const googleId = profile.id;

        if (!email) {
          return done(new Error('No email found in Google profile'), undefined);
        }

        // Check if email is authorized (if AUTHORIZED_EMAILS is set)
        const authorizedEmailsEnv = process.env.AUTHORIZED_EMAILS;
        if (authorizedEmailsEnv) {
          const authorizedEmails = authorizedEmailsEnv.split(',').map(e => e.trim().toLowerCase());
          if (!authorizedEmails.includes(email.toLowerCase())) {
            return done(new Error('Email address not authorized to access this application'), undefined);
          }
        }

        // Find or create user in database
        let user = await prisma.user.findUnique({
          where: { googleId },
        });

        if (!user) {
          // Create new user
          user = await prisma.user.create({
            data: {
              email,
              name,
              googleId,
            },
          });

          // Create default settings for new user
          await prisma.settings.create({
            data: {
              userId: user.id,
              splitRatioPerson1: 60,
              splitRatioPerson2: 40,
              person1Name: 'Person 1',
              person2Name: 'Person 2',
              authorizedEmails: [email],
            },
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
