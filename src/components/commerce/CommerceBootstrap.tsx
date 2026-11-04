"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { fetchCart, recoverCartAsync } from "@/lib/store/cart/cartSlice";
import { selectIsCartEnabled } from "@/lib/store/blueprint";

export default function CommerceBootstrap() {
  const dispatch = useAppDispatch();
  const isCartEnabled = useAppSelector(selectIsCartEnabled);
  const authIdentity = useAppSelector((state) => state.auth.user?.id || "guest");
  const previousIdentity = useRef<string | null>(null);
  const recoveryHandled = useRef(false);
  const recoveryInProgress = useRef(false);

  useEffect(() => {
    if (!isCartEnabled) return;
    if (recoveryHandled.current) return;
    recoveryHandled.current = true;
    const currentUrl = new URL(window.location.href);
    const recoveryToken = currentUrl.searchParams.get("recover_cart");
    if (!recoveryToken) return;
    recoveryInProgress.current = true;

    dispatch(recoverCartAsync(recoveryToken))
      .unwrap()
      .then(() => toast.success("Your saved cart has been restored."))
      .catch((error) => toast.error(String(error || "Unable to restore cart.")))
      .finally(() => {
        recoveryInProgress.current = false;
        currentUrl.searchParams.delete("recover_cart");
        window.history.replaceState({}, "", `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`);
      });
  }, [dispatch, isCartEnabled]);

  useEffect(() => {
    if (!isCartEnabled) return;
    if (previousIdentity.current === authIdentity) return;
    previousIdentity.current = authIdentity;
    if (recoveryInProgress.current) return;
    dispatch(fetchCart());
  }, [authIdentity, dispatch, isCartEnabled]);

  return null;
}
