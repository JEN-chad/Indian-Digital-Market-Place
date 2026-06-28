import React from "react";
import LoginForm from "../../../components/auth/login-form.tsx";
import { Chrome } from "lucide-react";

interface LoginPageProps {
  onSuccess: (email: string) => void;
  onNavigateToSignup: () => void;
}

export function LoginPage({ onSuccess, onNavigateToSignup }: LoginPageProps) {
  const handleGoogleLogin = () => {
    alert("Google OAuth is currently unconfigured. Primary login method is secure Email OTP.");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="font-serif italic font-extrabold text-3xl tracking-tight">Welcome Back</h1>
        <p className="text-xs text-gray-500">
          Enter your registered email to receive a secure login verification code.
        </p>
      </div>

      {/* Re-usable Login Form */}
      <LoginForm onSuccess={onSuccess} />

      <div className="relative flex py-2 items-center">
        <div className="flex-grow border-t border-black/5"></div>
        <span className="flex-shrink mx-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">OR</span>
        <div className="flex-grow border-t border-black/5"></div>
      </div>

      {/* Google OAuth Button */}
      <button
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-2 border border-black/10 hover:bg-black/5 py-3 rounded-md text-xs font-semibold tracking-wide transition-all"
      >
        <Chrome className="w-4 h-4 text-brand-green" />
        Continue with Google
      </button>

      {/* Register Redirect */}
      <p className="text-xs text-center text-gray-500 pt-2">
        Don't have an FMI account?{" "}
        <button
          onClick={onNavigateToSignup}
          className="text-brand-green font-bold hover:underline"
        >
          Create an Account
        </button>
      </p>
    </div>
  );
}

export default LoginPage;
