import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // ---- Admin (from .env) ----
        if (
          credentials?.email    === process.env.ADMIN_EMAIL &&
          credentials?.password === process.env.ADMIN_PASSWORD
        ) {
          return { id: 'admin', name: 'Admin', email: credentials.email, role: 'admin', avatar: '' };
        }

        // ---- Regular user (from PostgreSQL) ----
        try {
          const user = await prisma.user.findUnique({ where: { email: credentials?.email } });
          if (!user) return null;
          const valid = await bcrypt.compare(credentials?.password, user.password);
          if (!valid) return null;
          return { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, phone: user.phone };
        } catch {
          return null;
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          const existing = await prisma.user.findUnique({ where: { email: user.email } });
          if (!existing) {
            const newUser = await prisma.user.create({
              data: {
                name:     user.name,
                email:    user.email,
                password: await bcrypt.hash(`google_${user.email}`, 10),
                avatar:   user.image ?? '',
                role:     'user',
              },
            });
            user.id = newUser.id; user.role = newUser.role;
            user.avatar = newUser.avatar; user.phone = newUser.phone ?? '';
          } else {
            user.id = existing.id; user.role = existing.role;
            user.avatar = existing.avatar ?? user.image ?? ''; user.phone = existing.phone ?? '';
          }
        } catch { return false; }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id; token.role = user.role ?? 'user';
        token.avatar = user.avatar ?? user.image ?? ''; token.phone = user.phone ?? '';
      }
      if (trigger === 'update' && session) {
        token.name   = session.name   ?? token.name;
        token.avatar = session.avatar ?? token.avatar;
        token.phone  = session.phone  ?? token.phone;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id     = token.id;
      session.user.role   = token.role;
      session.user.avatar = token.avatar;
      session.user.phone  = token.phone;
      return session;
    },
  },
};
