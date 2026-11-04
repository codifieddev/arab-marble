"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { AppDispatch } from "../store/store";
import { fetchProducts } from "../store/products/productsThunk";

export default function GetAllProducts() {
  const { allProducts, loading, error, hasFetched } = useSelector(
    (state: RootState) => state.products,
  );

  const dispatch = useDispatch<AppDispatch>();

  const { user: user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
 

    if (!hasFetched && !loading) {
      dispatch(fetchProducts());
    }
  }, [hasFetched, loading]);

  return null;
}
