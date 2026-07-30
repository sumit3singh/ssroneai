# BAITHAK ERP – Module Standard (MODULE_STANDARD.md)

## Uniform 21-Layer Module Architecture
Every business module MUST follow this exact directory structure:

```
module/
├── dashboard/
├── master/
├── transaction/
├── report/
├── settings/
├── api/
├── components/
├── hooks/
├── services/
├── store/
├── validators/
├── permissions/
├── types/
├── constants/
├── navigation/
├── routes/
├── tests/
├── docs/
└── index.ts
```

No module is allowed to have a different architecture.
