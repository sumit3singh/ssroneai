import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  X,
  ChevronDown,
  ShoppingBag,
  QrCode,
  MapPin,
  Store,
  ArrowRight,
} from "lucide-react";
import {
  fetchMenuItems,
  fetchCategories,
  getCachedMenuItems,
  getCachedCategories,
  type BranchInfo,
} from "@ssrone/api-client";
import { useCartStore } from "@/stores/cartStore";
import { useI18n } from "@/stores/i18nStore";
import MenuItemCard from "@/components/MenuItemCard";
import ItemDetailModal from "@/components/ItemDetailModal";
import CartSheet from "@/components/CartSheet";
import BottomNav from "@/components/BottomNav";
import { MenuGridSkeleton } from "@/components/LoadingSkeleton";
import { getCategoryPhoto } from "@/lib/foodImageHelper";
import { cn } from "@/lib/utils";
import { useTenantBranchContext } from "@/hooks/useTenantBranchContext";
import { useTenantAppConfig } from "@/hooks/useTenantAppConfig";
import type { MenuItem } from "@/data/mockMenu";
import type { CartItemVariant, CartItemAddon } from "@/stores/cartStore";
import BranchSwitchDialog from "@/components/BranchSwitchDialog";
import AddressSelectDialog from "@/components/AddressSelectDialog";
import ChangeOrderModeDialog from "@/components/ChangeOrderModeDialog";
import TableCameraScannerModal from "@/components/TableCameraScannerModal";
import { useAuthStore } from "@ssrone/auth";

