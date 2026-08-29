/**
 * ssrone ERP - Finance Repository
 */

import { api } from "@ssrone/api-client";
import { Voucher } from "../domain/Voucher";
import { FinanceMapper } from "../mappers/FinanceMapper";
import { VoucherDTO } from "../dto/FinanceDTO";

export interface IFinanceRepository {
  getVouchers(): Promise<Voucher[]>;
  createVoucher(voucher: Voucher): Promise<Voucher>;
}

export class FinanceRepository implements IFinanceRepository {
  async getVouchers(): Promise<Voucher[]> {
    const dtos = (await api.get<VoucherDTO[]>("/finance/vouchers")) || [];
    return dtos.map(FinanceMapper.toDomain);
  }

  async createVoucher(voucher: Voucher): Promise<Voucher> {
    const dto = FinanceMapper.toDTO(voucher);
    const res = await api.post<VoucherDTO>("/finance/vouchers", dto);
    return FinanceMapper.toDomain(res);
  }
}

export const financeRepository = new FinanceRepository();
