# GrihaMate - Complete Documentation

## Overview
GrihaMate is a modern room rental platform in Nepal that connects verified landlords with seekers. The platform includes user verification, property listings, payment integration, and an admin panel for managing verifications.

## Features

### 1. User Registration & Authentication
- **Profile Image Upload**: Both seekers and landlords can upload profile photos during registration
- **Seeker Registration**: Requires citizenship verification (front and back)
- **Landlord Registration**: Requires KYC documents and property verification
- **Email Verification**: Users receive verification emails upon registration
- **JWT Authentication**: Secure token-based authentication

### 2. User Roles
- **SEEKER**: Can browse and rent properties, contact landlords, make payments
- **LANDLORD**: Can list properties, manage listings, view applications
- **ADMIN**: Can verify users, manage properties, view all data

### 3. Property Management
- **Property Listings**: Landlords can create detailed property listings
- **Image Upload**: Multiple images per property via Cloudinary
- **Virtual Tours**: Support for 360° virtual tours
- **Location-Based Search**: Properties can be filtered by location (city, district, province)
- **Verification**: Only verified landlords can list properties

### 4. Payment Integration
- **eSewa Payment**: Integrated eSewa payment gateway for rent payments
- **Card Payment**: Simulated Stripe test-mode flow for card payments (no real gateway call — `POST /api/payment/stripe/initiate` fabricates a test transaction and the frontend Stripe form collects test card details)
- **Payment Flow**: Users can pay directly from property detail pages

### 5. Contact System
- **Contact Landlord**: Seekers can contact landlords through the platform
- **Email Notifications**: Automatic email notifications for contacts

### 6. Admin Panel
- **User Verification**: Admins can verify/reject seeker and landlord accounts
- **Property Management**: Admins can view and manage all properties
- **Dashboard**: Overview of all users, properties, and verifications

## Technical Stack

### Frontend
- **Framework**: React 19 + Vite 7 (migrated from Next.js — see `REACT_MIGRATION_SUMMARY.md`)
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, shadcn/ui
- **State Management**: React Hooks
- **Notifications**: react-toastify
- **API Client**: Fetch API with interceptors

### Backend
- **Framework**: Spring Boot (Java 17)
- **Database**: MySQL
- **ORM**: JPA/Hibernate
- **Security**: Spring Security with JWT
- **File Storage**: Cloudinary
- **Email**: Gmail SMTP
- **Payment**: eSewa, Stripe (simulated test mode)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `GET /api/auth/verify-email?token={token}` - Verify email
- `POST /api/auth/resend-verification` - Resend verification email

### Properties
- `GET /api/properties` - Get all properties (requires auth)
- `GET /api/properties/{id}` - Get property by ID
- `GET /api/properties/my-properties` - Get landlord's properties
- `POST /api/properties/create` - Create new property (landlord only, verified)
- `PUT /api/properties/{id}` - Update property
- `DELETE /api/properties/{id}` - Delete property

### Images
- `POST /api/images/upload` - Upload profile/image
- `POST /api/images/upload-citizenship` - Upload citizenship document
- `POST /api/images/upload-kyc` - Upload KYC document
- `POST /api/images/upload-property-document` - Upload property document

### Payments
- `POST /api/payment/esewa` - Initiate eSewa payment
- `POST /api/payment/verify` - Verify eSewa payment
- `POST /api/payment/stripe/initiate` - Initiate Stripe card payment (test mode)
- `POST /api/payment/stripe/process` - Process Stripe card payment (test mode)

### Admin
- `GET /api/admin/users` - Get all users (admin only)
- `PUT /api/admin/users/{id}/verify` - Verify user (admin only)
- `PUT /api/admin/users/{id}/reject` - Reject user (admin only)
- `GET /api/admin/properties` - Get all properties (admin only)

## Setup Instructions

