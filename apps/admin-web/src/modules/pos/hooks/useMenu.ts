import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesApi } from "../api/categories.api";
import { menuItemsApi } from "../api/menuItems.api";

export const useMenu = () => {
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: ["pos-categories"],
    queryFn: categoriesApi.getCategories
  });

  const menuItemsQuery = useQuery({
    queryKey: ["pos-menu-items"],
    queryFn: menuItemsApi.getMenuItems
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
