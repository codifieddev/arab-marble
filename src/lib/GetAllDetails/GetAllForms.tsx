"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { useAppSelector } from "../store/hooks";


export default function GetAllForms() {
  // const { loading, hasFormsFetched } = useAppSelector(
  //   (state: RootState) => state.adminForms,
  // );

  // const dispatch = useDispatch<AppDispatch>();

  // const { user: user } = useSelector((state: RootState) => state.auth);

  // useEffect(() => {
  //   if (!user) return;

  //   if (!hasFormsFetched && !loading) {
  //     dispatch(fetchForms());
  //     dispatch(fetchSubmissions({}));
  //   }
  // }, [user, hasFormsFetched, loading]);

  return null;
}
