/**
 * ssrone ERP - Finance Voucher Mapper
 */

import { Voucher } from "../domain/Voucher";
import { VoucherDTO } from "../dto/FinanceDTO";

export class FinanceMapper {
  static toDomain(dto: VoucherDTO): Voucher {
    return new Voucher({
      id: dto.id,
      voucherNumber: dto.voucher_number,
      voucherDate: dto.voucher_date,
      voucherType: dto.voucher_type,
      entries: dto.entries.map((e) => ({
        accountId: e.account_id,
        accountName: e.account_name,
        debitAmount: e.debit_amount,
        creditAmount: e.credit_amount,
        narration: e.narration,
      })),
    });
  }

  static toDTO(domain: Voucher, branchId: string | number = 1): VoucherDTO {
    return {
      id: domain.id,
      voucher_number: domain.voucherNumber,
      voucher_date: domain.voucherDate,
      voucher_type: domain.voucherType,
      branch_id: branchId,
      entries: domain.entries.map((e) => ({
        account_id: e.accountId,
        account_name: e.accountName,
        debit_amount: e.debitAmount,
        credit_amount: e.creditAmount,
        narration: e.narration,
      })),
    };
  }
}
