import React from 'react'
import { useSelector } from 'react-redux'

import { useEffect } from 'react'
import { fetchCommentsThunk } from '@/lib/store/comments/commentThunk'
import { useRef } from 'react'
import { RootState } from '@/lib/store/store'
import { useAppDispatch } from '@/lib/store/hooks'

const GetAllComments = () => {
    const {isFetchedComments} = useSelector((state: RootState) => state.comments);
    const dispatch = useAppDispatch()
    const isApi = useRef<boolean>(false)
    useEffect(() => {
        if (!isFetchedComments && !isApi.current) {
            isApi.current = true;
            dispatch(fetchCommentsThunk())
                .unwrap()
                .catch((err) => {
                    console.warn("[GetAllComments] Comments fetch skipped or failed:", err);
                });
        } else if (isFetchedComments) {
            isApi.current = false;
        }
    }, [isFetchedComments, dispatch])
    return (
        null
    )
}

export default GetAllComments
