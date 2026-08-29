# ssrone ERP – Finance & Accounting Module Architecture

Handles double-entry accounting vouchers, general ledger reconciliation, GST return exports, trial balance calculation, and financial statements.

## Architectural Layers

- `domain/`: `Voucher.ts` enforcing debit equals credit balancing rules.
- `dto/`: `FinanceDTO.ts`.
- `mappers/`: `FinanceMapper.ts`.
- `repositories/`: `FinanceRepository.ts`.
- `module.json`: Module metadata manifest.
