"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import { fetchCart } from "../store/cart/cartSlice";
import { selectIsCartEnabled } from "../store/blueprint";

export default function GetCart() {
  const isCartEnabled = useSelector((state: RootState) => selectIsCartEnabled(state));
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (!isCartEnabled) return;
    dispatch(fetchCart());
  }, [isAuthenticated, isCartEnabled, dispatch]);

  return null;
}
