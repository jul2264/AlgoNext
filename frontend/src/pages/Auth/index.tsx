import { SignIn, SignUp } from '@clerk/clerk-react';

export function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary p-4">
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
    </div>
  );
}

export function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary p-4">
      <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
    </div>
  );
}
