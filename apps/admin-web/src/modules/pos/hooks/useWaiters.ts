import { useQuery } from "@tanstack/react-query";
import { waitersApi } from "../api/waiters.api";

export const useWaiters = () => {
  const waitersQuery = useQuery({
    queryKey: ["pos-waiters"],
    queryFn: waitersApi.getWaiters
  });

  return {
    waiters: waitersQuery.data || [],
    isLoading: waitersQuery.isLoading,
    refetchWaiters: waitersQuery.refetch
  };
};
