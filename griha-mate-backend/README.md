# GrihaMate Backend

Spring Boot backend for the GrihaMate room rental platform in Nepal.

## Features

- **User Authentication**: JWT-based authentication for Seekers and Landlords
- **Email Verification**: Automatic email verification on registration with resend capability
- **Role-Based Access Control**:
  - **Seekers**: Can view available properties (only after login)
  - **Landlords**: Can create and manage property listings (only after login and verification)
- **Property Management**: CRUD operations for property listings
- **Verification System**: Document verification for both Seekers (Citizenship) and Landlords (KYC + Property)
- **Image/Document Upload**: Cloudinary integration for property images and verification documents
- **Payment Integration**: eSewa payment gateway for rental payments

## Technology Stack

- Java 17
- Spring Boot 3.2.0
- Spring Security with JWT
- MySQL Database
- Maven

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- MySQL 8.0+
- MySQL database created (or use `createDatabaseIfNotExist=true` in config)

## Setup Instructions

1. **Clone and navigate to the backend directory:**
   ```bash
   cd griha-mate-backend
   ```

2. **Configure Database and Services:**
   - Update `src/main/resources/application.properties` with your credentials:
     ```properties
     # Database
     spring.datasource.username=your_username
     spring.datasource.password=your_password
     
     # Email (Gmail SMTP)
     spring.mail.username=your-email@gmail.com
     spring.mail.password=your-app-password
     
     # Cloudinary (for image/document uploads)
     cloudinary.cloud.name=your-cloud-name
     cloudinary.api.key=your-api-key
     cloudinary.api.secret=your-api-secret
     
     # eSewa Payment (use test credentials for development)
     esewa.product.code=EPAYTEST
     esewa.secret=8gBm/:&EnhH.1/q
     ```
   
   **Note:** For Gmail, you need to generate an App Password (not your regular password). Go to Google Account > Security > 2-Step Verification > App Passwords.

3. **Build the project:**
   ```bash
   mvn clean install
   ```

4. **Run the application:**
   ```bash
   mvn spring-boot:run
   ```

   Or run the main class: `com.grihamate.GrihaMateApplication`

5. **The server will start on:** `http://localhost:8080`

## API Endpoints

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "userType": "SEEKER" | "LANDLORD",
  "fullName": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+9779812345678",
  "password": "password123",
  // Seeker specific:
  "citizenshipNumber": "1234567890",
  "citizenshipFrontUrl": "https://...",
  "citizenshipBackUrl": "https://...",
  // Landlord specific:
  "kycDocumentType": "CITIZENSHIP",
  "kycDocumentUrl": "https://...",
  "propertyAddress": "Kathmandu, Nepal",
  "propertyDocumentUrl": "https://..."
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "token": "jwt_token_here",
  "user": { ... }
}
```

#### Get Profile
```
GET /api/auth/profile
Authorization: Bearer {token}
```

### Property Endpoints (Requires Authentication)

#### Get All Available Properties (Seeker Only)
```
GET /api/properties
Authorization: Bearer {token}
```

#### Get Property by ID (Seeker Only)
```
GET /api/properties/{id}
Authorization: Bearer {token}
```

#### Get Properties by City (Seeker Only)
```
GET /api/properties/city/{city}
Authorization: Bearer {token}
```

#### Create Property (Landlord Only)
```
POST /api/properties/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Cozy Room in Kathmandu",
  "description": "Beautiful room with all amenities",
  "address": "Thamel, Kathmandu",
  "city": "Kathmandu",
  "district": "Kathmandu",
  "province": "Bagmati",
  "price": 15000,
  "bedrooms": 1,
  "bathrooms": 1,
  "area": 200.0,
  "propertyType": "ROOM",
  "imageUrls": ["https://..."],
  "virtualTourUrl": "https://..."
}
```

#### Get My Properties (Landlord Only)
```
GET /api/properties/my-properties
Authorization: Bearer {token}
```

### Image Upload Endpoints

#### Upload Image
```
POST /api/images/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data
file: [image file]
```

#### Upload Document (Public - for registration)
```
POST /api/images/upload-document
Content-Type: multipart/form-data
file: [document file]
```

#### Upload Citizenship Document (Public - for registration)
```
POST /api/images/upload-citizenship
Content-Type: multipart/form-data
file: [document file]
type: "front" | "back"
```

#### Upload KYC Document (Public - for registration)
```
POST /api/images/upload-kyc
Content-Type: multipart/form-data
file: [document file]
```

#### Upload Property Document (Public - for registration)
```
POST /api/images/upload-property-document
Content-Type: multipart/form-data
file: [document file]
```

### Payment Endpoints

#### Initiate eSewa Payment
```
POST /api/payment/esewa
Authorization: Bearer {token}
Content-Type: application/json

{
  "total_amount": 15000,
  "amount": 15000
}

Response:
{
  "amount": "15000.00",
  "tax_amount": "0",
  "total_amount": "15000.00",
  "transaction_uuid": "...",
  "product_code": "EPAYTEST",
  "signature": "...",
  "action": "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
  ...
}
```

#### Verify Payment
```
POST /api/payment/verify
data: [base64 encoded payment data]
signature: [payment signature]
```

#### Payment Success Callback
```
GET /api/payment/success
```

#### Payment Failure Callback
```
GET /api/payment/failure
```

## Security Configuration

- **Public Endpoints**: `/api/auth/**` (registration and login)
- **Seeker Only**: `/api/properties/**` (view properties)
- **Landlord Only**: `/api/properties/create`, `/api/properties/my-properties` (create/manage properties)
- **Admin Only**: `/api/admin/**` (admin operations)

## Database Schema

### Users Table
- id, fullName, email, password, phoneNumber, role (SEEKER/LANDLORD/ADMIN)
- Seeker fields: citizenshipNumber, citizenshipFrontUrl, citizenshipBackUrl
- Landlord fields: kycDocumentType, kycDocumentUrl
- verificationStatus (PENDING/VERIFIED/REJECTED)

### Properties Table
- id, title, description, address, city, district, province
- price, bedrooms, bathrooms, area, propertyType
- status (AVAILABLE/RENTED/UNAVAILABLE)
- verified (boolean)
- landlord_id (foreign key)

### Property Verifications Table
- id, landlord_id, propertyAddress, propertyDocumentUrl
- status (PENDING/VERIFIED/REJECTED)

## Notes

- All property listings require admin verification before being visible to seekers
- Landlords must be verified before they can create properties
- Seekers must have verified email to login
- JWT tokens expire after 24 hours (configurable in `application.properties`)

## CORS Configuration

The backend is configured to accept requests from `http://localhost:3000` (frontend). Update `cors.allowed-origins` in `application.properties` for production.

