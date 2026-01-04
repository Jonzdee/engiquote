import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, sendEmailVerification } from "firebase/auth";
import { toast } from "react-toastify";

/**
 * VerificationBanner.jsx
 * - Place this at the top of your Dashboard/layout so signed-in unverified users see it.
 * - Shows Resend and Dismiss actions.
 */

function VerificationBanner() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        const key = `dismiss_verif_${u.uid}`;
        setDismissed(Boolean(localStorage.getItem(key)));
      } else {
        setDismissed(false);
      }
    });
    return () => unsub();
  }, []);

  if (!user || user.emailVerified || dismissed) return null;

  const handleResend = async () => {
    setLoading(true);
    try {
      await sendEmailVerification(user);
      toast.success("Verification email resent. Check inbox and spam.");
    } catch (err) {
      console.error("Resend verification error:", err);
      toast.error("Could not resend verification. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    if (!user) return;
    localStorage.setItem(`dismiss_verif_${user.uid}`, "1");
    setDismissed(true);
  };

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded">
      <div className="flex items-start justify-between">
        <div>
          <strong className="block">Email not verified</strong>
          <p className="text-sm">
            Please verify your email to unlock certain features. Check your
            inbox and spam folder.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleResend}
            disabled={loading}
            className="px-3 py-1 bg-black text-white rounded"
          >
            {loading ? "Sending…" : "Resend"}
          </button>

          <button onClick={handleDismiss} className="px-3 py-1 border rounded">
            Remind me later
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerificationBanner;
