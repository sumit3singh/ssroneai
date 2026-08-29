/**
 * ssrone ERP - Hotel Room & Folio Domain Model
 * Core business math for night tariff calculations, room status, and folio billing.
 */

export type RoomStatusType = "VACANT_CLEAN" | "VACANT_DIRTY" | "OCCUPIED" | "RESERVED" | "OUT_OF_SERVICE";

export interface RoomProps {
  id: string | number;
  roomNumber: string;
  categoryName: string;
  basePricePerNight: number;
  taxPercent?: number;
  status?: RoomStatusType;
  currentGuestName?: string;
  checkInDate?: string;
  checkOutDate?: string;
}

export class Room {
  readonly id: string | number;
  readonly roomNumber: string;
  readonly categoryName: string;
  readonly basePricePerNight: number;
  readonly taxPercent: number;
  private _status: RoomStatusType;
  readonly currentGuestName: string;
  readonly checkInDate?: string;
  readonly checkOutDate?: string;

  constructor(props: RoomProps) {
    this.id = props.id;
    this.roomNumber = props.roomNumber;
    this.categoryName = props.categoryName;
    this.basePricePerNight = Math.max(0, props.basePricePerNight);
    this.taxPercent = props.taxPercent ?? 12; // Default Luxury/Room GST 12%
    this._status = props.status ?? "VACANT_CLEAN";
    this.currentGuestName = props.currentGuestName ?? "";
    this.checkInDate = props.checkInDate;
    this.checkOutDate = props.checkOutDate;
  }

  get status(): RoomStatusType {
    return this._status;
  }

  get isOccupied(): boolean {
    return this._status === "OCCUPIED";
  }

  calculateStayTotal(nights: number): { subtotal: number; taxAmount: number; grandTotal: number } {
    const validNights = Math.max(1, nights);
    const subtotal = this.basePricePerNight * validNights;
    const taxAmount = (subtotal * this.taxPercent) / 100;
    const grandTotal = Math.round((subtotal + taxAmount) * 100) / 100;
    return { subtotal, taxAmount, grandTotal };
  }
}
