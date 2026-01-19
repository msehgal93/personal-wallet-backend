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

---

## Technical Stack & Development Tools

### Database & Data Modeling
- **NoSQL Database**: MongoDB with object data modeling using Mongoose
  - Schema definitions and validation
  - Middleware support for pre/post hooks
  - Built-in type casting and query building

### Validation
- **Request Data Validation**: Joi package
  - Schema-based validation for request payloads
  - Input sanitization and type checking
  - Custom validation rules and error messages

### Logging
- **Winston**: Structured logging with multiple transports
  - File and console logging
  - Log levels (error, warn, info, debug)
  - Log rotation and retention policies
- **Morgan**: HTTP request logging middleware
  - Request/response logging
  - Custom log formats
  - Performance monitoring

### Testing
- **Jest**: Unit and integration testing framework
  - Test suites for API endpoints
  - Mocking and test fixtures
  - Coverage reporting
  - Integration tests for database operations

### Error Handling
- **Centralized Error Handling**: Custom error handling mechanism
  - Global error middleware
  - Standardized error response format
  - Error logging and tracking
  - Custom error classes for different error types

### Process Management
- **PM2**: Advanced production process management
  - Process clustering and load balancing
  - Auto-restart on crashes
  - Zero-downtime deployments
  - Process monitoring and logging
  - Environment-specific configurations

### Environment Configuration
- **dotenv**: Environment variable management
  - `.env` file support for local development
  - Environment-specific configurations
- **cross-env**: Cross-platform environment variable setting
  - Windows/Linux/Mac compatibility
  - NPM script environment variable support

### Security
- **Helmet**: Security HTTP headers
  - XSS protection
  - Content Security Policy
  - HTTP Strict Transport Security (HSTS)
  - X-Frame-Options and other security headers
- **Data Sanitization**: Request data sanitization against XSS and query injection
  - Input sanitization middleware
  - MongoDB injection prevention
  - XSS attack prevention

### CORS
- **cors**: Cross-Origin Resource Sharing
  - Configurable CORS policies
  - Whitelist support for allowed origins
  - Credentials and headers configuration

### Compression
- **compression**: Gzip compression middleware
  - Response compression for improved performance
  - Configurable compression levels
  - Content-type filtering

### Containerization
- **Docker Support**: Containerized deployment
  - Dockerfile for application containerization
  - Docker Compose for local development
  - Multi-stage builds for optimization

### Code Quality
- **ESLint**: JavaScript/TypeScript linting
  - Code style enforcement
  - Best practices validation
  - Custom rule configurations
- **Prettier**: Code formatting
  - Consistent code style
  - Automatic formatting on save
  - Integration with ESLint

### Editor Configuration
- **EditorConfig**: Consistent editor configuration
  - Cross-editor settings (indentation, line endings, charset)
  - `.editorconfig` file for team consistency


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

Sample Request:
```
curl --request POST http://localhost:3000/api/v1/wallet/setup \
--header "Content-Type: application/json" \
--data '{
  "name": "Mohit Wallet",
  "balance": 10
}'
```

Sample Response:
```
{
  "id":"696defeb527b9a16e69a591b",
  "balance":10,
  "transactionId":"696defeb527b9a16e69a591d",
  "name":"Mohit Wallet",
  "date":"2026-01-19T08:48:43.275Z"
}
```
---

#### Credit / Debit Transaction
**POST /transaction/:walletId**

Request:
```json
{ "amount": number, "description": string }
```

Response:
```json
{ "balance": number, "transactionId": string }
```

Sample Request:
```
curl --request POST http://localhost:3000/api/v1/transaction/696defeb527b9a16e69a591b \
--header "Content-Type: application/json" \
--data '{
  "description": "Cashback",
  "amount": 10
}'
```

Sample Response:
```
{
  "balance":25,
  "amount":10,
  "description":"Cashback",
  "transactionId":"696dfbdae97b0037965c04e7",
  "walletId":"696defeb527b9a16e69a591b",
  "type":"CREDIT"
}
```
---

#### Fetch Transactions
**GET /transaction?walletId=&skip=&limit=&sortBy=&sortOrder=**

Response:
```json
[ { "id": number, "walletId": string, "amount": number, "balance": number, "description": string, "date": Date, "type": "CREDIT | DEBIT" } ]
```

Sample Request:
```
curl --request GET "http://localhost:3000/api/v1/transaction?walletId=696defeb527b9a16e69a591b&skip=0&limit=10&sortBy=amount&sortOrder=asc" \
--header "Content-Type: application/json"
```

Sample Response:
```
{
  "data": [
    {
      "id": "696e2b29b92c8b436e367730",
      "walletId": "696e2b28b92c8b436e367728",
      "amount": 1,
      "balance": 6,
      "description": "Amount 1",
      "date": "2026-01-19T13:01:29.824Z",
      "type": "CREDIT"
    },
    {
      "id": "696e2b2ab92c8b436e367734",
      "walletId": "696e2b28b92c8b436e367728",
      "amount": 3,
      "balance": 9,
      "description": "Amount 3",
      "date": "2026-01-19T13:01:30.376Z",
      "type": "CREDIT"
    }
  ],
  "pagination": {
    "skip": 1,
    "limit": 50
  }
}
```

---

#### Get Wallet
**GET /wallet/:id**

Response:
```json
{ "id": number, "balance": number, "name": string, "date": Date }
```

Sample Request:
```
curl --request GET http://localhost:3000/api/v1/wallet/696defeb527b9a16e69a591b \
--header "Content-Type: application/json"
```

Sample Response:
```
{
  "id":"696defeb527b9a16e69a591b",
  "balance":10,
  "name":"Mohit Wallet",
  "date":"2026-01-19T08:48:43.275Z"
}
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
