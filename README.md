# Wallet Management Service – Backend & Frontend Specifications

**Goal:**  
Create high level specifications for Backend and Frontend of a Wallet Management Service based on the given problem statement.

---


## Technology Choices

### Backend
- Node.js 20 – async, scalable
- Express.js – lightweight API framework
- MongoDB – fast reads, atomic writes

### Frontend
- React 19 – modern UI framework
- Tailwind CSS – rapid styling
- Static hosting – low cost, fast delivery


## Architectural Characteristics

| Aspect | Design Decision |
|------|----------------|
| Stateless backend | Enables horizontal scaling |
| Read-Write-heavy optimization | Indexed queries, append-only transactions |
| Low latency | Single database hop, minimal joins |
| Race-condition safe | Atomic updates / MongoDB transactions |
| Extensible | Clear separation of wallet and transaction domains |


---

## 1. High-Level Architecture

### Logical Architecture

```
[ React 19 Static Web App ]
          |
          |  HTTPS (JSON REST)
          v
[ Express API Layer ]
          |
          |  Stateless REST APIs
          v
[ Wallet Service (Node.js 20) ]
          |
          |  Atomic DB Operations / Transactions
          v
[ MongoDB ]
  ├── wallets
  └── transactions
```

## 2. Key Components

## 2.1 Backend Components

### API Endpoints

#### Initialize Wallet
**POST /setup**

Request:
```json
{ "balance": number, "name": string }
```

Response:
```json
{ "id": number, "balance": number, "transactionId": string, "name": string, "date": Date }
```

---

#### Credit / Debit Transaction
**POST /transact/:walletId**

Request:
```json
{ "amount": number, "description": string }
```

Response:
```json
{ "balance": number, "transactionId": string }
```

---

#### Fetch Transactions
**GET /transactions?walletId=&skip=&limit=**

Response:
```json
[ { "id": number, "walletId": string, "amount": number, "balance": number, "description": string, "date": Date, "type": "CREDIT | DEBIT" } ]
```

---

#### Get Wallet
**GET /wallet/:id**

Response:
```json
{ "id": number, "balance": number, "name": string, "date": Date }
```

---

## 2.2 Database Schema

### Wallet Collection
```json
wallets {
  _id,
  name,
  balance,
  createdAt,
  updatedAt
}
```

### Transaction Collection
```json
transactions {
  _id,
  walletId,
  amount,
  balance,
  description,
  type,
  createdAt
}
```

---

## 3. Frontend Architecture

### Page 1 – Wallet Dashboard
- Wallet initialization
- Wallet summary
- Credit / Debit form

### Page 2 – Transactions
- Paginated table
- Sorting by date and amount
- CSV export

---

## 4. Extensibility

- Authentication via middleware
- Multi-wallet support
- Analytics via aggregation pipelines
- Caching with Redis
- Event-based extensions
