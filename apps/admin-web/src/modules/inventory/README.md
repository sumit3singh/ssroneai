# ssrone ERP – Inventory Module Architecture

Tracks raw material stock, stock valuation, reorder thresholds, Purchase Orders (PO), and Goods Receipt Notes (GRN).

## Architectural Layers

- `domain/`: `StockItem.ts` for stock valuation and reorder rules.
- `dto/`: API request/response contract `InventoryDTO.ts`.
- `mappers/`: `InventoryMapper.ts`.
- `repositories/`: `InventoryRepository.ts`.
- `module.json`: Declarative metadata manifest.
