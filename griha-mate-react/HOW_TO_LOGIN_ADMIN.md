# How to Login as Admin 👨‍💼

## Quick Steps

### 1. **Start the Backend Server**
   - Make sure your backend is running on `http://localhost:8081`
   - The admin user is automatically created when the backend starts

### 2. **Open the Login Page**
   - Navigate to: `http://localhost:3000/login`
   - Or click "Login" from the navigation bar

### 3. **Enter Admin Credentials**
   ```
   Email:    admin@grihamate.com
   Password: admin123
   ```

### 4. **Click "Sign In"**
   - After successful login, you'll be automatically redirected to `/admin`
   - You'll see the Admin Dashboard

## Admin Dashboard Features

Once logged in, you can:

✅ **View All Users**
   - See total users count
   - View pending, verified, and rejected users

✅ **Verify Users**
   - Approve seeker and landlord accounts
   - Review their documents

✅ **Reject Users**
   - Reject accounts that don't meet requirements

✅ **Manage Platform**
   - Monitor user activity
   - Control platform access

## Visual Guide

```
┌─────────────────────────────────────┐
│  1. Go to Login Page                 │
│     http://localhost:3000/login      │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  2. Enter Credentials                │
│     Email: admin@grihamate.com       │
│     Password: admin123               │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  3. Click "Sign In" Button           │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  4. Auto-redirected to Admin Panel   │
│     http://localhost:3000/admin     │
└─────────────────────────────────────┘
```

## Troubleshooting

### ❌ "Invalid email or password"
- **Check:** Make sure backend is running
- **Check:** Verify credentials are correct:
  - Email: `admin@grihamate.com` (exact match)
  - Password: `admin123` (case-sensitive)
- **Solution:** Restart backend to ensure admin user is created

### ❌ "Access denied. Admin only."
- **Check:** You're logged in with a non-admin account
- **Solution:** Logout and login again with admin credentials

### ❌ "Please login to access admin panel"
- **Check:** You're not logged in
- **Solution:** Go to `/login` and enter admin credentials

### ❌ Admin user doesn't exist
- **Check:** Backend logs for "Creating admin user..." message
- **Solution:** 
  1. Stop backend
  2. Check database connection
  3. Restart backend
  4. Check logs for admin creation confirmation

## Direct Admin URL

If you're already logged in as admin, you can directly access:
```
http://localhost:3000/admin
```

## Security Reminder 🔒

**For Development:**
- Default credentials are fine for testing

**For Production:**
- ⚠️ **CHANGE PASSWORD IMMEDIATELY**
- Use a strong password (12+ characters)
- Enable additional security measures
- Monitor admin access logs

## Admin Credentials Summary

| Field | Value |
|-------|-------|
| **Email** | `admin@grihamate.com` |
| **Password** | `admin123` |
| **Role** | `ADMIN` |
| **Status** | Active, Verified |

---

**Need Help?** Check `ADMIN_CREDENTIALS.md` for more details.


