"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

export default function ToastListener() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const lastToastKey = useRef<string | null>(null);

  useEffect(() => {
    const toastType = searchParams.get("toast");
    const message = searchParams.get("message");

    if (toastType && message) {
      // Create a unique key for this toast to prevent duplicates
      const toastKey = `${toastType}-${message}`;
      
      if (lastToastKey.current !== toastKey) {
        lastToastKey.current = toastKey;
        const decodedMessage = decodeURIComponent(message);
        
        if (toastType === "success") {
          toast.success(decodedMessage, { duration: 4000 });
        } else if (toastType === "error") {
          toast.error(decodedMessage, { duration: 4000 });
        }
        
        // Remove query params from URL immediately
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.delete("toast");
        newSearchParams.delete("message");
        const newUrl = newSearchParams.toString()
          ? `${window.location.pathname}?${newSearchParams.toString()}`
          : window.location.pathname;
        router.replace(newUrl);
      }
    }
  }, [searchParams, router]);

  return null;
}
