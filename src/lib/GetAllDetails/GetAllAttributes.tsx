"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { fetchAttributes } from "../store/attributes/attributeSlices";

export default function GetAllAttributes() {
  const { loading, hasAttributeFetched } = useSelector(
    (state: RootState) => state.adminAttributes,
  );

  const dispatch = useDispatch<AppDispatch>();

  const { user: user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // if (!user) return;

    if (!hasAttributeFetched && !loading) {
      dispatch(fetchAttributes());
    }
  }, [user, hasAttributeFetched, loading]);

  return null;
}
