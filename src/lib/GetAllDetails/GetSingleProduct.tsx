"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { AppDispatch } from "../store/store";
import { useParams } from "next/navigation";
import { fetchProductById } from "../store/products/productsThunk";

export default function GetSingleProduct() {
  const { id } = useParams<{ id: string }>();
  const { currentProduct } = useSelector(
    (state: RootState) => state.products,
  );

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchProductById(id));
  }, [id]);

  return null;
}
