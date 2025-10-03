import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { authService } from "@/services";
import { LoginRequestDto, GoogleUserData } from "@/types/auth";

// Google Profile interface
interface GoogleProfile {
  sub: string;
  name: string;
  email: string;
  picture?: string;
  email_verified?: boolean;
}

export const authOptions: NextAuthOptions = {
  providers: [
    // Credentials Provider for username/password login
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          const loginData: LoginRequestDto = {
            username: credentials.username,
            password: credentials.password
          };

          const response = await authService.login(loginData);
          
          if (response.status === 200 && response.data) {
            const { accessToken, refreshToken, userInfo } = response.data;
            
            return {
              id: userInfo.id,
              email: userInfo.username,
              name: userInfo.fullName,
              username: userInfo.username,
              fullName: userInfo.fullName,
              phoneNumber: userInfo.phoneNumber,
              isActive: Boolean(userInfo.isActive), // Convert to boolean
              roles: userInfo.roles,
              accessToken,
              refreshToken
            };
          }
          
          return null;
        } catch (error) {
          console.error("Login error:", error);
          return null;
        }
      }
    }),

    // Google Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile",
          response_type: "code",
        },
      },
    })
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle Google sign in
      if (account?.provider === "google" && profile?.email) {
        console.log('Google SignIn - Account:', {
          provider: account.provider,
          type: account.type,
          hasIdToken: !!account.id_token,
          hasAccessToken: !!account.access_token
        });

        const googleProfile = profile as GoogleProfile;
        console.log('Google SignIn - Profile:', {
          email: googleProfile?.email,
          name: googleProfile?.name,
          picture: googleProfile?.picture,
          sub: googleProfile?.sub,
          data: account.id_token || ''
        });
        
        try {
          // Backend expects idToken but actually wants accessToken
          const googleUser: GoogleUserData = {
            idToken: account.id_token || ''
          };

          // Call backend API to register/login Google user
          const response = await authService.googleAuth(googleUser);
          
          if (response.status === 200 && response.data) {
            const { accessToken, refreshToken, userInfo } = response.data;
            
            // Store tokens and user info in user object
            user.id = userInfo.id;
            user.username = userInfo.username;
            user.fullName = userInfo.fullName;
            user.phoneNumber = userInfo.phoneNumber;
            user.isActive = Boolean(userInfo.isActive);
            user.roles = userInfo.roles;
            user.accessToken = accessToken;
            user.refreshToken = refreshToken;
            
            return true;
          }
        } catch (error) {
          console.error("Google auth error:", error);
          return false;
        }
      }
      
      return true;
    },

    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.id = user.id;
        token.username = user.username;
        token.fullName = user.fullName;
        token.phoneNumber = user.phoneNumber;
        token.isActive = user.isActive;
        token.roles = user.roles;
      }

      return token;
    },

    async session({ session, token }) {
      // Send properties to the client
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.user.id = token.id || "";
      session.user.username = token.username;
      session.user.fullName = token.fullName;
      session.user.phoneNumber = token.phoneNumber;
      session.user.isActive = token.isActive;
      session.user.roles = token.roles;

      return session;
    },

    async redirect({ url, baseUrl }) {
      // Redirect to /home after successful Google login
      if (url === baseUrl || url === `${baseUrl}/` || url === `${baseUrl}/login`) {
        return `${baseUrl}/home`;
      }
      
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      
      return baseUrl;
    }
  },

  pages: {
    signIn: "/login",
    error: "/login"
  },

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },

  secret: process.env.NEXTAUTH_SECRET,
};