export const MenuPage = () => {
  const navigate = useNavigate();
  const { tenantSlug, branchCode, tableNumber, branches, switchBranch } = useTenantBranchContext();
  const { orderMode } = useAuthStore();
  const { branding, hiddenItems } = useTenantAppConfig();
  const { t } = useI18n();

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [cartOpen, setCartOpen] = useState(false);
  // Zero-Wait 0ms Instant Initial Render from cache (in-memory & sessionStorage)
  const [menuItemsList, setMenuItemsList] = useState<MenuItem[]>(
    () => (getCachedMenuItems(branchCode) as MenuItem[]) || []
  );
  const [categoriesList, setCategoriesList] = useState<any[]>(
    () => getCachedCategories(branchCode) || []
  );
  const [loadingInitial, setLoadingInitial] = useState(
    () => !getCachedMenuItems(branchCode)?.length
  );

  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [pendingBranch, setPendingBranch] = useState<BranchInfo | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isModeDialogOpen, setIsModeDialogOpen] = useState(false);
  const [isTableScanOpen, setIsTableScanOpen] = useState(false);

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const categoryCarouselRef = useRef<HTMLDivElement | null>(null);
  const isUserClickingCategory = useRef(false);

  const activeBranch = (branches || []).find((b) => b?.code === branchCode);
  const outletName = branding.businessName || activeBranch?.name || "The Baithak Cafe";

  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items || []);
  const itemCount = (items || []).reduce((acc, item) => acc + (item?.quantity || 0), 0);
  const cartTotal = useCartStore((s) => s.getTotal());

  // Load menu items & categories in background (SWR pattern: instant paint + silent refresh)
  useEffect(() => {
    Promise.all([
      fetchMenuItems(branchCode)
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setMenuItemsList(data);
          }
        })
        .catch(() => {}),
      fetchCategories(branchCode)
        .then((cats) => {
          if (Array.isArray(cats) && cats.length > 0) {
            setCategoriesList(cats);
          }
        })
        .catch(() => {}),
    ]).finally(() => {
      setLoadingInitial(false);
    });
  }, [branchCode]);

  useEffect(() => {
    const handleOpenCart = () => setCartOpen(true);
    window.addEventListener("open-cart-sheet", handleOpenCart);
    return () => window.removeEventListener("open-cart-sheet", handleOpenCart);
  }, []);

  // Filtered menu items
  const filteredItems = useMemo(() => {
    let list = (menuItemsList || []).filter(Boolean);

    if (hiddenItems && hiddenItems.length > 0) {
      list = list.filter((i) => !hiddenItems.includes(String(i.id)));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (i) =>
          i.name?.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q) ||
          i.tags?.some((t) => t.name?.toLowerCase().includes(q))
      );
    }

    return list;
  }, [menuItemsList, hiddenItems, searchQuery]);

  // Group items by category
  const categoryGroups = useMemo(() => {
    const map = new Map<string, { category: any; items: MenuItem[] }>();

    (categoriesList || []).forEach((cat) => {
      map.set(String(cat.id), { category: cat, items: [] });
    });

    (filteredItems || []).forEach((item) => {
      const catId = String(item.categoryId ?? item.category_id ?? "all");
      if (!map.has(catId)) {
        map.set(catId, {
          category: { id: catId, name: catId === "all" ? "All Specialties" : catId },
          items: [],
        });
      }
      map.get(catId)!.items.push(item);
    });

    return Array.from(map.values()).filter((group) => group.items.length > 0);
  }, [categoriesList, filteredItems]);

  // Scroll spy with requestAnimationFrame to prevent scroll jank
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (isUserClickingCategory.current) return;
      if (searchQuery.trim()) return;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollPos = window.scrollY + 180;
          let currentCat = "all";

          for (const group of categoryGroups) {
            const catId = String(group.category.id);
            const el = sectionRefs.current[catId];
            if (el) {
              const top = el.offsetTop;
              const height = el.offsetHeight;
              if (scrollPos >= top && scrollPos < top + height) {
                currentCat = catId;
                break;
              }
            }
          }

          setActiveCategory((prev) => (prev !== currentCat ? currentCat : prev));
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [categoryGroups, searchQuery]);

  // Center active category thumbnail in carousel
  useEffect(() => {
    if (!categoryCarouselRef.current) return;
    const activeEl = document.getElementById(`cat-thumb-${activeCategory}`);
    if (activeEl) {
      activeEl.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeCategory]);

  const handleSelectCategory = (catId: string) => {
    isUserClickingCategory.current = true;
    setActiveCategory(catId);

    if (catId === "all") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const targetEl = sectionRefs.current[catId];
      if (targetEl) {
        const topOffset = 150; // height of fixed top bar + sticky search & categories
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - topOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    }

    setTimeout(() => {
      isUserClickingCategory.current = false;
    }, 600);
  };

  const handleAddItem = useCallback((item: MenuItem, e?: React.MouseEvent) => {
    if (item.variantGroups?.length || item.addonGroups?.length) {
      setSelectedItem(item);
    } else {
      addItem(item);
    }
  }, [addItem]);

  const handleAddToCart = useCallback((item: MenuItem, variants?: CartItemVariant[], addons?: CartItemAddon[]) => {
    addItem(item, variants, addons);
  }, [addItem]);

  const homePath = `/t/${tenantSlug}/b/${branchCode}${tableNumber ? `/table/${tableNumber}` : ""}`;

  return (
    <div className="min-h-screen bg-[#FBF8F3] text-[#2D241E] pb-16 select-none font-sans">
      {/* ── Top Header (Brand + Dining Mode Pill) ── */}
      <header className="relative bg-white border-b border-[#E8E3DC] shadow-2xs">
        <div className="px-4 sm:px-6 py-2.5 max-w-3xl mx-auto flex items-center justify-between gap-3">
          {/* Left: Brand Emblem + Name & Location */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => navigate(homePath)}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#9E6B38] to-[#784F2B] text-white flex items-center justify-center p-2 shrink-0 shadow-xs cursor-pointer hover:opacity-90 transition active:scale-95"
              title="Home"
            >
              {branding.logoUrl ? (
                <img src={branding.logoUrl} alt={outletName} className="w-full h-full object-contain rounded-lg" />
              ) : (
                <svg
                  className="w-4 h-4 text-amber-200"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
                  <path d="M3 8h14v7a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" />
                  <path d="M6 2v2M10 2v2M14 2v2" />
                  <line x1="2" y1="21" x2="20" y2="21" />
                </svg>
              )}
            </button>

            <div className="min-w-0">
              <h1 className="font-serif text-base sm:text-lg font-bold text-[#2D241E] tracking-tight leading-tight break-words">
                {outletName}
              </h1>
              <div className="flex items-center gap-1 text-[11px] text-[#7A746B]">
                <MapPin className="w-3 h-3 shrink-0 text-[#9E6B38]" />
                <span className="font-medium break-words">
                  {activeBranch?.name || outletName}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Mode Switcher Pill */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsModeDialogOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#FAF8F5] hover:bg-[#F2EFE9] text-[#2D241E] border border-[#E8E3DC] transition cursor-pointer active:scale-95 shadow-2xs"
              title="Click to switch Dining Mode"
            >
              {orderMode === "dine-in" ? (
                <>
                  <QrCode className="w-3.5 h-3.5 text-[#9E6B38]" />
                  <span>{tableNumber ? `Table ${tableNumber}` : "Table"}</span>
                </>
              ) : orderMode === "delivery" ? (
                <>
                  <MapPin className="w-3.5 h-3.5 text-[#9E6B38]" />
                  <span>Delivery</span>
                </>
              ) : (
                <>
                  <Store className="w-3.5 h-3.5 text-[#9E6B38]" />
                  <span>Takeaway</span>
                </>
              )}
              <ChevronDown className="w-3.5 h-3.5 opacity-70 ml-0.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── STICKY TOP CONTAINER: Search Bar + Cart Pop-up Icon + Category Carousel ── */}
      <div className="sticky top-0 z-30 bg-[#FBF8F3]/95 backdrop-blur-md border-b border-[#E8E3DC] shadow-xs">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-2 pb-2 space-y-2">
          {/* Row 1: Search Pill + Right-side Impressive Cart Button */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 flex items-center bg-white rounded-2xl border border-[#E8E3DC] shadow-2xs px-3.5 py-1.5 focus-within:border-[#9E6B38] focus-within:ring-2 focus-within:ring-[#9E6B38]/15 transition">
              <Search className="w-4 h-4 text-[#7A746B] mr-2 shrink-0 pointer-events-none" />
              <input
                type="text"
                placeholder="Search dishes or drinks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-[#2D241E] placeholder:text-[#A8A29E] focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="p-1 rounded-full text-[#7A746B] hover:text-[#9E6B38] cursor-pointer ml-1"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* The One and Only Impressive Top Cart Button */}
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className={cn(
                "relative h-10 px-3.5 rounded-2xl flex items-center gap-2 transition-all cursor-pointer shrink-0 active:scale-95 select-none",
                itemCount > 0
                  ? "bg-gradient-to-r from-[#9E6B38] via-[#B45309] to-[#8C5E35] text-white shadow-md shadow-amber-900/20 ring-1 ring-amber-700/30 hover:brightness-105"
                  : "bg-white text-[#8C5E35] border border-[#E8E3DC] hover:border-[#9E6B38] hover:bg-[#FDFBF7] shadow-2xs"
              )}
              title="View Cart"
              aria-label={`Shopping cart, ${itemCount} items, total ₹${cartTotal}`}
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[17px] h-[17px] px-1 rounded-full bg-white text-[#B45309] text-[10px] font-black flex items-center justify-center shadow-xs">
                    {itemCount}
                  </span>
                )}
              </div>
              {itemCount > 0 ? (
                <div className="flex flex-col items-start leading-none pr-0.5">
                  <span className="text-[9px] uppercase tracking-wider text-amber-200/90 font-bold">Cart</span>
                  <span className="text-xs font-black text-white">₹{cartTotal}</span>
                </div>
              ) : (
                <span className="text-xs font-bold text-[#8C5E35]">Cart</span>
              )}
            </button>
          </div>

          {/* Row 2: Category Carousel (Round Photo on Top + Name Underneath) */}
          <div
            ref={categoryCarouselRef}
            className="flex items-start gap-3.5 overflow-x-auto no-scrollbar scroll-smooth pt-1 pb-1 px-1"
          >
            {/* "All" Category Item */}
            <button
              type="button"
              onClick={() => handleSelectCategory("all")}
              className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group select-none"
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-all p-0.5",
                  activeCategory === "all"
                    ? "ring-2 ring-[#9E6B38] shadow-xs scale-105"
                    : "opacity-85 group-hover:opacity-100"
                )}
              >
                <div
                  className={cn(
                    "w-full h-full rounded-full flex items-center justify-center font-bold text-xs shadow-2xs transition-colors",
                    activeCategory === "all"
                      ? "bg-gradient-to-br from-[#9E6B38] to-[#8C5E35] text-white"
                      : "bg-[#F3EFEA] text-[#7A746B] group-hover:bg-[#EAE4DC]"
                  )}
                >
                  All
                </div>
              </div>
              <span
                className={cn(
                  "text-[10px] sm:text-[11px] font-bold text-center leading-tight max-w-[70px]",
                  activeCategory === "all" ? "text-[#9E6B38]" : "text-[#7A746B]"
                )}
              >
                All
              </span>
            </button>

            {/* Dynamic Category Items */}
            {categoryGroups.map((group) => {
              const cat = group.category;
              const catIdStr = String(cat.id);
              const isActive = activeCategory === catIdStr;
              const catPhoto = getCategoryPhoto(cat.name, cat.imageUrl);

              return (
                <button
                  key={cat.id}
                  id={`cat-thumb-${catIdStr}`}
                  type="button"
                  onClick={() => handleSelectCategory(catIdStr)}
                  className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group select-none"
                >
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full overflow-hidden transition-all p-0.5 relative",
                      isActive
                        ? "ring-2 ring-[#8C5E35] shadow-xs scale-105"
                        : "opacity-85 group-hover:opacity-100"
                    )}
                  >
                    <img
                      src={catPhoto}
                      alt={cat.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <span
                    className={cn(
                      "text-[10px] sm:text-[11px] font-bold text-center leading-tight max-w-[76px] break-words",
                      isActive ? "text-[#8C5E35]" : "text-[#7A746B]"
                    )}
                  >
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Menu Items List (Compact, 5-6 Items Visible per Screen) ── */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-3 space-y-4">
        {loadingInitial && categoryGroups.length === 0 ? (
          <MenuGridSkeleton count={6} />
        ) : categoryGroups.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-3">
            <div className="w-14 h-14 rounded-full bg-white border border-[#E8E3DC] flex items-center justify-center mx-auto text-[#7A746B] shadow-2xs">
              <Search className="w-6 h-6 stroke-[1.8]" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#2D241E]">
              No dishes found
            </h3>
            <p className="text-xs text-[#7A746B] max-w-xs mx-auto">
              {searchQuery ? `No matching items for "${searchQuery}"` : "Menu items are being prepared."}
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="px-4 py-2 rounded-full bg-[#9E6B38] text-white text-xs font-bold shadow-xs hover:bg-[#8C5E35] transition cursor-pointer"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          categoryGroups.map((group) => {
            const catId = String(group.category.id);
            return (
              <section
                key={catId}
                ref={(el) => {
                  sectionRefs.current[catId] = el;
                }}
                className="space-y-1.5 scroll-mt-36"
              >
                {/* Category Section Header */}
                <div className="flex items-center justify-between pt-1 pb-0.5">
                  <h2 className="font-serif text-sm sm:text-base font-bold text-[#2D241E] tracking-tight flex items-center gap-1.5">
                    <span>{group.category.name}</span>
                    <span className="text-[11px] font-semibold text-[#7A746B]">
                      ({group.items.length})
                    </span>
                  </h2>
                </div>

                {/* Compact Item Cards Container */}
                <div className="space-y-1.5">
                  {group.items.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      categoryName={group.category.name}
                      onAdd={handleAddItem}
                    />
                  ))}
                </div>
              </section>
            );
          })
        )}
      </main>

      {/* ── Unified Bottom Navigation Bar (Home, Menu, Orders) ── */}
      <BottomNav />

      {/* ── Modals & Sheets ── */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      <CartSheet isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      <BranchSwitchDialog
        isOpen={isConfirmOpen}
        targetBranch={pendingBranch}
        currentBranchName={activeBranch?.name || branchCode}
        onConfirm={() => {
          if (pendingBranch) switchBranch(pendingBranch.code);
          setIsConfirmOpen(false);
          setPendingBranch(null);
        }}
        onCancel={() => {
          setIsConfirmOpen(false);
          setPendingBranch(null);
        }}
      />

      <AddressSelectDialog
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
      />

      <ChangeOrderModeDialog
        isOpen={isModeDialogOpen}
        onClose={() => setIsModeDialogOpen(false)}
        onOpenAddressSelect={() => setIsAddressModalOpen(true)}
        onOpenTableScan={() => setIsTableScanOpen(true)}
      />

      <TableCameraScannerModal
        isOpen={isTableScanOpen}
        onClose={() => setIsTableScanOpen(false)}
        onTableScanned={(scannedTbl) => {
          navigate(`/t/${tenantSlug}/b/${branchCode}/table/${scannedTbl}/menu`);
        }}
      />
    </div>
  );
};

export default MenuPage;
