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
          
          console.log('Auth Response:', JSON.stringify(response, null, 2));
          console.log('User Info:', JSON.stringify(response.data?.userInfo, null, 2));
          console.log('Company Info:', JSON.stringify(response.data?.userInfo?.company, null, 2));
          
          if (response.status === 200 && response.data) {
            const { accessToken, refreshToken, userInfo } = response.data;
            
            // Check if user has MANAGER role
            const hasManagerRole = userInfo.roles.includes('MANAGER');
            
            if (!hasManagerRole) {
              // User doesn't have MANAGER role, deny access
              console.log('Access denied: User does not have MANAGER role', userInfo.roles);
              return null;
            }
            
            console.log('Creating user object with company:', userInfo.company);
            
            const userObject = {
              id: userInfo.id,
              email: userInfo.username,
              name: userInfo.fullName,
              username: userInfo.username,
              fullName: userInfo.fullName,
              phoneNumber: userInfo.phoneNumber,
              isActive: Boolean(userInfo.isActive),
              roles: userInfo.roles,
              accessToken,
              refreshToken,
              company: userInfo.company ? {
                companyId: userInfo.company.companyId,
                companyName: userInfo.company.companyName,
                companyCode: userInfo.company.companyCode,
                contactEmail: userInfo.company.contactEmail,
                contactPhone: userInfo.company.contactPhone,
                street: userInfo.company.street,
                commune: userInfo.company.commune,
                district: userInfo.company.district,
                city: userInfo.company.city,
                fullAddress: userInfo.company.fullAddress
              } : undefined
            };
            
            console.log('Final user object:', JSON.stringify(userObject, null, 2));
            
            return userObject;
          }
          
          return null;
        } catch {
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
            user.company = userInfo.company; // Add company info for MANAGER
            
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
        console.log('JWT Callback - User object:', JSON.stringify(user, null, 2));
        console.log('JWT Callback - User company:', user.company);
        
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.id = user.id;
        token.username = user.username;
        token.fullName = user.fullName;
        token.phoneNumber = user.phoneNumber;
        token.dateOfBirth = user.dateOfBirth;
        token.gender = user.gender;
        token.isActive = user.isActive;
        token.roles = user.roles;
        token.company = user.company;
        
        console.log('JWT Callback - Token after assignment:', JSON.stringify(token, null, 2));
      }

      return token;
    },

    async session({ session, token }) {
      console.log('Session Callback - Token:', JSON.stringify(token, null, 2));
      console.log('Session Callback - Token company:', token.company);
      
      // Send properties to the client
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.user.id = token.id || "";
      session.user.username = token.username;
      session.user.fullName = token.fullName;
      session.user.phoneNumber = token.phoneNumber;
      session.user.dateOfBirth = token.dateOfBirth;
      session.user.gender = token.gender;
      session.user.isActive = token.isActive;
      session.user.roles = token.roles;
      session.user.company = token.company;
      
      console.log('Session Callback - Session after assignment:', JSON.stringify(session, null, 2));

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
    signIn: "/",
  },

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },

  secret: process.env.NEXTAUTH_SECRET,
};