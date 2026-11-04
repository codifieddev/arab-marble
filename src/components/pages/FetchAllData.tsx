"use client";
import React from "react";
import GetAllPages from "./GetAllPages";
import GetAllMenus from "../cms/menus/GetAllMenus";
import GetAllProducts from "@/lib/GetAllDetails/GetAllProducts";
import GetAllForms from "../forms/GetAllForms";
import GetAuthTokenFastApi from "../wesiteDetail/GetAuthTokenFastApi";
import UpdateCurrentPage from "./UpdateCurrentPage";
import GetAllAttributes from "@/lib/GetAllDetails/GetAllAttributes";
import GetAllCategories from "@/lib/GetAllDetails/GetAllCategories";
import GetCart from "@/lib/GetAllDetails/GetCart";
import GetUser from "@/lib/GetAllDetails/GetUser";

const FetchAllData = () => {
  return (
    <>
      {/* get all pages */}
      <GetAllPages />

      {/* get all menus */}
      <GetAllMenus />

      {/* get all products */}
      {/* <GetsAllProducts /> */}

      {/* get all forms */}
      <GetAllForms />

      {/* get auth token from fast api */}
      {/* <GetAuthTokenFastApi /> */}

      {/* update current page */}
      <UpdateCurrentPage />

      {/* get all attributes */}
      <GetAllAttributes />

      {/* get all categories */}
      <GetAllCategories />

      {/* get cart */}
      <GetCart />

      {/* get all user */}
      {/* <GetUser user={user} /> */}
    </>
  );
};

export default FetchAllData;
