import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@ssrone/auth";
import { categoriesApi } from "../api/categories.api";
import { menuItemsApi } from "../api/menuItems.api";

export const useMenu = () => {
  const queryClient = useQueryClient();
  const selectedBranch = useAuthStore((s) => s.selected_branch);
  const branchId = selectedBranch?.id;

  const categoriesQuery = useQuery({
    queryKey: ["pos-categories", branchId],
    queryFn: () => categoriesApi.getCategories(branchId)
  });

  const menuItemsQuery = useQuery({
    queryKey: ["pos-menu-items", branchId],
    queryFn: () => menuItemsApi.getMenuItems(branchId)
  });

  const createCategoryMutation = useMutation({
    mutationFn: ({ name, icon }: { name: string; icon: string }) =>
      categoriesApi.createCategory(name, icon),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-categories"] });
    }
  });

  const saveMenuItemMutation = useMutation({
    mutationFn: (itemData: any) =>
      itemData.id
        ? menuItemsApi.updateMenuItem(itemData.id, itemData)
        : menuItemsApi.createMenuItem(itemData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-menu-items"] });
    }
  });

  const deleteMenuItemMutation = useMutation({
    mutationFn: (id: number) => menuItemsApi.deleteMenuItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-menu-items"] });
    }
  });

  return {
    categories: categoriesQuery.data || [],
    menuItems: menuItemsQuery.data || [],
    isLoading: categoriesQuery.isLoading || menuItemsQuery.isLoading,
    createCategory: createCategoryMutation.mutateAsync,
    saveMenuItem: saveMenuItemMutation.mutateAsync,
    deleteMenuItem: deleteMenuItemMutation.mutateAsync,
    refetchMenu: () => {
      categoriesQuery.refetch();
      menuItemsQuery.refetch();
    }
  };
};
