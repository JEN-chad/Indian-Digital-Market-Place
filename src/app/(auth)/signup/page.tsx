import React from "react";
import SignupForm from "../../../components/auth/signup-form.tsx";

interface SignupPageProps {
  onSuccess: (email: string, fullName: string) => void;
  onNavigateToLogin: () => void;
}

export function SignupPage({ onSuccess, onNavigateToLogin }: SignupPageProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="font-serif italic font-extrabold text-3xl tracking-tight">Create Account</h1>
        <p className="text-xs text-gray-500">
          Join India's premier marketplace for buying and selling digital businesses.
        </p>
      </div>

      {/* Signup Form */}
      <SignupForm onSuccess={onSuccess} />

      {/* Login Redirect */}
      <p className="text-xs text-center text-gray-500 pt-2">
        Already have an FMI account?{" "}
        <button
          onClick={onNavigateToLogin}
          className="text-brand-green font-bold hover:underline"
        >
          Sign In
        </button>
      </p>
    </div>
  );
}

export default SignupPage;
