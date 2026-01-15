import { useEffect, useState } from "react"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { adminAPI, roomRequestAPI } from "@/lib/api"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Users, Clock, CheckCircle2, MapPin } from "lucide-react"

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        pendingUsers: 0,
        verifiedUsers: 0,
        totalRequests: 0,
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const users = await adminAPI.getAllUsers()
                const requests = await roomRequestAPI.getAll()

                setStats({
                    totalUsers: users.length,
                    pendingUsers: users.filter((u: any) => u.verificationStatus === 'PENDING').length,
                    verifiedUsers: users.filter((u: any) => u.verificationStatus === 'VERIFIED').length,
                    totalRequests: requests.length
                })
            } catch (e) {
                console.error("Failed to fetch dashboard stats", e)
            }
        }
        fetchData()
    }, [])

    const data = [
        { name: 'Jan', value: 400 },
        { name: 'Feb', value: 300 },
        { name: 'Mar', value: 600 },
        { name: 'Apr', value: 800 },
        { name: 'May', value: 500 },
        { name: 'Jun', value: 900 },
        { name: 'Jul', value: 1000 },
    ]

    const pieData = [
        { name: 'Verified', value: stats.verifiedUsers },
        { name: 'Pending', value: stats.pendingUsers },
        { name: 'Other', value: stats.totalUsers - stats.verifiedUsers - stats.pendingUsers },
    ]

    const COLORS = ['#10b981', '#f59e0b', '#ef4444']

    return (
        <AdminLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#0D2440]">Dashboard Overview</h1>
                <p className="text-[#2E5E99]">Welcome back, Admin</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatsCard title="Total Users" value={stats.totalUsers} icon={Users} color="text-blue-600" />
                <StatsCard title="Pending Verifications" value={stats.pendingUsers} icon={Clock} color="text-orange-500" />
                <StatsCard title="Verified Users" value={stats.verifiedUsers} icon={CheckCircle2} color="text-green-500" />
                <StatsCard title="Active Requests" value={stats.totalRequests} icon={MapPin} color="text-purple-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-none shadow-md rounded-2xl overflow-hidden">
                    <CardHeader>
                        <CardTitle>Platform Growth</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2E5E99" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#2E5E99" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7F0FA" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#7BA4D0' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#7BA4D0' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ color: '#2E5E99' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="#2E5E99" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md rounded-2xl overflow-hidden">
                    <CardHeader>
                        <CardTitle>User Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center gap-4 mt-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                <span className="text-sm text-gray-600">Verified</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-orange-500" />
                                <span className="text-sm text-gray-600">Pending</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    )
}

function StatsCard({ title, value, icon: Icon, color }: any) {
    return (
        <Card className="border-none shadow-md hover:shadow-lg transition-all rounded-2xl">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">{title}</p>
                        <h3 className="text-2xl font-bold mt-1 text-[#0D2440]">{value}</h3>
                    </div>
                    <div className={`p-3 rounded-xl bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
                        <Icon className={`size-6 ${color}`} />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
