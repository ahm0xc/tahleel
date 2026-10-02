import { useEffect, useRef } from "react";

import {
  type QueryKey,
  type UseQueryOptions,
  useQuery,
} from "@tanstack/react-query";

type Callbacks<TData, TError> = {
  onSuccess?: (data: TData) => void;
  onError?: (error: TError) => void;
  onSettled?: (data: TData | undefined, error: TError | null) => void;
};

export function useQueryWithCallbacks<
  TData = unknown,
  TError = Error,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UseQueryOptions<TData, TError, TData, TQueryKey> &
    Callbacks<TData, TError>
) {
  const { onSuccess, onError, onSettled, ...queryOptions } = options;
  const query = useQuery<TData, TError, TData, TQueryKey>(queryOptions);

  const cb = useRef({ onSuccess, onError, onSettled });
  cb.current = { onSuccess, onError, onSettled };

  useEffect(() => {
    if (query.isSuccess) {
      cb.current.onSuccess?.(query.data);
      cb.current.onSettled?.(query.data, null);
    }
  }, [query.dataUpdatedAt]);

  useEffect(() => {
    if (query.isError) {
      cb.current.onError?.(query.error);
      cb.current.onSettled?.(undefined, query.error);
    }
  }, [query.errorUpdatedAt]);

  return query;
}
