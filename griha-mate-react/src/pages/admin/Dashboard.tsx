import { useEffect, useState } from "react"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { adminAPI, propertyRequestAPI } from "@/lib/api"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Users, Clock, CheckCircle2, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await adminAPI.getStats()
                setStats(data)
            } catch (e) {
                console.error("Failed to fetch dashboard stats", e)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </AdminLayout>
        )
    }

    if (!stats) return null;

    const data = stats.growthData || []

    const pieData = [
        { name: 'Verified', value: stats.verifiedUsers },
        { name: 'Pending', value: stats.pendingUsers },
        { name: 'Other', value: Math.max(0, stats.totalUsers - stats.verifiedUsers - stats.pendingUsers) },
    ]

    const COLORS = ['#10b981', '#f59e0b', '#ef4444']

    return (
        <AdminLayout>
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-gray-200">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard Overview</h1>
                        <p className="text-slate-800 font-bold text-xs uppercase tracking-wide opacity-80">Real-time platform metrics and system health monitoring</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-green-700 font-black bg-green-50/50 px-6 py-3 rounded-full ring-1 ring-green-100 shadow-sm text-xs uppercase tracking-widest">
                            <div className="size-2 rounded-full bg-green-500 animate-pulse" />
                            System Optimized
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard title="Community Size" value={stats.totalUsers} icon={Users} color="blue" description="Total registered members" />
                    <StatsCard title="Awaiting Review" value={stats.pendingUsers + stats.pendingProperties} icon={Clock} color="orange" description="Users & Properties pending" pulse />
                    <StatsCard title="Active Listings" value={stats.totalProperties} icon={CheckCircle2} color="green" description={`${stats.verifiedProperties} verified properties`} />
                    <StatsCard title="Room Inquiries" value={stats.totalRoomRequests} icon={MapPin} color="purple" description="Live room seeker requests" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-2 border-none bg-white shadow-xl shadow-blue-900/5 rounded-3xl overflow-hidden p-6 border border-gray-100">
                        <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between mb-6">
                            <div>
                                <CardTitle className="text-xl font-black text-slate-900">Growth Intelligence</CardTitle>
                                <p className="text-[10px] text-slate-700 font-black uppercase tracking-[0.2em] mt-1">Platform performance metrics</p>
                            </div>
                        </CardHeader>
                        <CardContent className="h-[350px] px-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2E5E99" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#2E5E99" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7F0FA" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#A9CBF0', fontSize: 12, fontWeight: 600 }}
                                        dy={15}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#A9CBF0', fontSize: 12, fontWeight: 600 }}
                                        dx={-10}
                                    />
                                    <Tooltip
                                        cursor={{ stroke: '#2E5E99', strokeWidth: 2 }}
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                            backdropFilter: 'blur(10px)',
                                            borderRadius: '20px',
                                            border: '1px solid rgba(46, 94, 153, 0.1)',
                                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                            padding: '15px'
                                        }}
                                        itemStyle={{ color: '#2E5E99', fontWeight: 800 }}
                                    />
                                    <Area type="monotone" dataKey="users" stroke="#2E5E99" strokeWidth={5} fillOpacity={1} fill="url(#colorValue)" strokeLinecap="round" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="border-none bg-white shadow-xl shadow-blue-900/5 rounded-2xl overflow-hidden border border-gray-100">
                        <CardHeader className="p-4 pb-0 mb-4">
                            <CardTitle className="text-xl font-black text-slate-900">Verification Audit</CardTitle>
                            <p className="text-[10px] text-slate-700 font-black uppercase tracking-[0.2em] mt-1">User trust distribution</p>
                        </CardHeader>
                        <CardContent className="h-[250px] p-4 pt-0 flex flex-col justify-center">
                            <div className="relative h-full w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={85}
                                            cornerRadius={8}
                                            paddingAngle={8}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {pieData.map((_entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '16px',
                                                border: 'none',
                                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-xl font-black text-slate-900">{Math.round((stats.verifiedUsers / (stats.totalUsers || 1)) * 100)}%</span>
                                    <span className="text-[9px] text-slate-800 font-black uppercase tracking-widest leading-none mt-1">Trust Score</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mt-6">
                                <div className="bg-green-50 p-3 rounded-2xl border border-green-100">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                        <span className="text-[9px] font-black uppercase text-green-900">Verified</span>
                                    </div>
                                    <p className="text-lg font-black text-slate-900">{stats.verifiedUsers}</p>
                                </div>
                                <div className="bg-orange-50 p-3 rounded-2xl border border-orange-100">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                        <span className="text-[9px] font-black uppercase text-orange-900">Pending</span>
                                    </div>
                                    <p className="text-lg font-black text-slate-900">{stats.pendingUsers}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    )
}

function StatsCard({ title, value, icon: Icon, color, description, pulse }: any) {
    const colorMap: any = {
        blue: "bg-blue-50 text-blue-600 border-blue-100 shadow-blue-600/5",
        orange: "bg-orange-50 text-orange-600 border-orange-100 shadow-orange-600/5",
        green: "bg-green-50 text-green-600 border-green-100 shadow-green-600/5",
        purple: "bg-purple-50 text-purple-600 border-purple-100 shadow-purple-600/5"
    }

    return (
        <Card className="border-none bg-white shadow-xl shadow-blue-900/5 hover:-translate-y-1 transition-all duration-500 rounded-2xl group overflow-hidden border border-gray-100">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={cn(
                        "p-2.5 rounded-xl transition-transform duration-500 group-hover:scale-110",
                        colorMap[color].split(' ').slice(0, 2).join(' ')
                    )}>
                        <Icon className="size-4.5" />
                    </div>
                    {pulse && (
                        <div className="flex items-center gap-1">
                            <span className="flex h-1.5 w-1.5 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500"></span>
                            </span>
                            <span className="text-[8px] font-black text-orange-800 uppercase tracking-widest">Action Needed</span>
                        </div>
                    )}
                </div>
                <div>
                    <h3 className="text-2xl font-black text-slate-900 mb-0.5 group-hover:text-[#2E5E99] transition-colors">{value}</h3>
                    <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2">{title}</p>
                    <div className="pt-2.5 border-t border-gray-100">
                        <p className="text-[9px] font-black text-slate-800/60 uppercase tracking-widest truncate">{description}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ')
}
