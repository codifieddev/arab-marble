"use client";

import { fetchMenusThunk } from "@/lib/store/menus/menusThunk";
import { RootState } from "@/lib/store/store";
import { useAppDispatch } from "@/lib/store/hooks";
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";

const GetAllMenus = () => {
  const dispatch = useAppDispatch();
  const isApi = useRef(false);
  const { isFetchedMenus } = useSelector((state: RootState) => state.menus);

  useEffect(() => {
    if (!isFetchedMenus && !isApi.current) {
      isApi.current = true;
      dispatch(fetchMenusThunk());
    }
  }, [dispatch, isFetchedMenus]);

  return null;
};
export default GetAllMenus;
