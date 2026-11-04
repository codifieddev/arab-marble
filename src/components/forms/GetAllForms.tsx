"use client";
import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { fetchAllForm } from "@/lib/store/forms/formsThunk";
import { useAppDispatch } from "@/lib/store/hooks";

const GetAllForms = () => {
  const dispatch = useAppDispatch();
  const isApi = useRef<boolean>(false);
  const { isFetchedForms } = useSelector((state: RootState) => state.forms);

  useEffect(() => {
    if (!isFetchedForms && !isApi.current) {
      dispatch(fetchAllForm());
      isApi.current = true;
    }
  }, [dispatch, isFetchedForms]);

  return null;
};

export default GetAllForms;
