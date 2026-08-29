# ssrone ERP – Hotel PMS Architecture

Delivers room tariff calculations, check-in/check-out guest folios, housekeeping room state transitions, and occupancy reporting.

## Architectural Layers

- `domain/`: `Room.ts` handling night stay tariff math and status rules.
- `dto/`: API contract `HotelDTO.ts`.
- `mappers/`: Bi-directional transformer `HotelMapper.ts`.
- `repositories/`: Repository data layer `HotelRepository.ts`.
- `module.json`: Module metadata manifest.
