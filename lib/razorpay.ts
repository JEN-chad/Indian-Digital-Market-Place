import Razorpay from "razorpay";

let razorpayInstance: Razorpay | null = null;

export function getRazorpay(): Razorpay {
  if (!razorpayInstance) {
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.warn("Razorpay credentials are missing. Payment triggers will fail.");
      // Create a mock/stub instance or throw on actual call
      razorpayInstance = new Razorpay({
        key_id: keyId || "rzp_test_mock",
        key_secret: keySecret || "mock_secret",
      });
    } else {
      razorpayInstance = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
    }
  }
  return razorpayInstance;
}
export { Razorpay };
