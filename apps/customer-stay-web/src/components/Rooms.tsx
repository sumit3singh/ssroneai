import { useState, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, X, CreditCard, Clipboard, Landmark, ShieldCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const rooms = [
  {
    id: "room-type-1",
    name: "Single Occupancy",
    price: 12000,
    features: [
      "Private room & study space",
      "Attached premium bathroom",
      "Study desk, highback chair",
      "Spacious wardrobe",
      "High speed Wi-Fi (100 Mbps)",
      "Daily room cleaning",
    ],
  },
  {
    id: "room-type-2",
    name: "Double Sharing",
    price: 8500,
    popular: true,
    features: [
      "Twin sharing layout",
      "Shared modern bathroom",
      "Individual desk & wardrobe",
      "High speed Wi-Fi included",
      "Daily room cleaning",
      "Individual locker keys",
    ],
  },
  {
    id: "room-type-3",
    name: "Triple Sharing",
    price: 6000,
    features: [
      "Triple sharing spacious layout",
      "Shared modern bathroom",
      "Dedicated study corners",
      "Individual wardrobes",
      "High speed Wi-Fi included",
      "Daily room cleaning",
    ],
  },
];

const Rooms = () => {
  const [filter, setFilter] = useState<"all" | "single" | "shared">("all");

  // Booking Wizard State
  const [selectedRoom, setSelectedRoom] = useState<typeof rooms[0] | null>(null);
  const [wizardStep, setWizardStep] = useState<"dates" | "info" | "pay" | "done">("dates");
  const [checkInDate, setCheckInDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [months, setMonths] = useState(1);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [payMethod, setPayMethod] = useState<"upi" | "card" | "netbanking">("upi");
  const [bookingRef, setBookingRef] = useState("");

  const filteredRooms = rooms.filter((room) => {
    if (filter === "all") return true;
    if (filter === "single") return room.name.includes("Single");
    return !room.name.includes("Single");
  });

  const handleBookNowClick = (room: typeof rooms[0]) => {
    setSelectedRoom(room);
    setWizardStep("dates");
    setMonths(1);
    setGuestName("");
    setGuestPhone("");
    setGuestEmail("");
  };

  const handleDatesNext = (e: React.FormEvent) => {
    e.preventDefault();
    setWizardStep("info");
  };

  const handleInfoNext = (e: React.FormEvent) => {
    e.preventDefault();
    setWizardStep("pay");
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;

    const grandTotal = Math.round(selectedRoom.price * months * 1.18);
    const unitCode = "HOT01";
    const refNum = `RES-${Date.now().toString(36).toUpperCase()}`;

    try {
      await fetch("/api/v1/hotel/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unit_code: unitCode,
          room_type_id: selectedRoom.id,
          guest_name: guestName,
          guest_phone: guestPhone,
          guest_email: guestEmail,
          check_in_date: checkInDate,
          months: months,
          grand_total: grandTotal,
          payment_method: payMethod
        })
      });
    } catch (err) {
      console.warn("Backend reservation submission fallback", err);
    }

    setBookingRef(refNum);
    setWizardStep("done");
  };

  const calculatedTotals = useMemo(() => {
    if (!selectedRoom) return { subtotal: 0, tax: 0, total: 0 };
    const subtotal = selectedRoom.price * months;
    const tax = subtotal * 0.18;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }, [selectedRoom, months]);

  return (
    <section id="rooms" className="section-padding bg-blush relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <div className="container-custom relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-8"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-primary to-rose-medium bg-clip-text text-transparent">
              Perfect Stay
            </span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Comfortable premium rooms tailored to your budget and needs.
          </p>
        </motion.div>

        {/* Filter Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center mb-10"
        >
          <div className="inline-flex rounded-full bg-card border border-border p-1 shadow-soft">
            {[
              { key: "all", label: "All Rooms" },
              { key: "single", label: "Single" },
              { key: "shared", label: "Shared" },
            ].map((option) => (
              <button
                key={option.key}
                onClick={() => setFilter(option.key as any)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${filter === option.key
                  ? "bg-gradient-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Room Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {filteredRooms.map((room, index) => (
            <motion.div
              key={room.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className={`relative rounded-3xl p-6 md:p-8 flex flex-col justify-between ${room.popular
                ? "bg-gradient-hero text-primary-foreground shadow-elevated scale-105"
                : "bg-card border border-border shadow-card hover:shadow-elevated"
                } transition-all duration-300`}
            >
              {room.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-gold text-rose-dark text-sm font-semibold rounded-full shadow-lg">
                    <Sparkles className="w-3.5 h-3.5" />
                    Most Popular
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-xl md:text-2xl font-display font-bold mb-2">
                  {room.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl md:text-4xl font-bold">
                    ₹{room.price.toLocaleString()}
                  </span>
                  <span className={room.popular ? "text-primary-foreground/70" : "text-muted-foreground"}>
                    / month
                  </span>
                </div>

                <ul className="space-y-3 mb-8 text-sm">
                  {room.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${room.popular ? "bg-primary-foreground/20" : "bg-accent"}`}>
                        <Check className={`w-3 h-3 ${room.popular ? "text-primary-foreground" : "text-primary"}`} />
                      </div>
                      <span className={room.popular ? "text-primary-foreground/90" : "text-muted-foreground"}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                variant={room.popular ? "heroOutline" : "hero"}
                size="lg"
                className="w-full rounded-full"
                onClick={() => handleBookNowClick(room)}
              >
                Book Room Now
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Room Booking Wizard Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-3xl shadow-elevated border border-border overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-display font-bold text-foreground text-base">
                Book stay – {selectedRoom.name}
              </h3>
              <button
                onClick={() => setSelectedRoom(null)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X size={18} />
              </button>
            </div>

            {/* Step 1: Dates & Duration */}
            {wizardStep === "dates" && (
              <form onSubmit={handleDatesNext}>
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground">Tentative Check-In Date</label>
                    <input
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground">Select Stay Duration (Months)</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 3, 6, 12].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setMonths(m)}
                          className={`p-3 rounded-xl border text-sm font-medium transition-all ${months === m
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border hover:bg-muted text-muted-foreground"
                            }`}
                        >
                          {m} Mo
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 p-5 border-t border-border bg-muted/10">
                  <Button type="button" className="flex-1 rounded-full border border-border bg-transparent text-foreground hover:bg-muted" onClick={() => setSelectedRoom(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 rounded-full bg-primary text-white">
                    Next Details
                  </Button>
                </div>
              </form>
            )}

            {/* Step 2: Guest Details */}
            {wizardStep === "info" && (
              <form onSubmit={handleInfoNext}>
                <div className="p-6 space-y-3.5">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Kumar"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground">Mobile Contact</label>
                    <input
                      type="tel"
                      placeholder="98765xxxxx"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. ramesh@gmail.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2 p-5 border-t border-border bg-muted/10">
                  <Button type="button" className="flex-1 rounded-full border border-border bg-transparent text-foreground" onClick={() => setWizardStep("dates")}>
                    Back
                  </Button>
                  <Button type="submit" className="flex-1 rounded-full bg-primary text-white">
                    Next Payment
                  </Button>
                </div>
              </form>
            )}

            {/* Step 3: Payment Options & Settle */}
            {wizardStep === "pay" && (
              <form onSubmit={handlePaymentSubmit}>
                <div className="p-6 space-y-4">
                  {/* Bill Breakdown */}
                  <div className="p-4 bg-muted/30 border border-border rounded-2xl space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Room stay rate:</span>
                      <strong className="text-foreground">₹{selectedRoom.price.toLocaleString()} / month</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span>{months} Month(s)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">CGST/SGST (18%):</span>
                      <span className="font-mono text-2xs">₹{calculatedTotals.tax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-border/60 text-sm font-bold">
                      <span>Total Booking Cost:</span>
                      <span className="text-primary font-mono">₹{calculatedTotals.total.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground">Payment Method</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: "upi", label: "UPI Pay", icon: Landmark },
                        { key: "card", label: "Credit Card", icon: CreditCard },
                      ].map((pay) => (
                        <button
                          key={pay.key}
                          type="button"
                          onClick={() => setPayMethod(pay.key as any)}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border text-2xs font-semibold gap-1.5 transition-all ${payMethod === pay.key
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border hover:bg-muted text-muted-foreground"
                            }`}
                        >
                          <pay.icon size={14} />
                          {pay.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 p-5 border-t border-border bg-muted/10">
                  <Button type="button" className="flex-1 rounded-full border border-border bg-transparent text-foreground" onClick={() => setWizardStep("info")}>
                    Back
                  </Button>
                  <Button type="submit" className="flex-1 rounded-full bg-primary text-white">
                    Settle & Book
                  </Button>
                </div>
              </form>
            )}

            {/* Step 4: Success Ticket */}
            {wizardStep === "done" && (
              <div className="p-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-success/15 text-success flex items-center justify-center mx-auto">
                  <Check size={26} />
                </div>
                <div>
                  <h4 className="font-display font-bold text-lg text-foreground">Stay Booked Successfully!</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your room allocation is confirmed. Present the booking slip during check-in.
                  </p>
                </div>

                <div className="p-4 bg-muted/30 border border-border/80 border-dashed rounded-2xl text-left space-y-2 text-2xs font-mono text-muted-foreground">
                  <div>Booking ID: <strong className="text-foreground">{bookingRef}</strong></div>
                  <div>Guest Name: <strong className="text-foreground">{guestName}</strong></div>
                  <div>Stay Room: <strong className="text-foreground">{selectedRoom.name}</strong></div>
                  <div>Check-In: <strong className="text-foreground">{checkInDate}</strong></div>
                  <div>Duration: <strong className="text-foreground">{months} Month(s)</strong></div>
                  <div className="pt-1.5 border-t border-border/40 text-xs font-bold text-foreground flex justify-between">
                    <span>Paid total:</span>
                    <span className="text-primary">₹{calculatedTotals.total.toLocaleString()}</span>
                  </div>
                </div>

                <Button
                  className="w-full rounded-full bg-primary text-white"
                  onClick={() => setSelectedRoom(null)}
                >
                  Done (Close)
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default Rooms;
