import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useIdleTimer } from '@/hooks/useIdleTimer';

export const AutoLogoutHandler = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        try {
            // Check if user is logged in
            const token = localStorage.getItem('token');
            const userStr = localStorage.getItem('user');

            if (token && userStr) {
                // Clear auth data
                localStorage.removeItem('token');
                localStorage.removeItem('user');

                // Notify user
                toast.info("Session expired due to inactivity. Please login again.", {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });

                // Redirect to login
                navigate('/login');
            }
        } catch (error) {
            console.error("Auto logout error:", error);
        }
    };

    // 10 minutes = 10 * 60 * 1000 = 600000 ms
    useIdleTimer(handleLogout, 600000);

    return null; // This component doesn't render anything
};
