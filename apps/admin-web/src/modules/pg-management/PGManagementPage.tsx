import { useState, useMemo, useEffect, useRef } from "react";
import { useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Home, Plus, Search, UserMinus, Phone, Mail, DollarSign, X,
  ShieldCheck, ArrowRight, FileText, CheckCircle2, History, ListFilter,
  Activity, Calendar, Eye, Edit2, MoreVertical, Sparkles, TrendingUp,
  Clock, AlertTriangle, ArrowUpDown, ChevronDown, Check, Trash2, HelpCircle
} from "lucide-react";
import { Button } from "@/shared/ui/primitives/Button";
import { Input } from "@/shared/ui/primitives/Input";
import { Badge } from "@/shared/ui/primitives/Badge";
import { toast } from "sonner";
import { cn } from "@/shared/utils/cn";
import { isMockSession } from "@/shared/utils/dev-mode";
import { mockDB } from "@/shared/utils/mock-db";
import { formatCurrency, formatDate } from "@/shared/utils/formatters";
import { api } from "@/shared/utils/api-client";
import { useAuthStore } from "@/app/providers/auth-store";

interface Resident {
  id: string;
  name: string;
  room: string;
  bed: string;
  rent: number;
  paid_status: "paid" | "partial" | "overdue";
  phone: string;
  email: string;
  joining_date: string;
  agreement_code: string;
  due_amount: number;
  is_active: boolean;
  avatar_color: string;
}

interface ActivityLog {
  id: string;
  description: string;
  time: string;
  amount?: number;
  type: "add" | "receipt" | "agreement" | "system" | "clean";
}

const AVATAR_COLORS = [
  "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "bg-rose-500/10 text-rose-600 dark:text-rose-400",
];

const STATUS_VARIANT = {
  paid: "success" as const,
  partial: "warning" as const,
  overdue: "danger" as const,
};