### Backend Setup
1. Navigate to `griha-mate-backend`
2. Update `application.properties` with your credentials:
   - MySQL database credentials
   - Gmail SMTP credentials (App Password)
   - Cloudinary credentials
   - eSewa credentials
   - (Card payments need no gateway credentials: the Stripe flow is simulated in test mode)
3. Run: `mvn spring-boot:run`
4. Server starts on `http://localhost:8081`

### Frontend Setup
1. Navigate to `griha-mate-react`
2. Install dependencies: `npm install`
3. Run: `npm run dev`
4. App starts on `http://localhost:3000`

## Verification Flow

### Seeker Verification
1. User registers with citizenship documents
2. Documents uploaded to Cloudinary
3. Admin reviews documents
4. Admin verifies/rejects account
5. Only verified seekers can contact landlords and make payments

### Landlord Verification
1. User registers with KYC and property documents
2. Documents uploaded to Cloudinary
3. Admin reviews documents
4. Admin verifies/rejects account
5. Only verified landlords can list properties

## Payment Integration

### eSewa Integration
1. User clicks "Pay with eSewa"
2. Frontend calls `/api/payments/esewa/initiate`
3. Backend generates eSewa payment URL
4. User redirected to eSewa
5. After payment, eSewa redirects to callback URL
6. Backend verifies payment via `/api/payments/esewa/verify`

### Stripe Card Payment (simulated test mode)
1. User clicks "Pay with Card"
2. Frontend opens the Stripe payment form (`/payment/stripe`)
3. User enters card details (test mode)
4. No external gateway is called: `POST /api/payment/stripe/initiate` fabricates a test transaction id and `POST /api/payment/stripe/process` validates the card locally (accepts test cards starting with 4, 5 or 3)
5. Confirmation sent to user

## Security Features
- JWT token-based authentication
- Role-based access control (RBAC)
- Email verification required
- Account verification required for critical actions
- Encrypted password storage (BCrypt)
- CORS protection
- Input validation

## Environment Variables

### Backend (`application.properties`)
```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/grihamate
spring.datasource.username=root
spring.datasource.password=your_password

# JWT
jwt.secret=your-secret-key
jwt.expiration=86400000

# Email
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password

# Cloudinary
cloudinary.cloud.name=your-cloud-name
cloudinary.api.key=your-api-key
cloudinary.api.secret=your-api-secret

# eSewa
esewa.product.code=EPAYTEST
esewa.secret=your-secret

# Card payments (simulated Stripe test mode)
# No gateway credentials are configured here: the Stripe flow is
# simulated in PaymentController. SPRITE_API_KEY / SPRITE_API_SECRET
# environment variables are read there but are not sent to any API.
```

### Frontend (`.env.local`)
```env
VITE_API_URL=http://localhost:8081/api
```

## Testing with TestSprite

### Setup TestSprite
1. Install TestSprite: `npm install -g testsprite`
2. Initialize: `testsprite init`
3. Configure test scope (codebase or diff)
4. Run tests: `testsprite test`

### Test Coverage
- User registration (seeker and landlord)
- User login
- Profile image upload
- Document uploads
- Property creation
- Payment flows
- Admin verification

## Deployment

### Backend
1. Build: `mvn clean package`
2. Run JAR: `java -jar target/griha-mate-backend.jar`
3. Or deploy to cloud platform (Heroku, AWS, etc.)

### Frontend
1. Build: `npm run build`
2. Start: `npm run dev`
3. Or deploy to Vercel/Netlify

## Troubleshooting

### Registration Not Working
- Check backend logs for errors
- Verify database connection
- Check Cloudinary credentials
- Ensure email service is configured

### Payment Issues
- Verify eSewa credentials (card payments are simulated in test mode, no gateway credentials)
- Check payment callback URLs
- Review payment logs

### Image Upload Fails
- Check Cloudinary credentials
- Verify file size limits
- Check CORS settings

## Support
For issues or questions, contact the development team.







