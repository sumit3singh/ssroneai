import { describe, it, expect, beforeEach } from "vitest";
import { useCartStore } from "../stores/cartStore";
import type { MenuItem } from "../data/mockMenu";

const mockItemA: MenuItem = {
  id: "item_1",
  name: "Adrak Chai",
  description: "Freshly brewed ginger tea",
  price: 50,
  basePrice: 50,
  categoryId: "beverages",
  isVeg: true,
  isAvailable: true,
  isPopular: true,
  imageUrl: "https://example.com/chai.jpg",
  tags: [],
};

const mockItemB: MenuItem = {
  id: "item_2",
  name: "Paneer Grilled Sandwich",
  description: "Spiced paneer slice grilled sandwich",
  price: 150,
  basePrice: 150,
  categoryId: "snacks",
  isVeg: true,
  isAvailable: true,
  isPopular: false,
  imageUrl: "https://example.com/sandwich.jpg",
  tags: [],
  variantGroups: [
    {
      id: "size_grp",
      name: "Size",
      isRequired: true,
      maxSelection: 1,
      options: [
        { id: "reg", name: "Regular", price: 150, sortOrder: 1 },
        { id: "large", name: "Large", price: 220, sortOrder: 2 },
      ],
    },
  ],
  addonGroups: [
    {
      id: "cheese_grp",
      name: "Cheese",
      isRequired: false,
      maxSelection: 2,
      options: [
        { id: "extra_cheese", name: "Extra Cheese", price: 40, isAvailable: true },
      ],
    },
  ],
};

describe("CartStore - Data Integrity & Isolation", () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
    useCartStore.getState().setContext("baithak-cafe", "101");
  });

  it("should add a basic item to cart and calculate correct total", () => {
    const store = useCartStore.getState();
    store.addItem(mockItemA);

    const updated = useCartStore.getState();
    expect(updated.items.length).toBe(1);
    expect(updated.items[0].quantity).toBe(1);
    expect(updated.getTotal()).toBe(50);
    expect(updated.getItemCount()).toBe(1);
  });

  it("should increment quantity when adding identical basic item", () => {
    const store = useCartStore.getState();
    store.addItem(mockItemA);
    store.addItem(mockItemA);

    const updated = useCartStore.getState();
    expect(updated.items.length).toBe(1);
    expect(updated.items[0].quantity).toBe(2);
    expect(updated.getTotal()).toBe(100);
    expect(updated.getItemCount()).toBe(2);
  });

  it("should calculate correct variant and addon pricing", () => {
    const store = useCartStore.getState();
    const largeVariant = {
      groupId: "size_grp",
      groupName: "Size",
      option: mockItemB.variantGroups![0].options[1], // Large (220)
    };
    const extraCheese = {
      groupId: "cheese_grp",
      groupName: "Cheese",
      option: mockItemB.addonGroups![0].options[0], // 40
    };

    store.addItem(mockItemB, [largeVariant], [extraCheese]);

    const updated = useCartStore.getState();
    expect(updated.items.length).toBe(1);
    // Base large (220) + cheese (40) = 260
    expect(updated.getTotal()).toBe(260);
  });

  it("should remove item when quantity drops to 0", () => {
    const store = useCartStore.getState();
    store.addItem(mockItemA);

    const cartId = useCartStore.getState().items[0].id;
    useCartStore.getState().updateQuantity(cartId, 0);

    expect(useCartStore.getState().items.length).toBe(0);
    expect(useCartStore.getState().getTotal()).toBe(0);
  });

  it("should clear cart when tenant context switches to enforce multi-tenant isolation", () => {
    const store = useCartStore.getState();
    store.setContext("tenant-a", "branch-1");
    store.addItem(mockItemA);
    expect(useCartStore.getState().items.length).toBe(1);

    // Context changes to tenant-b
    store.setContext("tenant-b", "branch-2");
    const isolated = useCartStore.getState();
    expect(isolated.tenantSlug).toBe("tenant-b");
    expect(isolated.branchCode).toBe("branch-2");
    expect(isolated.items.length).toBe(0); // Cart is cleared for new tenant
  });
});
