export const ClerkProvider = ({ children }: any) => <>{children}</>;

export const useAuth = () => ({
  isLoaded: true,
  userId: 'user_mock123',
  sessionId: 'sess_mock123',
  getToken: async () => 'mock-jwt-token',
  signOut: () => console.log('Mock sign out'),
});

export const useUser = () => ({
  isLoaded: true,
  isSignedIn: true,
  user: {
    id: 'user_mock123',
    fullName: 'Demo Student',
    primaryEmailAddress: { emailAddress: 'student@example.com' },
    publicMetadata: { role: 'student' },
  }
});

export const UserButton = () => (
  <div className="w-8 h-8 rounded-full bg-accent-primary text-white flex items-center justify-center font-bold text-sm cursor-pointer">
    DS
  </div>
);

export const UserProfile = () => (
  <div className="p-8 bg-bg-elevated border border-border-default rounded-xl">
    <h2 className="text-xl font-bold mb-4">Mock User Profile</h2>
    <p className="text-text-secondary">Clerk is running in mock mode. Add your VITE_CLERK_PUBLISHABLE_KEY to .env to enable real authentication.</p>
  </div>
);

export const SignIn = () => <div>Mock Sign In</div>;
export const SignUp = () => <div>Mock Sign Up</div>;
