"use client"
import { fetchProducts } from '@/lib/store/products/productsThunk';
import { AppDispatch, RootState } from '@/lib/store/store';
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';

const GetAllProducts = () => {
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
  return null
}

export default GetAllProducts