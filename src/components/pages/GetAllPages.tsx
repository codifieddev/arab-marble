"use client";

import { useAppDispatch } from "@/lib/store/hooks";
import {
  fetchFastApiPagesThunk,
  fetchAllPages,
} from "@/lib/store/pages/pageThunk";
import { RootState } from "@/lib/store/store";

import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";

const GetAllPages = () => {
  const dispatch = useAppDispatch();
  const { isAllPageFetched } = useSelector((state: RootState) => state.pages);

  const isApi = useRef<boolean>(false);
  useEffect(() => {
    if (!isAllPageFetched && !isApi.current) {
      isApi.current = true;
      dispatch(fetchAllPages());
    }
  }, [isAllPageFetched]);
  return null;
};

export default GetAllPages;
