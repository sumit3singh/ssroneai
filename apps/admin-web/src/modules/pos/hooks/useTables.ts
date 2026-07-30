import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tablesApi } from "../api/tables.api";
import { POSTable } from "../types/table";

export const useTables = () => {
  const queryClient = useQueryClient();

  const tablesQuery = useQuery({
    queryKey: ["pos-tables"],
    queryFn: tablesApi.getTables
  });

  const createTableMutation = useMutation({
    mutationFn: ({ table_number, capacity, section }: { table_number: string; capacity: number; section: string }) =>
      tablesApi.createTable(table_number, capacity, section),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-tables"] });
    }
  });

  const updateTableStatusMutation = useMutation({
    mutationFn: ({ tableId, status, guests, waiter }: { tableId: string | number; status: POSTable["status"]; guests: number; waiter: string }) =>
      tablesApi.updateTableStatus(tableId, status, guests, waiter),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-tables"] });
    }
  });

  return {
    tables: tablesQuery.data || [],
    isLoading: tablesQuery.isLoading,
    createTable: createTableMutation.mutateAsync,
    updateTableStatus: updateTableStatusMutation.mutateAsync,
    refetchTables: tablesQuery.refetch
  };
};
