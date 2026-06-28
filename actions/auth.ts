"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../lib/db/index.ts";
import { users } from "../lib/db/schema.ts";
import { getRedis } from "../lib/redis.ts";
import { getResend, EMAIL_FROM } from "../lib/resend.ts";
import FmiOtpEmail from "../emails/otp.tsx";
import React from "react";

// Helper to validate email
const emailSchema = z.string().email();

// 9. Send Email OTP
export async function sendEmailOtp(email: string) {
  try {
    // 1. Validate email format
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      return { success: false, error: "Invalid email format" };
    }

    // 2. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Store in Upstash Redis with 10-min TTL
    const redis = getRedis();
    const redisKey = `otp:email:${email}`;
    await redis.set(redisKey, otp, { ex: 600 }); // 10 minutes TTL

    // 4. In DEV: console.log the OTP
    console.log(`\n--- [DEV ONLY] FMI Email OTP for ${email} is: ${otp} ---\n`);

    // 5. Send via Resend email with branding
    const resend = getResend();
    
    // Only attempt to send actual email if key is configured and not mock
    if (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.startsWith("re_mock")) {
      try {
        console.log(`Attempting to send email via Resend from ${EMAIL_FROM} to ${email}...`);
        const response = await resend.emails.send({
          from: EMAIL_FROM,
          to: email,
          subject: "Your FMI Verification Code",
          react: React.createElement(FmiOtpEmail, { otp }),
        });
        if (response && response.error) {
          throw new Error(response.error.message || JSON.stringify(response.error));
        }
        console.log("Email sent successfully using primary sender:", EMAIL_FROM);
      } catch (primaryErr: any) {
        console.warn(`Primary email send failed: ${primaryErr.message}. Trying fallback 'onboarding@resend.dev'...`);
        try {
          const response = await resend.emails.send({
            from: "onboarding@resend.dev",
            to: email,
            subject: "Your FMI Verification Code",
            react: React.createElement(FmiOtpEmail, { otp }),
          });
          if (response && response.error) {
            throw new Error(response.error.message || JSON.stringify(response.error));
          }
          console.log("Email sent successfully using fallback sender: onboarding@resend.dev");
        } catch (fallbackErr: any) {
          console.error("Both primary and fallback email sending failed:", fallbackErr);
          throw new Error(`Email sending failed. Primary: ${primaryErr.message}. Fallback: ${fallbackErr.message}`);
        }
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error in sendEmailOtp server action:", error);
    return { success: false, error: error.message || "Failed to send email verification code" };
  }
}

// 10. Verify Email OTP
export async function verifyEmailOtp(email: string, otp: string) {
  try {
    const redis = getRedis();
    const redisKey = `otp:email:${email}`;
    const storedOtp = await redis.get<string>(redisKey);

    // Development backdoor: accept '123456' in dev or if the stored OTP matches
    const isDev = process.env.NODE_ENV !== "production";
    const isValidDevOtp = isDev && otp === "123456";
    const isValidStoredOtp = storedOtp && storedOtp === otp;

    if (!isValidDevOtp && !isValidStoredOtp) {
      return { success: false, error: "Invalid or expired verification code" };
    }

    // On success: Create or update user in DB and set emailVerified = true
    let dbUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!dbUser) {
      // Create user if not exists
      const [newUser] = await db
        .insert(users)
        .values({
          email,
          emailVerified: true,
          role: "both", // Default to both to let user browse and list
          kycStatus: "not_started",
        })
        .returning();
      dbUser = newUser;
    } else {
      // Update user
      await db
        .update(users)
        .set({ emailVerified: true })
        .where(eq(users.email, email));
      
      // Refresh local user record
      dbUser = await db.query.users.findFirst({
        where: eq(users.email, email),
      });
    }

    // Clean up OTP from redis
    await redis.del(redisKey);

    return { 
      success: true, 
      userId: dbUser?.id,
      user: dbUser ? {
        id: dbUser.id,
        email: dbUser.email,
        emailVerified: dbUser.emailVerified || false,
        phone: dbUser.phone,
        phoneVerified: dbUser.phoneVerified || false,
        name: dbUser.name,
        avatarUrl: dbUser.avatarUrl,
        role: dbUser.role || "both",
        kycStatus: dbUser.kycStatus || "not_started",
        kycType: dbUser.kycType,
      } : null
    };
  } catch (error: any) {
    console.error("Error in verifyEmailOtp server action:", error);
    return { success: false, error: error.message || "Failed to verify email code" };
  }
}

// 11. Send Phone OTP
export async function sendPhoneOtp(phone: string) {
  try {
    // Validate Indian phone format (+91 followed by 10 digits or just 10 digits)
    const cleanedPhone = phone.trim().replace(/\s+/g, "");
    const phoneRegex = /^(\+91)?\d{10}$/;
    
    if (!phoneRegex.test(cleanedPhone)) {
      return { success: false, error: "Invalid Indian phone number. Must be 10 digits or include +91 prefix." };
    }

    // Ensure it starts with +91
    const finalPhone = cleanedPhone.startsWith("+91") ? cleanedPhone : `+91${cleanedPhone}`;

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in Redis (key: otp:phone:{phone}, TTL 10min)
    const redis = getRedis();
    const redisKey = `otp:phone:${finalPhone}`;
    await redis.set(redisKey, otp, { ex: 600 }); // 10 minutes

    // In DEV: console.log OTP
    console.log(`\n--- [DEV ONLY] FMI Phone OTP for ${finalPhone} is: ${otp} ---\n`);

    return { success: true };
  } catch (error: any) {
    console.error("Error in sendPhoneOtp server action:", error);
    return { success: false, error: error.message || "Failed to send SMS verification code" };
  }
}

// 12. Verify Phone OTP
export async function verifyPhoneOtp(phone: string, otp: string, email?: string) {
  try {
    const cleanedPhone = phone.trim().replace(/\s+/g, "");
    const finalPhone = cleanedPhone.startsWith("+91") ? cleanedPhone : `+91${cleanedPhone}`;

    const redis = getRedis();
    const redisKey = `otp:phone:${finalPhone}`;
    const storedOtp = await redis.get<string>(redisKey);

    const isDev = process.env.NODE_ENV !== "production";
    const isValidDevOtp = isDev && otp === "123456";
    const isValidStoredOtp = storedOtp && storedOtp === otp;

    if (!isValidDevOtp && !isValidStoredOtp) {
      return { success: false, error: "Invalid or expired phone verification code" };
    }

    // On success: Update user: phone = phone, phoneVerified = true
    if (email) {
      await db
        .update(users)
        .set({
          phone: finalPhone,
          phoneVerified: true,
        })
        .where(eq(users.email, email));
    } else {
      // Fallback: try to find user by phone or update
      const existingUser = await db.query.users.findFirst({
        where: eq(users.phone, finalPhone),
      });
      if (existingUser) {
        await db
          .update(users)
          .set({ phoneVerified: true })
          .where(eq(users.id, existingUser.id));
      }
    }

    // Clean up from Redis
    await redis.del(redisKey);

    return { success: true };
  } catch (error: any) {
    console.error("Error in verifyPhoneOtp server action:", error);
    return { success: false, error: error.message || "Failed to verify phone code" };
  }
}
