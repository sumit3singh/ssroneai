import { useState, useMemo, useEffect } from "react";
import {
  Building2, Layers, Utensils, Home, Shield, Users, Plus,
  Search, Edit2, Trash2, X, Check, AlertCircle, Save, Settings,
  ShieldCheck, HelpCircle, LayoutGrid
} from "lucide-react";
import { Button } from "@/shared/ui/primitives/Button";
import { Input } from "@/shared/ui/primitives/Input";
import { Badge } from "@/shared/ui/primitives/Badge";
import { toast } from "sonner";
import { cn } from "@/shared/utils/cn";
import { isMockSession } from "@/shared/utils/dev-mode";
import { mockDB } from "@/shared/utils/mock-db";
import { api } from "@/shared/utils/api-client";
import { formatCurrency } from "@/shared/utils/formatters";

// Defined File IDs for each Master configuration
const FILE_IDS = {
  branches: "MST001",
  categories: "MST002",
  products: "MST003",
  rooms: "MST004",
  roles: "MST005",
  users: "MST006"
};

type MasterTab = "branches" | "categories" | "products" | "rooms" | "roles" | "users";

export function MasterStudioPage() {
  const isMock = isMockSession();
  const [activeTab, setActiveTab] = useState<MasterTab>("branches");
  const [searchQuery, setSearchQuery] = useState("");

  // Data States
  const [branches, setBranches] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  // Modal & Edit States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editRecord, setEditRecord] = useState<any | null>(null);

  // Form Field States
  const [branchForm, setBranchForm] = useState({ name: "", code: "", type: "outlet", email: "", phone: "", is_active: true });
  const [categoryForm, setCategoryForm] = useState({ name: "", sort_order: 1, is_active: true });
  const [productForm, setProductForm] = useState({ name: "", code: "", category: "Pizza", base_price: 150, is_vegetarian: true });
  const [roomForm, setRoomForm] = useState({ room_number: "", room_type: "double", capacity: 2, monthly_rent: 8500, is_ac: true });
  const [roleForm, setRoleForm] = useState({ name: "", code: "", description: "", is_system_role: false });
  const [userForm, setUserForm] = useState({ first_name: "", last_name: "", email: "", phone: "", role_code: "cashier", is_active: true });

  // Sync data from database
  const refreshData = () => {
    if (!isMock) {
      api.get<any[]>("/masters/branches").then((res) => Array.isArray(res) && setBranches(res)).catch(() => setBranches([]));
      api.get<any[]>("/restaurant/categories").then((res) => Array.isArray(res) && setCategories(res)).catch(() => setCategories([]));
      api.get<any[]>("/restaurant/menu-items").then((res) => Array.isArray(res) && setProducts(res)).catch(() => setProducts([]));
      api.get<any[]>("/pg/rooms").then((res) => Array.isArray(res) && setRooms(res)).catch(() => setRooms([]));
      api.get<any[]>("/auth/roles").then((res) => Array.isArray(res) && setRoles(res)).catch(() => setRoles([]));
      api.get<any[]>("/auth/users").then((res) => Array.isArray(res) && setUsers(res)).catch(() => setUsers([]));
      return;
    }
    // 1. Branches
    let bList = mockDB.get<any>("branches") || [];
    if (bList.length === 0) {
      bList = [
        { id: "b-1", name: "Connaught Place Outlet", code: "CUH02", type: "outlet", email: "cp@baithak.com", phone: "9876543201", is_active: true },
        { id: "b-2", name: "Gurgaon CyberCity Hub", code: "GGN01", type: "outlet", email: "cyber@baithak.com", phone: "9876543202", is_active: true }
      ];
      mockDB.set("branches", bList);
    }
    setBranches(bList);

    // 2. Categories
    let cList = mockDB.get<any>("categories") || [];
    if (cList.length === 0) {
      cList = ["Pizza", "Burgers", "Chinese", "Desserts", "Beverages", "Snacks", "Breakfast"];
      mockDB.set("categories", cList);
    }
    // Convert array strings to objects if needed
    const formattedCats = cList.map((c: any, index: number) => {
      if (typeof c === "string") {
        return { id: `cat-${index}`, name: c, sort_order: index + 1, is_active: true };
      }
      return c;
    });
    setCategories(formattedCats);

    // 3. Products (Dishes)
    let pList = mockDB.get<any>("products") || [];
    if (pList.length === 0) {
      pList = [
        { id: "p-1", name: "Veg Margherita Pizza", code: "VMP01", category: "Pizza", base_price: 249, is_vegetarian: true },
        { id: "p-2", name: "Tandoori Paneer Burger", code: "TPB02", category: "Burgers", base_price: 149, is_vegetarian: true },
        { id: "p-3", name: "Hakka Noodles Steam", code: "HNS03", category: "Chinese", base_price: 199, is_vegetarian: true }
      ];
      mockDB.set("products", pList);
    }
    setProducts(pList);

    // 4. PG Rooms
    let rList = mockDB.get<any>("pg_rooms") || [];
    if (rList.length === 0) {
      rList = [
        { id: "rm-1", room_number: "101", room_type: "double", capacity: 2, monthly_rent: 8000, is_ac: true },
        { id: "rm-2", room_number: "102", room_type: "triple", capacity: 3, monthly_rent: 6500, is_ac: false },
        { id: "rm-3", room_number: "201", room_type: "single", capacity: 1, monthly_rent: 12000, is_ac: true }
      ];
      mockDB.set("pg_rooms", rList);
    }
    setRooms(rList);

    // 5. Roles
    let roleList = mockDB.get<any>("roles") || [];
    if (roleList.length === 0) {
      roleList = [
        { id: "role-1", name: "Administrator", code: "admin", description: "Full root platform admin control rights", is_system_role: true },
        { id: "role-2", name: "Cashier Operator", code: "cashier", description: "Dine-in POS billing counter operations", is_system_role: false },
        { id: "role-3", name: "Property Manager", code: "manager", description: "PG resident admissions and checkout flows", is_system_role: false }
      ];
      mockDB.set("roles", roleList);
    }
    setRoles(roleList);

    // 6. Users
    let userList = mockDB.get<any>("users") || [];
    if (userList.length === 0) {
      userList = [
        { id: "u-1", first_name: "Sumit", last_name: "Singh", email: "sumit@baithak.com", phone: "9876543210", role_code: "admin", is_active: true },
        { id: "u-2", first_name: "Amit", last_name: "Patel", email: "amit@baithak.com", phone: "9876543212", role_code: "manager", is_active: true },
        { id: "u-3", first_name: "Rahul", last_name: "Sharma", email: "rahul@baithak.com", phone: "9876543211", role_code: "cashier", is_active: true }
      ];
      mockDB.set("users", userList);
    }
    setUsers(userList);
  };

  useEffect(() => {
    if (!isMock) return;
    refreshData();
  }, [isMock]);

  // Filtered dataset for the active tab
  const activeRecords = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (activeTab === "branches") {
      return branches.filter(b => b.name.toLowerCase().includes(query) || b.code.toLowerCase().includes(query));
    }
    if (activeTab === "categories") {
      return categories.filter(c => c.name.toLowerCase().includes(query));
    }
    if (activeTab === "products") {
      return products.filter(p => p.name.toLowerCase().includes(query) || p.code.toLowerCase().includes(query) || p.category.toLowerCase().includes(query));
    }
    if (activeTab === "rooms") {
      return rooms.filter(r => r.room_number.includes(query) || r.room_type.toLowerCase().includes(query));
    }
    if (activeTab === "roles") {
      return roles.filter(r => r.name.toLowerCase().includes(query) || r.code.toLowerCase().includes(query));
    }
    if (activeTab === "users") {
      return users.filter(u => u.first_name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query) || u.role_code.toLowerCase().includes(query));
    }
    return [];
  }, [activeTab, searchQuery, branches, categories, products, rooms, roles, users]);

  // Handle Delete CRUD Operation
  const handleDelete = (id: string, name: string) => {
    if (!isMock) {
      toast.error("Master Studio operations are only available in mock sessions.");
      return;
    }
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    if (activeTab === "branches") {
      const updated = branches.filter(b => b.id !== id);
      mockDB.set("branches", updated);
      setBranches(updated);
    } else if (activeTab === "categories") {
      const updated = categories.filter(c => c.id !== id);
      mockDB.set("categories", updated.map(c => c.name)); // Categories seeded as string arrays in mockDB
      setCategories(updated);
    } else if (activeTab === "products") {
      const updated = products.filter(p => p.id !== id);
      mockDB.set("products", updated);
      setProducts(updated);
    } else if (activeTab === "rooms") {
      const updated = rooms.filter(r => r.id !== id);
      mockDB.set("pg_rooms", updated);
      setRooms(updated);
    } else if (activeTab === "roles") {
      const updated = roles.filter(r => r.id !== id);
      mockDB.set("roles", updated);
      setRoles(updated);
    } else if (activeTab === "users") {
      const updated = users.filter(u => u.id !== id);
      mockDB.set("users", updated);
      setUsers(updated);
    }

    toast.error(`${name} deleted from active Master`);
  };

  // Open Add Modal or edit setup
  const openAdd = () => {
    setEditRecord(null);
    setShowAddModal(true);
    // Reset forms
    setBranchForm({ name: "", code: "", type: "outlet", email: "", phone: "", is_active: true });
    setCategoryForm({ name: "", sort_order: categories.length + 1, is_active: true });
    setProductForm({ name: "", code: "", category: "Pizza", base_price: 150, is_vegetarian: true });
    setRoomForm({ room_number: "", room_type: "double", capacity: 2, monthly_rent: 8500, is_ac: true });
    setRoleForm({ name: "", code: "", description: "", is_system_role: false });
    setUserForm({ first_name: "", last_name: "", email: "", phone: "", role_code: "cashier", is_active: true });
  };

  const openEdit = (record: any) => {
    setEditRecord(record);
    setShowAddModal(true);

    if (activeTab === "branches") {
      setBranchForm({ ...record });
    } else if (activeTab === "categories") {
      setCategoryForm({ ...record });
    } else if (activeTab === "products") {
      setProductForm({ ...record });
    } else if (activeTab === "rooms") {
      setRoomForm({ ...record });
    } else if (activeTab === "roles") {
      setRoleForm({ ...record });
    } else if (activeTab === "users") {
      setUserForm({ ...record });
    }
  };

  // Handle Form Submission (Create or Update)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === "branches") {
      const list = [...branches];
      if (editRecord) {
        // Update
        const idx = list.findIndex(b => b.id === editRecord.id);
        list[idx] = { ...editRecord, ...branchForm };
        toast.success(`Outlet ${branchForm.name} updated!`);
      } else {
        // Create
        list.unshift({ id: `b-${Date.now()}`, ...branchForm });
        toast.success(`Outlet ${branchForm.name} created successfully!`);
      }
      mockDB.set("branches", list);
      setBranches(list);
    } else if (activeTab === "categories") {
      const list = [...categories];
      if (editRecord) {
        const idx = list.findIndex(c => c.id === editRecord.id);
        list[idx] = { ...editRecord, ...categoryForm };
        toast.success(`Category ${categoryForm.name} updated!`);
      } else {
        list.push({ id: `cat-${Date.now()}`, ...categoryForm });
        toast.success(`Category ${categoryForm.name} created!`);
      }
      // Sync back array list to mockDB
      mockDB.set("categories", list.map(c => c.name));
      setCategories(list);
    } else if (activeTab === "products") {
      const list = [...products];
      if (editRecord) {
        const idx = list.findIndex(p => p.id === editRecord.id);
        list[idx] = { ...editRecord, ...productForm };
        toast.success(`Dish ${productForm.name} updated!`);
      } else {
        list.unshift({ id: `p-${Date.now()}`, ...productForm });
        toast.success(`Dish ${productForm.name} created!`);
      }
      mockDB.set("products", list);
      setProducts(list);
    } else if (activeTab === "rooms") {
      const list = [...rooms];
      if (editRecord) {
        const idx = list.findIndex(r => r.id === editRecord.id);
        list[idx] = { ...editRecord, ...roomForm };
        toast.success(`Room ${roomForm.room_number} updated!`);
      } else {
        list.unshift({ id: `rm-${Date.now()}`, ...roomForm });
        toast.success(`Room ${roomForm.room_number} added!`);
      }
      mockDB.set("pg_rooms", list);
      setRooms(list);
    } else if (activeTab === "roles") {
      const list = [...roles];
      if (editRecord) {
        const idx = list.findIndex(r => r.id === editRecord.id);
        list[idx] = { ...editRecord, ...roleForm };
        toast.success(`Role ${roleForm.name} updated!`);
      } else {
        list.unshift({ id: `role-${Date.now()}`, ...roleForm });
        toast.success(`Role ${roleForm.name} created!`);
      }
      mockDB.set("roles", list);
      setRoles(list);
    } else if (activeTab === "users") {
      const list = [...users];
      if (editRecord) {
        const idx = list.findIndex(u => u.id === editRecord.id);
        list[idx] = { ...editRecord, ...userForm };
        toast.success(`User ${userForm.first_name} updated!`);
      } else {
        list.unshift({ id: `u-${Date.now()}`, ...userForm });
        toast.success(`User ${userForm.first_name} registered!`);
      }
      mockDB.set("users", list);
      setUsers(list);
    }

    setShowAddModal(false);
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 bg-background text-foreground min-h-[calc(100vh-60px)] transition-colors duration-300 animate-in fade-in select-none">

      {/* SECTION 1: Workspace Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 text-3xs font-black uppercase tracking-wider text-muted-foreground">
            <span>Ecosystem Settings</span>
            <span>/</span>
            <span>Platform Master Studio</span>
            <span className="text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded font-mono">MST_STUDIO</span>
          </div>
          <h1 className="text-xl font-display font-black text-foreground flex items-center gap-2 mt-1">
            <LayoutGrid size={22} className="text-violet-500" />
            Master Data Configuration Studio
          </h1>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-xl">
          <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
          <span className="text-3xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Role privilege: Administrator (Full CRUD Bypass allowed)</span>
        </div>
      </div>

      {/* Grid containing left side tab list and right side table */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Left Side Tab list (Workspace Standard Panel) */}
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3 shadow-2xs h-fit">
          <div className="border-b border-border pb-2">
            <h3 className="text-3xs font-black uppercase text-muted-foreground tracking-wider">Select Master Registry</h3>
          </div>
          <nav className="flex flex-col gap-1.5">
            <button
              onClick={() => { setActiveTab("branches"); setSearchQuery(""); }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-left",
                activeTab === "branches" ? "bg-violet-600 text-white" : "text-muted-foreground hover:bg-muted"
              )}
            >
              <span className="flex items-center gap-2"><Building2 size={14} /> Outlets / Branches</span>
              <span className="text-4xs font-mono px-1.5 py-0.5 rounded bg-black/10 text-foreground dark:text-white">{FILE_IDS.branches}</span>
            </button>

            <button
              onClick={() => { setActiveTab("categories"); setSearchQuery(""); }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-left",
                activeTab === "categories" ? "bg-violet-600 text-white" : "text-muted-foreground hover:bg-muted"
              )}
            >
              <span className="flex items-center gap-2"><Layers size={14} /> Menu Categories</span>
              <span className="text-4xs font-mono px-1.5 py-0.5 rounded bg-black/10 text-foreground dark:text-white">{FILE_IDS.categories}</span>
            </button>

            <button
              onClick={() => { setActiveTab("products"); setSearchQuery(""); }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-left",
                activeTab === "products" ? "bg-violet-600 text-white" : "text-muted-foreground hover:bg-muted"
              )}
            >
              <span className="flex items-center gap-2"><Utensils size={14} /> Dishes & Products</span>
              <span className="text-4xs font-mono px-1.5 py-0.5 rounded bg-black/10 text-foreground dark:text-white">{FILE_IDS.products}</span>
            </button>

            <button
              onClick={() => { setActiveTab("rooms"); setSearchQuery(""); }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-left",
                activeTab === "rooms" ? "bg-violet-600 text-white" : "text-muted-foreground hover:bg-muted"
              )}
            >
              <span className="flex items-center gap-2"><Home size={14} /> PG Rooms & Beds</span>
              <span className="text-4xs font-mono px-1.5 py-0.5 rounded bg-black/10 text-foreground dark:text-white">{FILE_IDS.rooms}</span>
            </button>

            <button
              onClick={() => { setActiveTab("roles"); setSearchQuery(""); }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-left",
                activeTab === "roles" ? "bg-violet-600 text-white" : "text-muted-foreground hover:bg-muted"
              )}
            >
              <span className="flex items-center gap-2"><Shield size={14} /> Roles & RBAC</span>
              <span className="text-4xs font-mono px-1.5 py-0.5 rounded bg-black/10 text-foreground dark:text-white">{FILE_IDS.roles}</span>
            </button>

            <button
              onClick={() => { setActiveTab("users"); setSearchQuery(""); }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-left",
                activeTab === "users" ? "bg-violet-600 text-white" : "text-muted-foreground hover:bg-muted"
              )}
            >
              <span className="flex items-center gap-2"><Users size={14} /> User Registry</span>
              <span className="text-4xs font-mono px-1.5 py-0.5 rounded bg-black/10 text-foreground dark:text-white">{FILE_IDS.users}</span>
            </button>
          </nav>
        </div>

        {/* Right Side Table and Search Bar (Data Grid Panel) */}
        <div className="lg:col-span-3 bg-card border border-border rounded-2xl p-5 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/80">
            <div className="relative max-w-xs flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <input
                type="text"
                placeholder={`Search active ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full bg-background border border-border text-xs rounded-xl py-2 outline-none text-foreground focus:ring-1 focus:ring-violet-500 focus:border-violet-500 font-semibold"
              />
            </div>
            <Button onClick={openAdd} className="bg-violet-600 hover:bg-violet-700 text-white text-3xs font-bold px-3.5 py-2 rounded-xl border-none flex items-center gap-1 cursor-pointer">
              <Plus size={12} /> Create Record ({FILE_IDS[activeTab]})
            </Button>
          </div>

          <div className="overflow-x-auto min-h-[350px]">
            <table className="w-full text-left border-collapse text-xs">

              {/* HEADERS */}
              <thead>
                <tr className="border-b border-border text-[10px] font-black uppercase text-muted-foreground">
                  {activeTab === "branches" && (
                    <>
                      <th className="py-2.5">Branch Name</th>
                      <th className="py-2.5">Code</th>
                      <th className="py-2.5">Type</th>
                      <th className="py-2.5">Contact Detail</th>
                      <th className="py-2.5 text-center">Status</th>
                    </>
                  )}
                  {activeTab === "categories" && (
                    <>
                      <th className="py-2.5">Category Name</th>
                      <th className="py-2.5 text-center">Sort Order</th>
                      <th className="py-2.5 text-center">Status</th>
                    </>
                  )}
                  {activeTab === "products" && (
                    <>
                      <th className="py-2.5">Dish / Product Name</th>
                      <th className="py-2.5">Code</th>
                      <th className="py-2.5">Category</th>
                      <th className="py-2.5 text-right">Base Price</th>
                      <th className="py-2.5 text-center">Food Type</th>
                    </>
                  )}
                  {activeTab === "rooms" && (
                    <>
                      <th className="py-2.5">Room Number</th>
                      <th className="py-2.5">Category Type</th>
                      <th className="py-2.5 text-center">Capacity</th>
                      <th className="py-2.5 text-right">Monthly Rent</th>
                      <th className="py-2.5 text-center">AC Config</th>
                    </>
                  )}
                  {activeTab === "roles" && (
                    <>
                      <th className="py-2.5">Role Name</th>
                      <th className="py-2.5">Role Code</th>
                      <th className="py-2.5">Description</th>
                      <th className="py-2.5 text-center">Core Role</th>
                    </>
                  )}
                  {activeTab === "users" && (
                    <>
                      <th className="py-2.5">Staff Name</th>
                      <th className="py-2.5">Email Address</th>
                      <th className="py-2.5">Phone Number</th>
                      <th className="py-2.5">Assigned Role</th>
                      <th className="py-2.5 text-center">Status</th>
                    </>
                  )}
                  <th className="py-2.5 text-center">Actions</th>
                </tr>
              </thead>

              {/* DATA ROWS */}
              <tbody className="divide-y divide-border/60 font-semibold text-muted-foreground">
                {activeRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-muted/10">

                    {/* BRANCHES */}
                    {activeTab === "branches" && (
                      <>
                        <td className="py-3 text-foreground">{rec.name}</td>
                        <td className="py-3 font-mono text-3xs text-foreground bg-background border border-border px-1.5 py-0.5 rounded w-fit">{rec.code}</td>
                        <td className="py-3 uppercase text-3xs font-bold">{rec.type}</td>
                        <td className="py-3">
                          <p className="text-[10px] text-foreground">{rec.email}</p>
                          <p className="text-[9px] mt-0.5">{rec.phone}</p>
                        </td>
                        <td className="py-3 text-center">
                          <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-full", rec.is_active ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground")}>
                            {rec.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </>
                    )}

                    {/* CATEGORIES */}
                    {activeTab === "categories" && (
                      <>
                        <td className="py-3 text-foreground">{rec.name}</td>
                        <td className="py-3 text-center font-mono text-3xs">{rec.sort_order}</td>
                        <td className="py-3 text-center">
                          <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-full", rec.is_active ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground")}>
                            {rec.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </>
                    )}

                    {/* PRODUCTS */}
                    {activeTab === "products" && (
                      <>
                        <td className="py-3 text-foreground">{rec.name}</td>
                        <td className="py-3 font-mono text-3xs text-foreground/80">{rec.code}</td>
                        <td className="py-3">{rec.category}</td>
                        <td className="py-3 text-right text-foreground font-mono font-bold">₹{rec.base_price}</td>
                        <td className="py-3 text-center">
                          <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-full", rec.is_vegetarian ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400")}>
                            {rec.is_vegetarian ? "Veg" : "Non-Veg"}
                          </span>
                        </td>
                      </>
                    )}

                    {/* ROOMS */}
                    {activeTab === "rooms" && (
                      <>
                        <td className="py-3 text-foreground font-mono font-bold">Room {rec.room_number}</td>
                        <td className="py-3 uppercase text-3xs">{rec.room_type}</td>
                        <td className="py-3 text-center">{rec.capacity} Beds</td>
                        <td className="py-3 text-right text-foreground font-mono font-bold">₹{rec.monthly_rent}/mo</td>
                        <td className="py-3 text-center">
                          <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-full", rec.is_ac ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" : "bg-muted text-muted-foreground")}>
                            {rec.is_ac ? "A/C" : "Non-A/C"}
                          </span>
                        </td>
                      </>
                    )}

                    {/* ROLES */}
                    {activeTab === "roles" && (
                      <>
                        <td className="py-3 text-foreground">{rec.name}</td>
                        <td className="py-3 font-mono text-3xs text-foreground bg-background border border-border px-1.5 py-0.5 rounded w-fit">{rec.code}</td>
                        <td className="py-3 max-w-[200px] truncate">{rec.description}</td>
                        <td className="py-3 text-center">
                          <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-full", rec.is_system_role ? "bg-violet-500/10 text-violet-600 dark:text-violet-400" : "bg-muted text-muted-foreground")}>
                            {rec.is_system_role ? "Core" : "Custom"}
                          </span>
                        </td>
                      </>
                    )}

                    {/* USERS */}
                    {activeTab === "users" && (
                      <>
                        <td className="py-3 text-foreground">{rec.first_name} {rec.last_name || ""}</td>
                        <td className="py-3 text-foreground/80">{rec.email}</td>
                        <td className="py-3 font-mono text-3xs">{rec.phone || "--"}</td>
                        <td className="py-3">
                          <span className="font-mono text-4xs bg-background border border-border px-2 py-0.5 rounded text-foreground uppercase">{rec.role_code}</span>
                        </td>
                        <td className="py-3 text-center">
                          <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-full", rec.is_active ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground")}>
                            {rec.is_active ? "Active" : "Suspended"}
                          </span>
                        </td>
                      </>
                    )}

                    <td className="py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEdit(rec)}
                          className="w-7 h-7 rounded-lg hover:bg-muted border border-border text-foreground flex items-center justify-center cursor-pointer transition-colors"
                        >
                          <Edit2 size={12} className="text-violet-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(rec.id, rec.name || rec.room_number || rec.first_name)}
                          className="w-7 h-7 rounded-lg hover:bg-muted border border-border text-foreground flex items-center justify-center cursor-pointer transition-colors"
                        >
                          <Trash2 size={12} className="text-rose-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {activeRecords.length === 0 && (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-muted-foreground font-bold">No master registry records found matching search filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Dynamic Overlay Form Modal (CRUD Form) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border bg-card/60">
              <h3 className="font-display font-black text-foreground text-sm flex items-center gap-1.5">
                <Settings size={16} className="text-violet-500" />
                {editRecord ? "Modify Master Registry Record" : "Add Master Registry Record"}
                <span className="text-[9px] bg-violet-500/10 text-violet-600 px-1.5 py-0.2 rounded font-mono font-bold">File ID: {FILE_IDS[activeTab]}</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg text-muted-foreground hover:bg-muted transition-colors cursor-pointer border-none bg-transparent">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-5 space-y-4">

                {/* 1. Branch Form fields */}
                {activeTab === "branches" && (
                  <div className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-3xs uppercase tracking-wider text-muted-foreground font-black">Branch / Outlet Name</label>
                      <Input value={branchForm.name} onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })} required />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-3xs uppercase tracking-wider text-muted-foreground font-black">Branch Code</label>
                        <Input value={branchForm.code} onChange={(e) => setBranchForm({ ...branchForm, code: e.target.value })} required />
                      </div>
                      <div className="space-y-1">
                        <label className="text-3xs uppercase tracking-wider text-muted-foreground font-black">Branch Type</label>
                        <select
                          value={branchForm.type}
                          onChange={(e) => setBranchForm({ ...branchForm, type: e.target.value })}
                          className="w-full bg-background border border-border text-foreground text-xs rounded-xl px-3 py-2 outline-none font-bold"
                        >
                          <option value="outlet">Outlet (QSR)</option>
                          <option value="warehouse">Warehouse</option>
                          <option value="franchise">Franchise Kitchen</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-3xs uppercase tracking-wider text-muted-foreground font-black">Branch Email</label>
                        <Input value={branchForm.email} onChange={(e) => setBranchForm({ ...branchForm, email: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-3xs uppercase tracking-wider text-muted-foreground font-black">Phone Number</label>
                        <Input value={branchForm.phone} onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })} />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Categories Form fields */}
                {activeTab === "categories" && (
                  <div className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-3xs uppercase tracking-wider text-muted-foreground font-black">Category Label Name</label>
                      <Input value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-3xs uppercase tracking-wider text-muted-foreground font-black">Category Sort Order</label>
                      <Input type="number" value={categoryForm.sort_order} onChange={(e) => setCategoryForm({ ...categoryForm, sort_order: Number(e.target.value) })} required />
                    </div>
                  </div>
                )}

                {/* 3. Products Form fields */}
                {activeTab === "products" && (
                  <div className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-3xs uppercase tracking-wider text-muted-foreground font-black">Product / Dish Name</label>
                      <Input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-3xs uppercase tracking-wider text-muted-foreground font-black">Menu Shortcode</label>
                        <Input value={productForm.code} onChange={(e) => setProductForm({ ...productForm, code: e.target.value })} required />
                      </div>
                      <div className="space-y-1">
                        <label className="text-3xs uppercase tracking-wider text-muted-foreground font-black">Category Mapping</label>
                        <select
                          value={productForm.category}
                          onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                          className="w-full bg-background border border-border text-foreground text-xs rounded-xl px-3 py-2 outline-none font-bold"
                        >
                          {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-3xs uppercase tracking-wider text-muted-foreground font-black">Base Price (₹)</label>
                        <Input type="number" value={productForm.base_price} onChange={(e) => setProductForm({ ...productForm, base_price: Number(e.target.value) })} required />
                      </div>
                      <div className="space-y-1">
                        <label className="text-3xs uppercase tracking-wider text-muted-foreground font-black">Food Dietary Type</label>
                        <select
                          value={productForm.is_vegetarian ? "veg" : "non-veg"}
                          onChange={(e) => setProductForm({ ...productForm, is_vegetarian: e.target.value === "veg" })}
                          className="w-full bg-background border border-border text-foreground text-xs rounded-xl px-3 py-2 outline-none font-bold"
                        >
                          <option value="veg">Vegetarian (Veg)</option>
                          <option value="non-veg">Non-Vegetarian</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Rooms Form fields */}
                {activeTab === "rooms" && (
                  <div className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-3xs uppercase tracking-wider text-muted-foreground font-black">Room Number</label>
                      <Input value={roomForm.room_number} onChange={(e) => setRoomForm({ ...roomForm, room_number: e.target.value })} required />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-3xs uppercase tracking-wider text-muted-foreground font-black">Sharing Capacity (Beds)</label>
                        <Input type="number" value={roomForm.capacity} onChange={(e) => setRoomForm({ ...roomForm, capacity: Number(e.target.value) })} required />
                      </div>
                      <div className="space-y-1">
                        <label className="text-3xs uppercase tracking-wider text-muted-foreground font-black">Room Category Type</label>
                        <select
                          value={roomForm.room_type}
                          onChange={(e) => setRoomForm({ ...roomForm, room_type: e.target.value })}
                          className="w-full bg-background border border-border text-foreground text-xs rounded-xl px-3 py-2 outline-none font-bold"
                        >
                          <option value="single">Single Occupancy</option>
                          <option value="double">Double Sharing</option>
                          <option value="triple">Triple Sharing</option>
                          <option value="sharing">Dorm Sharing</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-3xs uppercase tracking-wider text-muted-foreground font-black">Monthly Rent Rate (₹)</label>
                        <Input type="number" value={roomForm.monthly_rent} onChange={(e) => setRoomForm({ ...roomForm, monthly_rent: Number(e.target.value) })} required />
                      </div>
                      <div className="space-y-1">
                        <label className="text-3xs uppercase tracking-wider text-muted-foreground font-black">Air Conditioning (AC)</label>
                        <select
                          value={roomForm.is_ac ? "ac" : "non-ac"}
                          onChange={(e) => setRoomForm({ ...roomForm, is_ac: e.target.value === "ac" })}
                          className="w-full bg-background border border-border text-foreground text-xs rounded-xl px-3 py-2 outline-none font-bold"
                        >
                          <option value="ac">Air Conditioned (AC)</option>
                          <option value="non-ac">Non-AC Room</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. Roles Form fields */}
                {activeTab === "roles" && (
                  <div className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-3xs uppercase tracking-wider text-muted-foreground font-black">Role Label Name</label>
                      <Input value={roleForm.name} onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })} required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-3xs uppercase tracking-wider text-muted-foreground font-black">Role Authorization Code</label>
                      <Input value={roleForm.code} onChange={(e) => setRoleForm({ ...roleForm, code: e.target.value })} required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-3xs uppercase tracking-wider text-muted-foreground font-black">Description & Privileges Summary</label>
                      <Input value={roleForm.description} onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })} />
                    </div>
                  </div>
                )}

                {/* 6. Users Form fields */}
                {activeTab === "users" && (
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-3xs uppercase tracking-wider text-muted-foreground font-black">First Name</label>
                        <Input value={userForm.first_name} onChange={(e) => setUserForm({ ...userForm, first_name: e.target.value })} required />
                      </div>
                      <div className="space-y-1">
                        <label className="text-3xs uppercase tracking-wider text-muted-foreground font-black">Last Name</label>
                        <Input value={userForm.last_name} onChange={(e) => setUserForm({ ...userForm, last_name: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-3xs uppercase tracking-wider text-muted-foreground font-black">Email Address</label>
                      <Input type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} required />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-3xs uppercase tracking-wider text-muted-foreground font-black">Mobile Number</label>
                        <Input value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-3xs uppercase tracking-wider text-muted-foreground font-black">System Role Profile</label>
                        <select
                          value={userForm.role_code}
                          onChange={(e) => setUserForm({ ...userForm, role_code: e.target.value })}
                          className="w-full bg-background border border-border text-foreground text-xs rounded-xl px-3 py-2 outline-none font-bold"
                        >
                          {roles.map(r => <option key={r.id} value={r.code}>{r.name}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              <div className="flex gap-2 p-4 border-t border-border bg-card/60">
                <Button type="button" variant="outline" className="flex-1 text-xs border-border text-foreground" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 bg-violet-600 hover:bg-violet-700 text-white text-xs border-none flex items-center justify-center gap-1.5">
                  <Save size={13} /> Save Master Record
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default MasterStudioPage;
