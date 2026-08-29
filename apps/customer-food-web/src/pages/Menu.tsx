import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu as MenuIcon, ShoppingBag, Home, Store, ChevronDown, MapPin } from "lucide-react";
import { fetchMenuItems, type BranchInfo } from "@ssrone/api-client";
import { menuItems as defaultMockItems } from "@/data/mockMenu";
import { useCartStore } from "@/stores/cartStore";
import { useI18n } from "@/stores/i18nStore";
import CategorySidebar from "@/components/CategorySidebar";
import MenuItemCard from "@/components/MenuItemCard";
import ItemDetailModal from "@/components/ItemDetailModal";
import CartSheet from "@/components/CartSheet";
import LanguageToggle from "@/components/LanguageToggle";
import { FoodParticleLayer, useFoodParticles } from "@/components/FoodParticles";
import { useTenantBranchContext } from "@/hooks/useTenantBranchContext";
import type { MenuItem } from "@/data/mockMenu";
import type { CartItemVariant, CartItemAddon } from "@/stores/cartStore";
import BranchSwitchDialog from "@/components/BranchSwitchDialog";

const MenuPage = () => {
  const navigate = useNavigate();
  const { tenantSlug, branchCode, tableNumber, isTableMode, branches, switchBranch } = useTenantBranchContext();
  const { t } = useI18n();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuItemsList, setMenuItemsList] = useState<MenuItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [pendingBranch, setPendingBranch] = useState<BranchInfo | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const activeBranch = (branches || []).find((b) => b?.code === branchCode);

  const handleBranchSelectAttempt = (newCode: string) => {
    if (newCode === branchCode) return;
    const target = (branches || []).find((b) => b?.code === newCode);
    if (target) {
      setPendingBranch(target);
      setIsConfirmOpen(true);
    }
  };

  const handleConfirmBranchSwitch = () => {
    if (pendingBranch) {
      switchBranch(pendingBranch.code);
    }
    setIsConfirmOpen(false);
    setPendingBranch(null);
  };

  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items || []);
  const itemCount = (items || []).reduce((acc, item) => acc + (item?.quantity || 0), 0);
  const { particles, burst } = useFoodParticles();

  useEffect(() => {
    fetchMenuItems(branchCode).then((data) => {
      setMenuItemsList(Array.isArray(data) ? data : []);
    }).catch(() => {
      setMenuItemsList([]);
    });
  }, [branchCode]);

  const filteredItems = useMemo(() => {
    let items = (menuItemsList || []).filter(Boolean);

    if (selectedCategory !== "all") {
      items = items.filter((i) => {
        const catId = i.categoryId ?? (i as any).category_id;
        return String(catId) === String(selectedCategory);
      });
    }
    if (vegOnly) {
      items = items.filter((i) => Boolean(i.isVeg || (i as any).is_veg));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (i) =>
          (i.name || "").toLowerCase().includes(q) ||
          (i.description || "").toLowerCase().includes(q)
      );
    }
    return items;
  }, [menuItemsList, selectedCategory, vegOnly, searchQuery]);


  const handleAddItem = (item: MenuItem, e?: React.MouseEvent) => {
    if (item.variantGroups?.length || item.addonGroups?.length) {
      setSelectedItem(item);
    } else {
      addItem(item);
      if (e) burst(e.clientX, e.clientY);
    }
  };

  const handleAddToCart = (item: MenuItem, variants?: CartItemVariant[], addons?: CartItemAddon[]) => {
    addItem(item, variants, addons);
    burst();
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <FoodParticleLayer particles={particles} />

      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-popover/95 backdrop-blur border-b border-border px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto gap-1.5">
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 overflow-hidden">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-1 flex-shrink-0" aria-label="Open menu">
              <MenuIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={() => navigate(`/t/${tenantSlug}/b/${branchCode}${tableNumber ? `/table/${tableNumber}` : ''}`)}
              className="p-1 sm:p-1.5 rounded-full hover:bg-muted transition flex-shrink-0"
              aria-label="Home"
            >
              <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-xs sm:text-lg font-bold leading-tight truncate">{activeBranch?.name || t("app.name")}</h1>
              <div className="flex items-center gap-1 text-[9px] sm:text-xs text-muted-foreground truncate">
                <span>{isTableMode ? `Table ${tableNumber}` : t("misc.dineIn")}</span>
                <span>·</span>
                <div className="relative inline-flex items-center bg-muted/60 hover:bg-muted px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-semibold cursor-pointer">
                  <MapPin className="w-3 h-3 text-primary mr-1 flex-shrink-0" />
                  <select
                    value={branchCode}
                    onChange={(e) => handleBranchSelectAttempt(e.target.value)}
                    className="bg-transparent text-foreground focus:outline-none cursor-pointer appearance-none pr-3"
                  >
                    {(branches || []).map((b) => (
                      <option key={b.code} value={b.code} className="bg-popover text-popover-foreground">
                        {b.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-muted-foreground absolute right-0.5 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <LanguageToggle />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setCartOpen(true)}
              className="relative p-1.5 sm:p-2.5 rounded-full bg-primary text-primary-foreground shadow-md flex-shrink-0"
              aria-label={`Cart with ${itemCount} items`}
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-accent text-accent-foreground text-[9px] sm:text-xs font-bold flex items-center justify-center"
                >
                  {itemCount}
                </motion.span>
              )}
            </motion.button>
          </div>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar */}
        <CategorySidebar
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          vegOnly={vegOnly}
          onVegToggle={setVegOnly}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          branchCode={branchCode}
        />

        {/* Menu Grid */}
        <main className="flex-1 p-2 sm:p-4">
          {/* Mobile search */}
          <div className="md:hidden mb-2">
            <input
              type="text"
              placeholder={`🔍 ${t("menu.search")}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-card border border-border text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              aria-label="Search dishes"
            />
          </div>

          {/* Category pills on mobile */}
          <div className="md:hidden flex flex-wrap gap-1.5 mb-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-medium transition ${
                selectedCategory === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              🍽️ {t("menu.all")}
            </button>
            {["chinese", "pizza", "indian", "breads", "starters", "beverages", "desserts"].map((cat) => {
              const icons: Record<string, string> = { chinese: "🥡", pizza: "🍕", indian: "🍛", breads: "🫓", starters: "🍢", beverages: "🥤", desserts: "🍰" };
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-medium transition capitalize ${
                    selectedCategory === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {icons[cat]} {cat}
                </button>
              );
            })}
          </div>

          {filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-2">😅</p>
              <p className="text-muted-foreground">{t("menu.noItems")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-3 md:gap-4">
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item) => (
                  <MenuItemCard key={item.id} item={item} onAdd={handleAddItem} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>

      {/* Floating cart bar on mobile */}
      {itemCount > 0 && !cartOpen && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 md:hidden z-30 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        >
          <button
            onClick={() => setCartOpen(true)}
            className="w-full food-gradient text-primary-foreground rounded-2xl px-4 sm:px-5 py-3.5 sm:py-4 flex items-center justify-between font-bold shadow-lg text-sm sm:text-base"
          >
            <span>{t("menu.itemsInCart", { count: itemCount })}</span>
            <span>{t("menu.viewCart")}</span>
          </button>
        </motion.div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Cart Sheet */}
      <CartSheet isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Confirmation Dialog on Branch Change */}
      <BranchSwitchDialog
        isOpen={isConfirmOpen}
        targetBranch={pendingBranch}
        currentBranchName={activeBranch?.name || branchCode}
        onConfirm={handleConfirmBranchSwitch}
        onCancel={() => {
          setIsConfirmOpen(false);
          setPendingBranch(null);
        }}
      />
    </div>
  );
};

export default MenuPage;
