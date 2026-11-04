"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { fetchCategories } from "../store/categories/categoriesSlices";

export default function GetAllCategories({
  type = "admin",
}: {
  type?: string;
}) {
  const { allCategories, loading, isFetched } = useSelector(
    (state: RootState) => state.adminCategories,
  );

  const dispatch = useDispatch<AppDispatch>();

  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // if (!user && type) return;

    if (!isFetched && !loading) {
      dispatch(fetchCategories());
    }
  }, [user, isFetched, loading]);

  return null;
}
