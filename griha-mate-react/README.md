# GrihaMate React Application

This is the React.js version of the GrihaMate application, migrated from Next.js while preserving all the original designs and functionality.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# or using pnpm
pnpm install
```

### Development

```bash
# Start the development server
npm run dev

# The app will be available at http://localhost:3000/ (see `vite.config.ts`)
```

### Build for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

## 📁 Project Structure

```
griha-mate-react/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── ui/          # Shadcn/ui components
│   │   ├── navbar.tsx   # Navigation bar
│   │   ├── footer.tsx   # Footer component
│   │   └── ...
│   ├── pages/           # Page components (routes)
│   │   ├── Home.tsx
│   │   ├── About.tsx
│   │   ├── Explore.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   └── ...
│   ├── lib/             # Utility functions and API
│   │   ├── api.ts       # API client
│   │   └── utils.ts     # Helper functions
│   ├── hooks/           # Custom React hooks
│   ├── App.tsx          # Main app component with routing
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles
├── public/              # Static assets (images, icons)
└── package.json
```

## 🔑 Key Features

- **React Router v7** - Client-side routing
- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe code
- **Tailwind CSS v4** - Utility-first styling
- **Radix UI** - Accessible UI components
- **React Hook Form** - Form management
- **React Toastify** - Toast notifications
- **Leaflet** - Interactive maps
- **Lucide React** - Beautiful icons

## 🎨 Design

All designs from the Next.js version have been preserved:
- ✅ Same color scheme and branding
- ✅ Mobile-first responsive design
- ✅ All animations and transitions
- ✅ 360° virtual tour functionality
- ✅ AI-powered voice search

## 🔧 API Configuration

The application connects to the backend API at `http://localhost:8081/api` by default.

To change this, update the `API_BASE_URL` in `src/lib/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';
```

Then copy `.env.example` to `.env.local` and set it there:

```env
VITE_API_URL=http://your-api-url.com/api
```

## 📱 Available Routes

Counted from `src/App.tsx` (40 paths, plus the landlord dashboard index route and a `*` catch-all for unknown URLs):

**Public**
- `/` - Home page
- `/about` - About GrihaMate
- `/explore` - Browse properties
- `/how-it-works` - How it works page
- `/login` - User login
- `/register` - User registration
- `/forgot-password` - Request a password reset
- `/reset-password` - Set a new password
- `/profile` - User profile
- `/property/:id` - Property details
- `/favorites` - Saved properties
- `/room-request` - Request a room
- `/contact` - Contact page
- `/terms` - Terms of service
- `/privacy` - Privacy policy
- `/help` - Help center
- `/trust-safety` - Trust & Safety

**Seeker dashboard**
- `/dashboard/seeker` - Seeker dashboard
- `/dashboard/seeker/my-requests` - Own room requests
- `/dashboard/seeker/feedback` - Leave feedback
- `/dashboard/seeker/availability-requests` - Availability subscriptions

**Landlord dashboard** (nested under `/dashboard/landlord`)
- `/dashboard/landlord` - Landlord dashboard
- `/dashboard/landlord/requests` - Incoming requests
- `/dashboard/landlord/profile` - Landlord profile
- `/dashboard/landlord/manage-properties` - Manage listings
- `/dashboard/landlord/edit-property/:id` - Edit a listing
- `/dashboard/landlord/properties/:id` - Listing details
- `/dashboard/landlord/list-property` - List a new property

**Admin**
- `/admin` - Admin panel
- `/admin/login` - Admin login
- `/admin/users` and `/admin/users/:id` - Manage users
- `/admin/properties` and `/admin/properties/:id` - Manage properties
- `/admin/premium-users` and `/admin/premium-users/:id` - Premium users
- `/admin/requests` - Property requests
- `/admin/user-feedback` - User feedback

**Payments**
- `/payment/success` - Payment succeeded
- `/payment/failure` - Payment failed

## 🔐 Authentication

The app uses JWT token-based authentication:
- Token is stored in `localStorage`
- User data is stored in `localStorage`
- Protected routes redirect to login if not authenticated

## 🛠️ Technologies Used

- **React 19.2.0** - UI library
- **React Router DOM 7.12.0** - Routing
- **Vite 7.2.4** - Build tool
- **TypeScript 5.9.3** - Type safety
- **Tailwind CSS 4.1.18** - Styling
- **@radix-ui/** - Accessible components
- **Lucide React** - Icon library
- **React Toastify** - Notifications
- **React Hook Form** - Forms
- **Zod** - Schema validation
- **Leaflet** - Maps
- **Recharts** - Charts

## 📝 Migration Notes

This React app was migrated from Next.js with the following changes:

### Replaced:
- ❌ Next.js App Router → ✅ React Router
- ❌ `next/link` → ✅ `react-router-dom` Link
- ❌ `next/navigation` hooks → ✅ React Router hooks
- ❌ Next.js Image → ✅ Standard `<img>` tags
- ❌ Server Components → ✅ Client-side Components

### Preserved:
- ✅ All UI components and designs
- ✅ API integration
- ✅ Authentication logic
- ✅ Form validation
- ✅ State management
- ✅ Styling and animations

## 🐛 Known Issues

None at the moment! If you encounter any issues, please report them.

## 📄 License

This project is proprietary software for GrihaMate.

---

Built with ❤️ in Nepal
