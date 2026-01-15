# Admin Credentials 🔐

## Default Admin Account

The admin user is automatically created when the backend application starts (if it doesn't already exist).

### Login Credentials

**Email:** `admin@grihamate.com`  
**Password:** `admin123`

### Access

- **Admin Panel URL:** `/admin` (after login)
- **Role:** `ADMIN`
- **Permissions:** 
  - View all users
  - Verify/Reject user accounts
  - Manage platform content

## How It Works

The admin user is created automatically by the `DataSeeder` class when the Spring Boot application starts. The seeder checks if an admin user with email `admin@grihamate.com` exists, and if not, creates one with the default credentials.

## Security Note ⚠️

**Important:** These are default development credentials. For production:

1. **Change the password immediately** after first login
2. **Use a strong password** (minimum 12 characters, mix of letters, numbers, symbols)
3. **Enable 2FA** if available
4. **Restrict admin access** to trusted IPs if possible
5. **Monitor admin activity** logs

## Creating Additional Admin Users

To create additional admin users, you can:

1. **Via Database** (Direct SQL):
   ```sql
   INSERT INTO users (full_name, email, password, phone_number, role, active, email_verified, verification_status, created_at, updated_at)
   VALUES (
     'Admin Name',
     'newadmin@grihamate.com',
     '$2a$10$...', -- BCrypt encoded password
     '+977-9800000001',
     'ADMIN',
     true,
     true,
     'VERIFIED',
     NOW(),
     NOW()
   );
   ```

2. **Via Backend API** (if admin registration endpoint exists):
   - Register as a regular user
   - Manually update role to ADMIN in database

3. **Modify DataSeeder** to add more admin users

## Testing Admin Access

1. Start the backend server
2. Navigate to the login page
3. Enter credentials:
   - Email: `admin@grihamate.com`
   - Password: `admin123`
4. You should be redirected to `/admin` dashboard

## Troubleshooting

### Admin user not created?
- Check backend logs for "Creating admin user..." message
- Verify database connection is working
- Check if user already exists: `SELECT * FROM users WHERE email = 'admin@grihamate.com'`

### Can't login?
- Verify password is correct: `admin123`
- Check if account is active: `SELECT active FROM users WHERE email = 'admin@grihamate.com'`
- Verify email is verified: `SELECT email_verified FROM users WHERE email = 'admin@grihamate.com'`

### Access denied to `/admin`?
- Verify user role is `ADMIN` in database
- Check JWT token contains `ROLE_ADMIN` authority
- Ensure backend security config allows ADMIN role access

## Related Files

- **Backend Seeder:** `griha-mate-backend/src/main/java/com/grihamate/config/DataSeeder.java`
- **Admin Controller:** `griha-mate-backend/src/main/java/com/grihamate/controller/AdminController.java`
- **Admin Page:** `griha-mate-react/src/pages/Admin.tsx`
- **Security Config:** `griha-mate-backend/src/main/java/com/grihamate/config/SecurityConfig.java`

---

**Remember:** Change the default password in production! 🔒

