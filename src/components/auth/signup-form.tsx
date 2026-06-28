import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Mail, User, AlertCircle, ArrowRight } from "lucide-react";
import { sendEmailOtp } from "../../actions/auth.ts";

const signupSchema = z.object({
  fullName: z.string().min(2, { message: "Full Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type SignupSchemaInput = z.infer<typeof signupSchema>;

interface SignupFormProps {
  onSuccess: (email: string, fullName: string) => void;
}

export function SignupForm({ onSuccess }: SignupFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupSchemaInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
    },
  });

  const onSubmit = async (data: SignupSchemaInput) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const result = await sendEmailOtp(data.email);
      if (result.success) {
        onSuccess(data.email, data.fullName);
      } else {
        setServerError(result.error || "Failed to send OTP. Please try again.");
      }
    } catch (err: any) {
      setServerError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 p-3 rounded-md text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Name Field */}
      <div className="space-y-1">
        <label htmlFor="fullName" className="block text-xs font-bold tracking-wider uppercase text-black/60">
          Full Name
        </label>
        <div className="relative">
          <User className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            id="fullName"
            type="text"
            disabled={isLoading}
            placeholder="e.g. Jenish Patel"
            {...register("fullName")}
            className={`w-full text-xs pl-9 pr-4 py-3 border bg-white focus:outline-none focus:ring-1 focus:ring-brand-green transition-all rounded-md ${
              errors.fullName ? "border-red-500 focus:border-red-500" : "border-black/10 focus:border-brand-green"
            }`}
          />
        </div>
        {errors.fullName && (
          <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.fullName.message}
          </p>
        )}
      </div>

      {/* Email Field */}
      <div className="space-y-1">
        <label htmlFor="email" className="block text-xs font-bold tracking-wider uppercase text-black/60">
          Email Address
        </label>
        <div className="relative">
          <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            id="email"
            type="email"
            disabled={isLoading}
            placeholder="e.g. jenish@fmi.in"
            {...register("email")}
            className={`w-full text-xs pl-9 pr-4 py-3 border bg-white focus:outline-none focus:ring-1 focus:ring-brand-green transition-all rounded-md ${
              errors.email ? "border-red-500 focus:border-red-500" : "border-black/10 focus:border-brand-green"
            }`}
          />
        </div>
        {errors.email && (
          <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.email.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-brand-green hover:bg-brand-green/95 text-white py-3 px-4 font-bold text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-sm rounded-md disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Creating Account...
          </>
        ) : (
          <>
            Create Account
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}

export default SignupForm;