export function PGManagementPage() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const isMock = isMockSession();
  const selectedBranch = useAuthStore((s: any) => s.selected_branch);

  // Search and Filter State
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "paid" | "partial" | "overdue">("all");
  const [selectedRoomFilter, setSelectedRoomFilter] = useState("All Rooms");
  const [checkedResidents, setCheckedResidents] = useState<string[]>([]);
  const commandInputRef = useRef<HTMLInputElement>(null);

  // Core Data State (Loaded dynamically from mockDB)
  const [residents, setResidents] = useState<Resident[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  // Modals state
  const [showAddForm, setShowAddForm] = useState(false);
  const [showRentModal, setShowRentModal] = useState(false);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [showFineModal, setShowFineModal] = useState(false);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);

  // New Resident Form State
  const [newResident, setNewResident] = useState({
    name: "",
    room: "204",
    bed: "A",
    rent: 8500,
    phone: "",
    email: "",
    joining_date: new Date().toISOString().slice(0, 10),
    agreement_code: `AG-000${Math.floor(100 + Math.random() * 900)}`,
    due_amount: 0,
    paid_status: "paid" as const,
  });

  // Collect Rent Form State
  const [rentCollectionAmount, setRentCollectionAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<"cash" | "upi" | "card">("upi");

  // Agreements State
  const [agreementForm, setAgreementForm] = useState({
    residentId: "",
    durationMonths: 11,
    rentAmount: 8500,
  });

  // Fine Form State
  const [fineForm, setFineForm] = useState({
    residentId: "",
    amount: 500,
    reason: "Late Payment Penalty",
  });

  const [showMastersModal, setShowMastersModal] = useState(false);
  const [masterTab, setMasterTab] = useState<"room" | "bed">("room");

  const navigate = useNavigate();

  // Room Form State
  const [newRoomNumber, setNewRoomNumber] = useState("");
  const [newRoomCategory, setNewRoomCategory] = useState("AC Double");
  const [newRoomFloor, setNewRoomFloor] = useState("1st Floor");
  const [newRoomRent, setNewRoomRent] = useState(8000);
  const [newRoomCapacity, setNewRoomCapacity] = useState(2);
  const [newRoomHasAC, setNewRoomHasAC] = useState(true);

  // Bed Form State
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [newBedCode, setNewBedCode] = useState("");

  // Rooms list dynamically loaded
  const [rooms, setRooms] = useState<any[]>([
    { id: "rm-1", room_number: "101", category: "Non-AC Double", floor: "1st Floor", capacity: 2, rent: 6000, has_ac: false },
    { id: "rm-2", room_number: "102", category: "AC Single", floor: "1st Floor", capacity: 1, rent: 9000, has_ac: true },
    { id: "rm-3", room_number: "201", category: "AC Double", floor: "2nd Floor", capacity: 2, rent: 7500, has_ac: true },
    { id: "rm-4", room_number: "202", category: "Non-AC Double", floor: "2nd Floor", capacity: 2, rent: 6500, has_ac: false },
    { id: "rm-5", room_number: "301", category: "AC Triple", floor: "3rd Floor", capacity: 3, rent: 5500, has_ac: true },
  ]);

  // Auto-sync router path to modal states
  useEffect(() => {
    if (!isMock) return;
    if (currentPath === "/pg/beds") {
      setShowMastersModal(true);
      setMasterTab("bed");
    } else if (currentPath === "/pg/rooms") {
      // Don't show modal, render inline setup view
      setShowMastersModal(false);
    } else if (currentPath === "/pg/residents") {
      setShowAddForm(true);
    } else if (currentPath === "/pg/rent") {
      if (residents.length > 0) {
        setSelectedResident(residents[0]);
        setRentCollectionAmount(residents[0].due_amount > 0 ? residents[0].due_amount : residents[0].rent);
        setShowRentModal(true);
      }
    }
  }, [currentPath, residents, isMock]);

  const handleCloseMasters = () => {
    setShowMastersModal(false);
    if (currentPath.startsWith("/pg/")) {
      navigate({ to: "/pg" });
    }
  };

  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMock) {
      toast.error("Only available in mock mode.");
      return;
    }
    if (!newRoomNumber) return;
    if (!isMock) {
      api.post("/pg/rooms", {
        branch_id: selectedBranch?.id ? Number(selectedBranch.id) : 1,
        floor_id: 1,
        room_number: newRoomNumber.trim(),
        room_type: newRoomCategory,
        capacity: Number(newRoomCapacity),
        monthly_rent: Number(newRoomRent),
      })
      .then(() => {
        toast.success(`Room ${newRoomNumber} saved directly to PostgreSQL database!`);
        setNewRoomNumber("");
        refreshData();
      })
      .catch((err) => toast.error(err?.response?.data?.detail || "Failed to save room to database"));
      return;
    }

    const newRoom = {
      id: `rm-${Date.now()}`,
      room_number: newRoomNumber.trim(),
      category: newRoomCategory,
      floor: newRoomFloor,
      capacity: Number(newRoomCapacity),
      rent: Number(newRoomRent),
      has_ac: newRoomHasAC
    };
    const updated = [...rooms, newRoom];
    mockDB.set("pg_rooms", updated);
    setRooms(updated);
    toast.success(`Room ${newRoomNumber} created successfully!`);
    setNewRoomNumber("");
    refreshData();
  };

  const handleSaveBed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId || !newBedCode) return;
    const bedsList = mockDB.get<any>("pg_beds") || [];
    const newBed = {
      id: `bed-${Date.now()}`,
      room_id: selectedRoomId,
      bed_code: newBedCode.trim(),
      status: "available",
      is_active: true
    };
    mockDB.set("pg_beds", [...bedsList, newBed]);
    toast.success(`Bed ${newBedCode} added to selected room successfully!`);
    setNewBedCode("");
    refreshData();
  };

  // Load and sync database
  const refreshData = () => {
    if (!isMock) {
      const branchId = selectedBranch?.id;
      const params = branchId ? { branch_id: branchId } : {};
      api.get<any[]>("/pg/residents", params)
        .then((res) => {
          if (Array.isArray(res)) {
            const mapped = res.map((r: any, idx: number) => ({
              id: String(r.id),
              name: `${r.first_name || ""} ${r.last_name || ""}`.trim() || r.name || "Resident",
              room: r.room_number || r.room || "101",
              bed: r.bed_code || r.bed || "Bed A",
              rent: Number(r.monthly_rent || r.rent || 0),
              paid_status: r.paid_status || (r.due_amount > 0 ? "overdue" : "paid"),
              phone: r.phone || "",
              email: r.email || "",
              joining_date: r.check_in_date || r.joining_date || new Date().toISOString().slice(0, 10),
              agreement_code: r.agreement_code || `AG-${r.id}`,
              due_amount: Number(r.due_amount || 0),
              is_active: r.is_active ?? true,
              avatar_color: AVATAR_COLORS[idx % AVATAR_COLORS.length]
            }));
            setResidents(mapped);
          }
        })
        .catch(() => setResidents([]));

      api.get<any[]>("/pg/rooms", params)
        .then((res) => {
          if (Array.isArray(res)) setRooms(res);
        })
        .catch(() => {});
      return;
    }

    // Sync residents
    let list = mockDB.get<any>("residents") || [];
    if (list.length === 0) {
      // Seed initial residents if empty
      const initial = [
        {
          id: "r-1",
          name: "Rohit Sharma",
          room: "201",
          bed: "Bed A",
          rent: 7500,
          paid_status: "paid" as const,
          phone: "9876543210",
          email: "rohit@gmail.com",
          joining_date: "2026-01-10",
          agreement_code: "AG-000125",
          due_amount: 0,
          is_active: true,
          avatar_color: AVATAR_COLORS[0],
        },
        {
          id: "r-2",
          name: "Neha Verma",
          room: "101",
          bed: "Bed B",
          rent: 8000,
          paid_status: "partial" as const,
          phone: "9876543211",
          email: "neha@gmail.com",
          joining_date: "2026-03-15",
          agreement_code: "AG-000126",
          due_amount: 2000,
          is_active: true,
          avatar_color: AVATAR_COLORS[1],
        },
        {
          id: "r-3",
          name: "Amit Kumar",
          room: "202",
          bed: "Bed A",
          rent: 7000,
          paid_status: "overdue" as const,
          phone: "9876543212",
          email: "amit@gmail.com",
          joining_date: "2026-02-01",
          agreement_code: "AG-000127",
          due_amount: 7000,
          is_active: true,
          avatar_color: AVATAR_COLORS[2],
        },
        {
          id: "r-4",
          name: "Pooja Singh",
          room: "102",
          bed: "Bed B",
          rent: 6500,
          paid_status: "paid" as const,
          phone: "9876543213",
          email: "pooja@gmail.com",
          joining_date: "2026-05-01",
          agreement_code: "AG-000128",
          due_amount: 0,
          is_active: true,
          avatar_color: AVATAR_COLORS[3],
        },
        {
          id: "r-5",
          name: "Vikram Patel",
          room: "301",
          bed: "Bed A",
          rent: 9000,
          paid_status: "overdue" as const,
          phone: "9876543214",
          email: "vikram@gmail.com",
          joining_date: "2026-01-01",
          agreement_code: "AG-000129",
          due_amount: 9000,
          is_active: false,
          avatar_color: AVATAR_COLORS[4],
        }
      ];
      mockDB.set("residents", initial);
      list = initial;
    }
    setResidents(list);

    // Sync activities
    let logList = mockDB.get<any>("pg_activities") || [];
    if (logList.length === 0) {
      const initialLogs = [
        { id: "log-1", description: "Sumit Singh added new resident Rohit Sharma", time: "2 min ago", type: "add" },
        { id: "log-2", description: "Receipt RC000125 collected from Neha Verma", time: "5 min ago", amount: 5000, type: "receipt" },
        { id: "log-3", description: "Agreement renewed for Amit Kumar (Room 202)", time: "2 hours ago", type: "agreement" },
        { id: "log-4", description: "Payment reminder notification sent to 4 overdue residents", time: "2 hours ago", type: "system" },
        { id: "log-5", description: "Room 201 cleaned and marked ready for occupancy check-in", time: "3 hours ago", type: "clean" }
      ];
      mockDB.set("pg_activities", initialLogs);
      logList = initialLogs;
    }
    setActivities(logList);
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Keyboard listener for focusing search command bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        commandInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setSearch("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filtered residents list
  const filteredResidents = useMemo(() => {
    return residents.filter((r) => {
      const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.room.includes(search) ||
        r.phone.includes(search) ||
        r.agreement_code.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = activeFilter === "all" || r.paid_status === activeFilter;
      const matchesRoom = selectedRoomFilter === "All Rooms" || `Room ${r.room}` === selectedRoomFilter;
      return matchesSearch && matchesStatus && matchesRoom;
    });
  }, [search, activeFilter, selectedRoomFilter, residents]);

  // List of rooms based on active residents
  const roomsList = useMemo(() => {
    const rooms = new Set(residents.map(r => `Room ${r.room}`));
    return ["All Rooms", ...Array.from(rooms).sort()];
  }, [residents]);

  // Calculations for KPI Metrics Row
  const kpiStats = useMemo(() => {
    const totalBeds = 240;
    const activeOccupants = residents.filter(r => r.is_active).length;
    const occupancyPercentage = ((activeOccupants / totalBeds) * 100).toFixed(1);

    const totalCollection = residents
      .filter(r => r.paid_status === "paid")
      .reduce((sum, r) => sum + r.rent, 0) +
      residents.filter(r => r.paid_status === "partial").reduce((sum, r) => sum + (r.rent - r.due_amount), 0);

    const dueAccountsTotal = residents.reduce((sum, r) => sum + r.due_amount, 0);
    const overdueCount = residents.filter(r => r.paid_status === "overdue").length;
    const vacantBeds = totalBeds - activeOccupants;
    const upcomingCheckOut = residents.filter(r => !r.is_active).length;

    return {
      occupancyPercentage,
      activeOccupants,
      totalBeds,
      totalCollection,
      dueAccountsTotal,
      overdueCount,
      vacantBeds,
      upcomingCheckOut
    };
  }, [residents]);

  // Handle Register Resident submission
  const handleRegisterResident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResident.name || !newResident.phone) {
      toast.error("Please fill in the full name and mobile number.");
      return;
    }

    if (!isMock) {
      const nameParts = newResident.name.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || "Resident";
      api.post("/pg/residents", {
        branch_id: selectedBranch?.id ? Number(selectedBranch.id) : 1,
        bed_id: 1,
        first_name: firstName,
        last_name: lastName,
        phone: newResident.phone,
        email: newResident.email || `${firstName.toLowerCase()}@example.com`,
        check_in_date: newResident.joining_date,
        monthly_rent: Number(newResident.rent),
      })
      .then(() => {
        toast.success(`Resident ${newResident.name} registered directly into PostgreSQL database!`);
        setShowAddForm(false);
        refreshData();
      })
      .catch((err) => toast.error(err?.response?.data?.detail || "Failed to register resident"));
      return;
    }

    const colorIdx = Math.floor(Math.random() * AVATAR_COLORS.length);
    const createdResident: Resident = {
      id: `r-${Date.now()}`,
      name: newResident.name,
      room: newResident.room,
      bed: `Bed ${newResident.bed}`,
      rent: Number(newResident.rent),
      paid_status: newResident.paid_status,
      phone: newResident.phone,
      email: newResident.email || "resident@baithak.com",
      joining_date: newResident.joining_date,
      agreement_code: newResident.agreement_code,
      due_amount: newResident.due_amount,
      is_active: true,
      avatar_color: AVATAR_COLORS[colorIdx]
    };

    // Save to DB
    const list = mockDB.get<any>("residents") || [];
    mockDB.set("residents", [createdResident, ...list]);

    // Save activity
    const activeList = mockDB.get<any>("pg_activities") || [];
    const newAct = {
      id: `log-${Date.now()}`,
      description: `Manager registered new resident ${newResident.name} to Room ${newResident.room}`,
      time: "Just now",
      type: "add" as const
    };
    mockDB.set("pg_activities", [newAct, ...activeList]);

    toast.success(`Resident ${newResident.name} registered to Bed ${newResident.bed}!`);
    refreshData();
    setShowAddForm(false);

    // Reset Form
    setNewResident({
      name: "",
      room: "204",
      bed: "A",
      rent: 8500,
      phone: "",
      email: "",
      joining_date: new Date().toISOString().slice(0, 10),
      agreement_code: `AG-000${Math.floor(100 + Math.random() * 900)}`,
      due_amount: 0,
      paid_status: "paid",
    });
  };

  // Open Collect Rent modal
  const triggerRentModal = (res: Resident) => {
    setSelectedResident(res);
    setRentCollectionAmount(res.due_amount > 0 ? res.due_amount : res.rent);
    setShowRentModal(true);
  };

  // Save Rent Collection
  const submitRentCollection = () => {
    if (!selectedResident) return;

    const list = mockDB.get<any>("residents") || [];
    const updated = list.map((r: any) => {
      if (r.id === selectedResident.id) {
        return {
          ...r,
          paid_status: "paid" as const,
          due_amount: 0
        };
      }
      return r;
    });
    mockDB.set("residents", updated);

    // Save activity log
    const activeList = mockDB.get<any>("pg_activities") || [];
    const newAct = {
      id: `log-${Date.now()}`,
      description: `Receipt collected from ${selectedResident.name} via ${paymentMode.toUpperCase()}`,
      time: "Just now",
      amount: rentCollectionAmount,
      type: "receipt" as const
    };
    mockDB.set("pg_activities", [newAct, ...activeList]);

    toast.success(`Collected ₹${rentCollectionAmount} from ${selectedResident.name}`);
    refreshData();
    setShowRentModal(false);
  };

  // Open agreement renewal modal
  const triggerAgreementModal = (res: Resident) => {
    setSelectedResident(res);
    setAgreementForm({
      residentId: res.id,
      durationMonths: 11,
      rentAmount: res.rent
    });
    setShowAgreementModal(true);
  };

  // Save Agreement Renewal
  const submitAgreementRenewal = () => {
    if (!selectedResident) return;

    // Update agreement code
    const newCode = `AG-000${Math.floor(200 + Math.random() * 800)}`;
    const list = mockDB.get<any>("residents") || [];
    const updated = list.map((r: any) => {
      if (r.id === selectedResident.id) {
        return { ...r, agreement_code: newCode, rent: Number(agreementForm.rentAmount) };
      }
      return r;
    });
    mockDB.set("residents", updated);

    // Add activity log
    const activeList = mockDB.get<any>("pg_activities") || [];
    const newAct = {
      id: `log-${Date.now()}`,
      description: `Agreement renewed for ${selectedResident.name} for ${agreementForm.durationMonths} months`,
      time: "Just now",
      type: "agreement" as const
    };
    mockDB.set("pg_activities", [newAct, ...activeList]);

    toast.success(`Agreement renewed! New code: ${newCode}`);
    refreshData();
    setShowAgreementModal(false);
  };

  // Open Fine Modal
  const triggerFineModal = (res: Resident) => {
    setSelectedResident(res);
    setFineForm({
      residentId: res.id,
      amount: 500,
      reason: "Late Payment Penalty"
    });
    setShowFineModal(true);
  };

  // Save Fine Posting
  const submitFinePosting = () => {
    if (!selectedResident) return;

    const list = mockDB.get<any>("residents") || [];
    const updated = list.map((r: any) => {
      if (r.id === selectedResident.id) {
        const nextDue = r.due_amount + Number(fineForm.amount);
        return {
          ...r,
          due_amount: nextDue,
          paid_status: nextDue >= r.rent ? ("overdue" as const) : ("partial" as const)
        };
      }
      return r;
    });
    mockDB.set("residents", updated);

    // Add activity log
    const activeList = mockDB.get<any>("pg_activities") || [];
    const newAct = {
      id: `log-${Date.now()}`,
      description: `Posted penalty charge of ₹${fineForm.amount} on ${selectedResident.name} (${fineForm.reason})`,
      time: "Just now",
      type: "system" as const
    };
    mockDB.set("pg_activities", [newAct, ...activeList]);

    toast.warning(`Posted charge of ₹${fineForm.amount} to ${selectedResident.name}`);
    refreshData();
    setShowFineModal(false);
  };

  // Delete Resident
  const handleDeleteResident = (resId: string, name: string) => {
    const list = mockDB.get<any>("residents") || [];
    mockDB.set("residents", list.filter((r: any) => r.id !== resId));

    // Save activity
    const activeList = mockDB.get<any>("pg_activities") || [];
    const newAct = {
      id: `log-${Date.now()}`,
      description: `Resident ${name} checked out / removed from database`,
      time: "Just now",
      type: "system" as const
    };
    mockDB.set("pg_activities", [newAct, ...activeList]);

    toast.info(`Resident ${name} removed`);
    refreshData();
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setCheckedResidents(filteredResidents.map(r => r.id));
    } else {
      setCheckedResidents([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setCheckedResidents(prev => [...prev, id]);
    } else {
      setCheckedResidents(prev => prev.filter(rId => rId !== id));
    }
  };

  // Quick Action Buttons click helper
  const handleQuickAction = (actionType: string) => {
    if (actionType === "add") {
      setShowAddForm(true);
    } else if (actionType === "receipt") {
      if (checkedResidents.length > 0) {
        const targetRes = residents.find(r => r.id === checkedResidents[0]);
        if (targetRes) triggerRentModal(targetRes);
      } else {
        toast.info("Please select a resident from the grid first to apply quick receipt.");
      }
    } else if (actionType === "agreement") {
      if (checkedResidents.length > 0) {
        const targetRes = residents.find(r => r.id === checkedResidents[0]);
        if (targetRes) triggerAgreementModal(targetRes);
      } else {
        toast.info("Please select a resident from the grid to renew agreement.");
      }
    } else if (actionType === "fine") {
      if (checkedResidents.length > 0) {
        const targetRes = residents.find(r => r.id === checkedResidents[0]);
        if (targetRes) triggerFineModal(targetRes);
      } else {
        toast.info("Please select a resident from the grid to post charges.");
      }
    } else {
      toast.info("This quick action requires metadata configuration.");
    }
  };

  // Mock list of beds for /pg/beds sub-view
  const pgBedsList = useMemo(() => {
    return [
      { id: "b-1", room: "101", bed: "Bed A", status: "Occupied", resident: "Rahul Sharma", rate: 8500 },
      { id: "b-2", room: "101", bed: "Bed B", status: "Available", resident: null, rate: 8500 },
      { id: "b-3", room: "102", bed: "Bed A", status: "Occupied", resident: "Amit Patel", rate: 9000 },
      { id: "b-4", room: "102", bed: "Bed B", status: "Occupied", resident: "Karan Singh", rate: 9000 },
      { id: "b-5", room: "103", bed: "Bed A", status: "Available", resident: null, rate: 7500 },
      { id: "b-6", room: "103", bed: "Bed B", status: "Available", resident: null, rate: 7500 },
    ];
  }, []);

  // Mock ledger listings for /pg/ledger sub-view
  const rentLedger = useMemo(() => {
    const allInvoices = mockDB.get<any>("invoices") || [];
    return allInvoices.filter((i: any) => i.number.startsWith("REC-") || i.number.startsWith("INV-ROOM-") || i.customer.includes("Demo") || i.amount === 8500 || i.amount === 9000);
  }, []);

  // ─── Sub-views Routing Bypasses ────────────────────────────
  if (currentPath === "/pg/rooms") {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6 bg-background text-foreground min-h-[calc(100vh-60px)] transition-colors duration-300 animate-in fade-in">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h1 className="text-xl font-display font-extrabold text-foreground flex items-center gap-2">
              <Home className="text-primary" size={20} />
              Room Configuration Setup
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5 font-semibold">Manage physical room numbers, capacity levels, and base monthly rent</p>
          </div>
          <Button
            onClick={() => {
              setShowMastersModal(true);
              setMasterTab("room");
            }}
            className="bg-primary hover:bg-primary/95 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl cursor-pointer border-none"
          >
            Add New PG Room
          </Button>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/80 text-[10px] font-black uppercase text-muted-foreground">
                <th className="py-2.5">Room Number</th>
                <th className="py-2.5">Category</th>
                <th className="py-2.5">Floor Level</th>
                <th className="py-2.5 text-center">Bed Capacity</th>
                <th className="py-2.5 text-right">Base Monthly Rent</th>
                <th className="py-2.5 text-center">AC Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-semibold text-muted-foreground">
              {rooms.map((rm) => (
                <tr key={rm.id} className="hover:bg-muted/10">
                  <td className="py-3 font-display font-bold text-foreground">Room {rm.room_number}</td>
                  <td className="py-3 text-primary uppercase text-[10px]">{rm.category}</td>
                  <td className="py-3">{rm.floor || "1st Floor"}</td>
                  <td className="py-3 text-center">{rm.capacity} Beds</td>
                  <td className="py-3 text-right text-foreground font-mono font-bold">₹{rm.rent.toLocaleString()}</td>
                  <td className="py-3 text-center">
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase",
                      rm.has_ac ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
                    )}>
                      {rm.has_ac ? "AC" : "Non-AC"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (currentPath === "/pg/beds") {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6 bg-background text-foreground min-h-[calc(100vh-60px)] transition-colors duration-300 animate-in fade-in">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h1 className="text-xl font-display font-extrabold text-foreground flex items-center gap-2">
              <Home className="text-primary" size={20} />
              Bed & Room Configuration
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Physical bed inventory allocation layout</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {pgBedsList.map((b) => (
            <div key={b.id} className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-between h-[120px]">
              <div className="flex items-center justify-between w-full">
                <span className="font-display font-black text-sm text-foreground">Room {b.room} - {b.bed}</span>
                <Badge className={cn("text-[9px] font-black uppercase", b.status === "Occupied" ? "bg-primary/10 text-primary" : "bg-success/10 text-success")}>
                  {b.status}
                </Badge>
              </div>

              <div className="space-y-1 font-semibold">
                <p className="text-[10px] text-muted-foreground">{b.resident ? `Occupant: ${b.resident}` : "Vacant Bed"}</p>
                <p className="text-xs font-black text-primary">{formatCurrency(b.rate)}/month</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (currentPath === "/pg/ledger") {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6 bg-background text-foreground min-h-[calc(100vh-60px)] transition-colors duration-300 animate-in fade-in">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h1 className="text-xl font-display font-extrabold text-foreground flex items-center gap-2">
              <History className="text-primary" size={20} />
              Resident Account Ledger
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Rent posting ledger journal</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/80 text-[10px] font-black uppercase text-muted-foreground">
                <th className="py-2.5">Receipt No</th>
                <th className="py-2.5">Date</th>
                <th className="py-2.5">Resident</th>
                <th className="py-2.5 text-center">Status</th>
                <th className="py-2.5 text-right">Amount Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-semibold text-muted-foreground">
              {rentLedger.map((rl: any) => (
                <tr key={rl.id || rl.number} className="hover:bg-muted/10">
                  <td className="py-3 font-mono text-[10px] text-foreground">{rl.number}</td>
                  <td className="py-3">{rl.date}</td>
                  <td className="py-3 text-foreground">{rl.customer}</td>
                  <td className="py-3 text-center">
                    <span className="bg-success/15 text-success text-[9px] font-black px-2 py-0.5 rounded-full uppercase">Paid</span>
                  </td>
                  <td className="py-3 text-right text-foreground font-bold">{formatCurrency(rl.amount)}</td>
                </tr>
              ))}
              {rentLedger.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">No recent receipts generated.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ─── MAIN PG MANAGEMENT WORKSPACE VIEW ──────────────────────
  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 bg-background text-foreground min-h-[calc(100vh-60px)] transition-colors duration-300 animate-in fade-in select-none">

      {/* SECTION 1: Workspace Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 text-3xs font-black uppercase tracking-wider text-muted-foreground">
            <span>Ecosystem Master</span>
            <span>/</span>
            <span>PG Workspace</span>
            <span className="text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded">File ID: PG001</span>
          </div>
          <h1 className="text-xl font-display font-black text-foreground flex items-center gap-2 mt-1">
            <Home size={22} className="text-violet-500" />
            PG / Hostel Management Workspace
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-card border border-border rounded-xl px-3 py-1.5 text-2xs font-bold text-foreground flex items-center gap-2 shadow-2xs">
            <Calendar size={13} className="text-violet-500" />
            <span>Today: 15 May 2026</span>
          </div>
          <select
            value={selectedRoomFilter}
            onChange={(e) => setSelectedRoomFilter(e.target.value)}
            className="bg-card border border-border text-foreground text-2xs font-bold rounded-xl px-3 py-1.5 outline-none cursor-pointer shadow-2xs"
          >
            <option value="All Rooms">All Rooms</option>
            {roomsList.filter(r => r !== "All Rooms").map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <Button variant="outline" className="border-border text-foreground hover:bg-muted font-bold text-2xs shadow-2xs flex items-center gap-1.5">
            <ListFilter size={13} /> Filters
          </Button>
          <button className="w-8 h-8 rounded-lg bg-card border border-border text-foreground hover:bg-muted flex items-center justify-center transition-colors shadow-2xs cursor-pointer">
            <MoreVertical size={14} />
          </button>
        </div>
      </div>

      {/* SECTION 2: Global Command Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
        <input
          ref={commandInputRef}
          type="text"
          placeholder="Search residents, rooms, receipts, agreements... (Ctrl + K or / to focus)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-card border border-border focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl pl-10 pr-4 py-3 text-xs font-semibold text-foreground outline-none transition-all shadow-2xs placeholder:text-muted-foreground"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* SECTION 3: KPI Metrics Row (5 cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">

        {/* Metric 1 */}
        <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between shadow-2xs">
          <div className="space-y-1">
            <p className="text-3xs uppercase tracking-wider text-muted-foreground font-black">Total Occupancy</p>
            <h3 className="text-lg font-black text-foreground font-display">{kpiStats.occupancyPercentage}%</h3>
            <p className="text-[9px] text-muted-foreground font-bold">{kpiStats.activeOccupants} / {kpiStats.totalBeds} Beds occupied</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
            <Activity size={16} />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between shadow-2xs">
          <div className="space-y-1">
            <p className="text-3xs uppercase tracking-wider text-muted-foreground font-black">Collection (May)</p>
            <h3 className="text-lg font-black text-foreground font-display">₹{kpiStats.totalCollection.toLocaleString()}</h3>
            <p className="text-[9px] text-emerald-500 font-bold flex items-center gap-0.5">
              <TrendingUp size={10} /> +12.4% <span className="text-muted-foreground font-normal">vs Apr</span>
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <DollarSign size={16} />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between shadow-2xs">
          <div className="space-y-1">
            <p className="text-3xs uppercase tracking-wider text-muted-foreground font-black">Due Rent Accounts</p>
            <h3 className="text-lg font-black text-foreground font-display">₹{kpiStats.dueAccountsTotal.toLocaleString()}</h3>
            <p className="text-[9px] text-rose-500 font-bold">{kpiStats.overdueCount} Overdue accounts</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertTriangle size={16} />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between shadow-2xs">
          <div className="space-y-1">
            <p className="text-3xs uppercase tracking-wider text-muted-foreground font-black">Vacant Beds</p>
            <h3 className="text-lg font-black text-foreground font-display">{kpiStats.vacantBeds}</h3>
            <p className="text-[9px] text-muted-foreground font-bold">In 18 distinct rooms</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Home size={16} />
          </div>
        </div>

        {/* Metric 5 */}
        <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between shadow-2xs">
          <div className="space-y-1">
            <p className="text-3xs uppercase tracking-wider text-muted-foreground font-black">Upcoming Checkout</p>
            <h3 className="text-lg font-black text-foreground font-display">{kpiStats.upcomingCheckOut}</h3>
            <p className="text-[9px] text-muted-foreground font-bold">Scheduled in next 7 days</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Calendar size={16} />
          </div>
        </div>

      </div>

      {/* SECTION 4: Quick Actions Toolbar */}
      <div className="bg-card border border-border rounded-2xl p-3.5 flex items-center gap-2 flex-wrap shadow-2xs">
        <span className="text-3xs font-black uppercase text-muted-foreground tracking-wider mr-2">Quick Actions:</span>
        <Button
          onClick={() => handleQuickAction("add")}
          className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-3xs px-3.5 py-1.5 rounded-xl border-none shadow-2xs flex items-center gap-1 cursor-pointer"
        >
          <Plus size={11} /> Add Resident
        </Button>
        <Button
          onClick={() => handleQuickAction("agreement")}
          className="bg-card hover:bg-muted border border-border text-foreground font-bold text-3xs px-3.5 py-1.5 rounded-xl shadow-2xs flex items-center gap-1 cursor-pointer"
        >
          <FileText size={11} className="text-violet-500" /> New Agreement
        </Button>
        <Button
          onClick={() => handleQuickAction("receipt")}
          className="bg-card hover:bg-muted border border-border text-foreground font-bold text-3xs px-3.5 py-1.5 rounded-xl shadow-2xs flex items-center gap-1 cursor-pointer"
        >
          <DollarSign size={11} className="text-emerald-500" /> Add Receipt
        </Button>
        <Button
          onClick={() => handleQuickAction("payment")}
          className="bg-card hover:bg-muted border border-border text-foreground font-bold text-3xs px-3.5 py-1.5 rounded-xl shadow-2xs flex items-center gap-1 cursor-pointer"
        >
          <CheckCircle2 size={11} className="text-blue-500" /> Receive Payment
        </Button>
        <Button
          onClick={() => handleQuickAction("shift")}
          className="bg-card hover:bg-muted border border-border text-foreground font-bold text-3xs px-3.5 py-1.5 rounded-xl shadow-2xs flex items-center gap-1 cursor-pointer"
        >
          <ArrowRight size={11} className="text-amber-500" /> Bed / Room Shift
        </Button>
        <Button
          onClick={() => handleQuickAction("fine")}
          className="bg-card hover:bg-muted border border-border text-foreground font-bold text-3xs px-3.5 py-1.5 rounded-xl shadow-2xs flex items-center gap-1 cursor-pointer"
        >
          <AlertTriangle size={11} className="text-rose-500" /> Add Charge / Fine
        </Button>
        <Button
          onClick={() => setShowMastersModal(true)}
          className="bg-card hover:bg-muted border border-border text-foreground font-bold text-3xs px-3.5 py-1.5 rounded-xl shadow-2xs flex items-center gap-1 cursor-pointer"
        >
          <Home size={11} className="text-indigo-500" /> Configure Rooms & Beds
        </Button>
        <Button
          onClick={() => handleQuickAction("more")}
          className="bg-card hover:bg-muted border border-border text-foreground font-bold text-3xs px-3.5 py-1.5 rounded-xl shadow-2xs flex items-center gap-1 cursor-pointer ml-auto"
        >
          More Actions <ChevronDown size={11} />
        </Button>
      </div>

      {/* SECTION 5: AI Insights, Radial Overview, and Recent Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* 5.1 AI Insights & Alerts */}
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3.5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h3 className="text-2xs font-extrabold uppercase text-foreground tracking-wider flex items-center gap-1.5">
              <Sparkles size={13} className="text-violet-500 animate-pulse" /> AI Insights & Alerts
            </h3>
            <button className="text-[10px] text-violet-600 dark:text-violet-400 font-bold hover:underline cursor-pointer">View All</button>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[220px] scrollbar-thin text-3xs">
            {/* Alert 1 */}
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl flex gap-2">
              <AlertTriangle size={14} className="text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-rose-700 dark:text-rose-400">4 rent payments are overdue</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">Total outstanding overdue sum: ₹{kpiStats.dueAccountsTotal.toLocaleString()}.</p>
              </div>
            </div>
            {/* Alert 2 */}
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-2">
              <Clock size={14} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-amber-700 dark:text-amber-400">2 agreements are expiring in next 7 days</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">Take immediate renew actions for Room 202 and Room 102.</p>
              </div>
            </div>
            {/* Alert 3 */}
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl flex gap-2">
              <Activity size={14} className="text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-blue-700 dark:text-blue-400">Occupancy is down by 8% this month</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">18 vacant rooms require active lead booking generation.</p>
              </div>
            </div>
            {/* Alert 4 */}
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex gap-2">
              <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-emerald-700 dark:text-emerald-400">Collection is 12% higher than last month</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">Excellent job! Settle pending dues to hit monthly milestone targets.</p>
              </div>
            </div>
          </div>
        </div>

        {/* 5.2 Circular Radial Occupancy Overview */}
        <div className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-between shadow-2xs items-center text-center">
          <div className="flex items-center justify-between border-b border-border pb-2 w-full text-left">
            <h3 className="text-2xs font-extrabold uppercase text-foreground tracking-wider">
              Occupancy Overview
            </h3>
            <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black px-2 py-0.5 rounded">This Month</span>
          </div>

          <div className="relative w-36 h-36 flex items-center justify-center my-3">
            {/* Radial SVG indicator */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--border)" strokeWidth="8" className="opacity-40" />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#10B981"
                strokeWidth="8"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * Number(kpiStats.occupancyPercentage)) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col justify-center items-center">
              <span className="text-xl font-black text-foreground font-display leading-none">{kpiStats.occupancyPercentage}%</span>
              <span className="text-[9px] text-muted-foreground uppercase font-bold mt-1">Occupied</span>
            </div>
          </div>

          <div className="flex gap-4 w-full text-3xs font-bold text-muted-foreground justify-center border-t border-border pt-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>Occupied: <strong className="text-foreground">{kpiStats.activeOccupants}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-border inline-block" />
              <span>Vacant: <strong className="text-foreground">{kpiStats.vacantBeds}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>Total Beds: <strong className="text-foreground">{kpiStats.totalBeds}</strong></span>
            </div>
          </div>
        </div>

        {/* 5.3 Recent Activities Timeline */}
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3.5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h3 className="text-2xs font-extrabold uppercase text-foreground tracking-wider flex items-center gap-1.5">
              <Clock size={13} className="text-violet-500" /> Recent Activities
            </h3>
            <button className="text-[10px] text-violet-600 dark:text-violet-400 font-bold hover:underline cursor-pointer">View All</button>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[220px] pr-1 scrollbar-thin text-3xs relative">
            <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-border/60" />
            <div className="space-y-4 relative pl-7">
              {activities.map((act) => {
                let actColor = "bg-violet-500";
                if (act.type === "receipt") actColor = "bg-emerald-500";
                if (act.type === "agreement") actColor = "bg-blue-500";
                if (act.type === "system") actColor = "bg-rose-500";
                if (act.type === "clean") actColor = "bg-amber-500";
                return (
                  <div key={act.id} className="relative flex justify-between items-start gap-2">
                    <span className={cn("absolute -left-[23px] w-2 h-2 rounded-full border border-card mt-1", actColor)} />
                    <div className="flex-1 min-w-0 pr-1">
                      <p className="font-semibold text-foreground/80 leading-snug">{act.description}</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">{act.time}</p>
                    </div>
                    {act.amount && (
                      <span className="font-black text-emerald-600 dark:text-emerald-400 shrink-0 font-mono text-4xs">
                        +₹{act.amount}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* SECTION 6: Residents Grid Ledger */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-2xs overflow-hidden flex flex-col">
        <div className="flex items-center justify-between border-b border-border/80 pb-3.5 mb-3 flex-wrap gap-2">
          <h3 className="text-2xs font-extrabold uppercase text-foreground tracking-wider flex items-center gap-1.5">
            <ListFilter size={13} className="text-violet-500" /> Residents Ledger Grid ({filteredResidents.length} Residents)
          </h3>
          <div className="flex items-center gap-1.5">
            {checkedResidents.length > 0 && (
              <Button
                onClick={() => {
                  if (confirm(`Are you sure you want to checkout/remove ${checkedResidents.length} residents?`)) {
                    checkedResidents.forEach(id => {
                      const res = residents.find(r => r.id === id);
                      if (res) handleDeleteResident(res.id, res.name);
                    });
                    setCheckedResidents([]);
                  }
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-3xs px-2.5 py-1 rounded-xl border-none shadow-2xs flex items-center gap-1 cursor-pointer"
              >
                <Trash2 size={11} /> Delete Selected ({checkedResidents.length})
              </Button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/80 text-[10px] font-black uppercase text-muted-foreground">
                <th className="py-2.5 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={filteredResidents.length > 0 && checkedResidents.length === filteredResidents.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="cursor-pointer rounded border-border"
                  />
                </th>
                <th className="py-2.5">Resident Name</th>
                <th className="py-2.5">Room & Bed</th>
                <th className="py-2.5">Mobile</th>
                <th className="py-2.5">Agreement Code</th>
                <th className="py-2.5 text-right">Rent</th>
                <th className="py-2.5 text-center">Status</th>
                <th className="py-2.5 text-right">Due Amount</th>
                <th className="py-2.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-semibold text-muted-foreground">
              {filteredResidents.map((res) => {
                const isChecked = checkedResidents.includes(res.id);
                return (
                  <tr key={res.id} className={cn("hover:bg-muted/30 transition-colors", isChecked ? "bg-violet-500/5" : "")}>
                    <td className="py-3 px-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => handleSelectOne(res.id, e.target.checked)}
                        className="cursor-pointer rounded border-border"
                      />
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-3xs font-black shrink-0", res.avatar_color)}>
                          {res.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{res.name}</p>
                          <span className={cn("text-[8px] font-black uppercase px-1 py-0.2 rounded-sm inline-block mt-0.5", res.is_active ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-slate-500/10 text-slate-500")}>
                            {res.is_active ? "Active" : "Checkout"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 font-mono text-[10px] text-foreground">{res.room} - {res.bed}</td>
                    <td className="py-3 font-medium">{res.phone}</td>
                    <td className="py-3">
                      <span className="font-mono text-4xs bg-background border border-border px-2 py-0.5 rounded text-foreground/80">{res.agreement_code}</span>
                    </td>
                    <td className="py-3 text-right text-foreground font-bold font-mono text-[10px]">₹{res.rent.toLocaleString()}</td>
                    <td className="py-3 text-center">
                      <Badge variant={STATUS_VARIANT[res.paid_status]} className="text-[8px] font-black uppercase tracking-wider py-0.5 px-2">
                        {res.paid_status}
                      </Badge>
                    </td>
                    <td className={cn("py-3 text-right font-bold font-mono text-[10px]", res.due_amount > 0 ? "text-rose-600 dark:text-rose-400" : "text-foreground/80")}>
                      ₹{res.due_amount.toLocaleString()}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => triggerRentModal(res)}
                          title="Collect Rent"
                          className="w-7 h-7 rounded-lg hover:bg-muted border border-border text-foreground flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <DollarSign size={12} className="text-emerald-500" />
                        </button>
                        <button
                          onClick={() => triggerAgreementModal(res)}
                          title="Renew Agreement"
                          className="w-7 h-7 rounded-lg hover:bg-muted border border-border text-foreground flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <FileText size={12} className="text-blue-500" />
                        </button>
                        <button
                          onClick={() => triggerFineModal(res)}
                          title="Add Fine / Charges"
                          className="w-7 h-7 rounded-lg hover:bg-muted border border-border text-foreground flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <AlertTriangle size={12} className="text-rose-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredResidents.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-muted-foreground font-bold leading-relaxed">
                    <Home size={22} className="text-muted-foreground/30 mx-auto mb-2" />
                    No residents match search filters.<br />
                    <span className="text-[10px] text-muted-foreground/60 font-semibold font-sans mt-1 inline-block">Use Command Bar or change Room filters.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Resident Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border bg-card/60">
              <h3 className="font-display font-black text-foreground text-sm flex items-center gap-1.5">
                <Plus size={16} className="text-violet-500" />
                Register New Resident (PG001)
              </h3>
              <button onClick={() => setShowAddForm(false)} className="p-1 rounded-lg text-muted-foreground hover:bg-muted transition-colors cursor-pointer border-none bg-transparent">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleRegisterResident}>
              <div className="p-5 space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-2xs font-semibold text-muted-foreground">Resident Full Name</label>
                  <Input
                    value={newResident.name}
                    onChange={(e) => setNewResident({ ...newResident, name: e.target.value })}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-2xs font-semibold text-muted-foreground">Room Number</label>
                    <Input
                      value={newResident.room}
                      onChange={(e) => setNewResident({ ...newResident, room: e.target.value })}
                      placeholder="e.g. 204"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-2xs font-semibold text-muted-foreground">Bed ID (A/B/C)</label>
                    <Input
                      value={newResident.bed}
                      onChange={(e) => setNewResident({ ...newResident, bed: e.target.value })}
                      placeholder="e.g. A"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-2xs font-semibold text-muted-foreground">Monthly Rent (₹)</label>
                    <Input
                      type="number"
                      value={newResident.rent}
                      onChange={(e) => setNewResident({ ...newResident, rent: Number(e.target.value) })}
                      placeholder="e.g. 8500"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-2xs font-semibold text-muted-foreground">Check-in Date</label>
                    <Input
                      type="date"
                      value={newResident.joining_date}
                      onChange={(e) => setNewResident({ ...newResident, joining_date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-2xs font-semibold text-muted-foreground">Mobile Number</label>
                    <Input
                      value={newResident.phone}
                      onChange={(e) => setNewResident({ ...newResident, phone: e.target.value })}
                      placeholder="e.g. 9876543210"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-2xs font-semibold text-muted-foreground">Email Address</label>
                    <Input
                      type="email"
                      value={newResident.email}
                      onChange={(e) => setNewResident({ ...newResident, email: e.target.value })}
                      placeholder="e.g. resident@gmail.com"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 p-4 border-t border-border bg-card/60">
                <Button type="button" variant="outline" className="flex-1 text-xs border-border text-foreground" onClick={() => setShowAddForm(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 bg-violet-600 hover:bg-violet-700 text-white text-xs border-none">Register Resident</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Collect Rent Modal */}
      {showRentModal && selectedResident && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-sm rounded-2xl shadow-xl border border-border overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border bg-card/60">
              <h3 className="font-display font-black text-foreground text-sm flex items-center gap-1.5">
                <DollarSign size={16} className="text-emerald-500" />
                Add Receipt (PGR001)
              </h3>
              <button onClick={() => setShowRentModal(false)} className="p-1 rounded-lg text-muted-foreground hover:bg-muted transition-colors cursor-pointer border-none bg-transparent">
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-4 bg-background border border-border rounded-xl text-2xs space-y-2 font-semibold">
                <div className="flex justify-between"><span>Resident Name:</span><strong className="text-foreground">{selectedResident.name}</strong></div>
                <div className="flex justify-between"><span>Room Code:</span><strong className="text-foreground">{selectedResident.room} - {selectedResident.bed}</strong></div>
                <div className="flex justify-between border-t border-border pt-2 text-xs font-black text-foreground">
                  <span>Balance Due:</span><span>₹{selectedResident.due_amount > 0 ? selectedResident.due_amount.toLocaleString() : selectedResident.rent.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-2xs font-semibold text-muted-foreground">Select Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["upi", "cash", "card"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setPaymentMode(mode)}
                      className={cn(
                        "py-2 border text-3xs font-black rounded-xl uppercase transition-all cursor-pointer bg-card",
                        paymentMode === mode
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "border-border text-muted-foreground"
                      )}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 p-4 border-t border-border bg-card/60">
              <Button type="button" variant="outline" className="flex-1 text-xs border-border text-foreground" onClick={() => setShowRentModal(false)}>Cancel</Button>
              <Button type="button" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs border-none" onClick={submitRentCollection}>
                Confirm Payment
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Agreement Renewal Modal */}
      {showAgreementModal && selectedResident && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-sm rounded-2xl shadow-xl border border-border overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border bg-card/60">
              <h3 className="font-display font-black text-foreground text-sm flex items-center gap-1.5">
                <FileText size={16} className="text-blue-500" />
                Renew Agreement
              </h3>
              <button onClick={() => setShowAgreementModal(false)} className="p-1 rounded-lg text-muted-foreground hover:bg-muted transition-colors cursor-pointer border-none bg-transparent">
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-3.5">
              <div className="p-3.5 bg-background border border-border rounded-xl text-3xs space-y-1.5 font-bold">
                <p>Resident: <strong className="text-foreground">{selectedResident.name}</strong></p>
                <p>Current Agreement: <strong className="text-foreground">{selectedResident.agreement_code}</strong></p>
              </div>

              <div className="space-y-1.5">
                <label className="text-2xs font-semibold text-muted-foreground">Renewal Term (Months)</label>
                <Input
                  type="number"
                  value={agreementForm.durationMonths}
                  onChange={(e) => setAgreementForm({ ...agreementForm, durationMonths: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-2xs font-semibold text-muted-foreground">Agreed Monthly Rent (₹)</label>
                <Input
                  type="number"
                  value={agreementForm.rentAmount}
                  onChange={(e) => setAgreementForm({ ...agreementForm, rentAmount: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex gap-2 p-4 border-t border-border bg-card/60">
              <Button type="button" variant="outline" className="flex-1 text-xs border-border text-foreground" onClick={() => setShowAgreementModal(false)}>Cancel</Button>
              <Button type="button" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs border-none" onClick={submitAgreementRenewal}>
                Renew Agreement
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Fine / Charges Modal */}
      {showFineModal && selectedResident && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-sm rounded-2xl shadow-xl border border-border overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border bg-card/60">
              <h3 className="font-display font-black text-foreground text-sm flex items-center gap-1.5">
                <AlertTriangle size={16} className="text-rose-500" />
                Post Fine / Charge
              </h3>
              <button onClick={() => setShowFineModal(false)} className="p-1 rounded-lg text-muted-foreground hover:bg-muted transition-colors cursor-pointer border-none bg-transparent">
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-2xs font-semibold text-muted-foreground">Charge Amount (₹)</label>
                <Input
                  type="number"
                  value={fineForm.amount}
                  onChange={(e) => setFineForm({ ...fineForm, amount: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-2xs font-semibold text-muted-foreground">Reason / Description</label>
                <Input
                  value={fineForm.reason}
                  onChange={(e) => setFineForm({ ...fineForm, reason: e.target.value })}
                  placeholder="e.g. Late Payment Penalty"
                />
              </div>
            </div>

            <div className="flex gap-2 p-4 border-t border-border bg-card/60">
              <Button type="button" variant="outline" className="flex-1 text-xs border-border text-foreground" onClick={() => setShowFineModal(false)}>Cancel</Button>
              <Button type="button" className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs border-none" onClick={submitFinePosting}>
                Post Charge
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Configure Rooms & Beds Modal */}
      {showMastersModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border overflow-hidden animate-in fade-in zoom-in duration-200 text-foreground">
            <div className="flex items-center justify-between p-4 border-b border-border bg-card/60">
              <h3 className="font-display font-black text-foreground text-sm flex items-center gap-1.5">
                <Home size={16} className="text-indigo-500" />
                Configure PG Rooms & Beds
              </h3>
              <button onClick={handleCloseMasters} className="p-1 rounded-lg text-muted-foreground hover:bg-muted transition-colors cursor-pointer border-none bg-transparent">
                <X size={16} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border text-xs">
              {["room", "bed"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setMasterTab(tab as any)}
                  className={cn(
                    "flex-1 py-2.5 font-bold capitalize border-b-2 transition-all",
                    masterTab === tab ? "border-primary text-primary font-black" : "border-transparent text-muted-foreground"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Room Form */}
            {masterTab === "room" && (
              <form onSubmit={handleSaveRoom} className="p-5 space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-2xs font-semibold text-muted-foreground">Room Number</label>
                    <Input
                      value={newRoomNumber}
                      onChange={(e) => setNewRoomNumber(e.target.value)}
                      placeholder="e.g. 504"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-2xs font-semibold text-muted-foreground">Floor Level</label>
                    <select
                      value={newRoomFloor}
                      onChange={(e) => setNewRoomFloor(e.target.value)}
                      className="w-full h-9 px-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
                    >
                      <option value="1st Floor">1st Floor</option>
                      <option value="2nd Floor">2nd Floor</option>
                      <option value="3rd Floor">3rd Floor</option>
                      <option value="4th Floor">4th Floor</option>
                      <option value="5th Floor">5th Floor</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-2xs font-semibold text-muted-foreground">Category</label>
                    <select
                      value={newRoomCategory}
                      onChange={(e) => setNewRoomCategory(e.target.value)}
                      className="w-full h-9 px-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
                    >
                      <option value="AC Single">AC Single</option>
                      <option value="AC Double">AC Double</option>
                      <option value="Non-AC Double">Non-AC Double</option>
                      <option value="AC Triple">AC Triple</option>
                      <option value="Non-AC Triple">Non-AC Triple</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-2xs font-semibold text-muted-foreground">Bed Capacity</label>
                    <Input
                      type="number"
                      value={newRoomCapacity}
                      onChange={(e) => setNewRoomCapacity(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-2xs font-semibold text-muted-foreground">Base Monthly Rent (₹)</label>
                  <Input
                    type="number"
                    value={newRoomRent}
                    onChange={(e) => setNewRoomRent(Number(e.target.value))}
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="hasAcCheckbox"
                    checked={newRoomHasAC}
                    onChange={(e) => setNewRoomHasAC(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5 bg-background"
                  />
                  <label htmlFor="hasAcCheckbox" className="font-semibold text-muted-foreground">Air Conditioning (AC) Available?</label>
                </div>

                <div className="flex gap-2 pt-3 border-t border-border">
                  <Button type="button" variant="outline" className="flex-1 text-xs border-border text-foreground" onClick={handleCloseMasters}>Cancel</Button>
                  <Button type="submit" className="flex-1 bg-violet-600 hover:bg-violet-700 text-white text-xs border-none">
                    Save Room
                  </Button>
                </div>
              </form>
            )}

            {/* Bed Form */}
            {masterTab === "bed" && (
              <form onSubmit={handleSaveBed} className="p-5 space-y-3.5 text-xs">
                <div className="space-y-1.5">
                  <label className="text-2xs font-semibold text-muted-foreground">Select Room</label>
                  <select
                    value={selectedRoomId}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                    className="w-full h-9 px-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
                    required
                  >
                    <option value="">-- Choose Room --</option>
                    {rooms.map((rm) => (
                      <option key={rm.id} value={rm.id}>Room {rm.room_number} ({rm.category})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-2xs font-semibold text-muted-foreground">Bed Name / Code</label>
                  <Input
                    value={newBedCode}
                    onChange={(e) => setNewBedCode(e.target.value)}
                    placeholder="e.g. Bed C"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-3 border-t border-border">
                  <Button type="button" variant="outline" className="flex-1 text-xs border-border text-foreground" onClick={handleCloseMasters}>Cancel</Button>
                  <Button type="submit" className="flex-1 bg-violet-600 hover:bg-violet-700 text-white text-xs border-none">
                    Add Bed to Room
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PGManagementPage;
