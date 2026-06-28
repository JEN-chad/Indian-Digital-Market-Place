import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Mail, AlertCircle, ArrowRight } from "lucide-react";
import { sendEmailOtp } from "../../actions/auth.ts";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type LoginSchemaInput = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess: (email: string) => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchemaInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: LoginSchemaInput) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const result = await sendEmailOtp(data.email);
      if (result.success) {
        onSuccess(data.email);
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
            Sending OTP...
          </>
        ) : (
          <>
            Send OTP
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}

export default LoginForm;
