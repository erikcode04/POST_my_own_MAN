import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import { db } from './firebase';

export interface AppUser {
    id: string;
    email: string;
    name: string;
    avatar: string;
}

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            callbackURL: '/api/auth/google/callback',
        },
        async (_accessToken, _refreshToken, profile: Profile, done) => {
            try {
                const email = profile.emails?.[0]?.value ?? '';
                const user: AppUser = {
                    id: profile.id,
                    email,
                    name: profile.displayName,
                    avatar: profile.photos?.[0]?.value ?? '',
                };

                // Upsert user document in Firestore (Admin SDK syntax)
                const ref = db.collection('users').doc(profile.id);
                const snap = await ref.get();
                if (!snap.exists) {
                    await ref.set({ ...user, createdAt: new Date().toISOString() });
                }

                return done(null, user);
            } catch (err) {
                return done(err as Error);
            }
        }
    )
);

// Not using sessions — JWT only
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user as AppUser));

export default passport;
