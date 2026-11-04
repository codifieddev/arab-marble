"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { AppDispatch } from "../store/store";
import { fetchCart } from "../store/cart/cartSlice";

export default function GetCart() {
  const { loading } = useSelector((state: RootState) => state.cart);

  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchCart());
  }, [isAuthenticated]);

  return null;
}
