import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { feedbackAPI } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Star, MessageSquare, User, Calendar, Loader2, Trash2 } from "lucide-react"
import { toast } from "react-toastify"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/Pagination"

export default function AdminSettingsPage() {
    const [feedbacks, setFeedbacks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    useEffect(() => {
        fetchFeedbacks()
    }, [])

    const fetchFeedbacks = async () => {
        try {
            setLoading(true)
            const data = await feedbackAPI.getAll()
            setFeedbacks(data)
        } catch (error: any) {
            toast.error("Failed to load feedbacks")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this feedback?")) {
            return
        }

        try {
            await feedbackAPI.delete(id)
            toast.success("Feedback deleted successfully")
            setFeedbacks(feedbacks.filter(f => f.id !== id))
            // Adjust current page if the last item on the page is deleted
            const totalPages = Math.ceil((feedbacks.length - 1) / pageSize)
            if (currentPage > totalPages && totalPages > 0) {
                setCurrentPage(totalPages)
            }
        } catch (error: any) {
            toast.error("Failed to delete feedback")
        }
    }

    const getRatingColor = (rating: number) => {
        if (rating >= 4) return "bg-green-50 text-green-700"
        if (rating >= 3) return "bg-yellow-50 text-yellow-700"
        return "bg-red-50 text-red-700"
    }

    const averageRating = feedbacks.length > 0
        ? (feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbacks.length).toFixed(1)
        : "0.0"

    // Pagination calculations
    const totalPages = Math.ceil(feedbacks.length / pageSize)
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedFeedbacks = feedbacks.slice(startIndex, endIndex)

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handlePageSizeChange = (size: number) => {
        setPageSize(size)
        setCurrentPage(1)
    }

    return (
        <AdminLayout>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-slate-900">User Feedback</h1>
                    <p className="text-slate-600 font-medium">View and manage user feedback submissions</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-none shadow-lg rounded-3xl bg-gradient-to-br from-blue-50 to-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-slate-600 uppercase tracking-widest mb-1">Total Feedbacks</p>
                                    <p className="text-3xl font-black text-slate-900">{feedbacks.length}</p>
                                </div>
                                <div className="size-14 bg-blue-100 rounded-2xl flex items-center justify-center">
                                    <MessageSquare className="size-7 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-lg rounded-3xl bg-gradient-to-br from-green-50 to-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-slate-600 uppercase tracking-widest mb-1">Average Rating</p>
                                    <p className="text-3xl font-black text-slate-900">{averageRating}</p>
                                </div>
                                <div className="size-14 bg-green-100 rounded-2xl flex items-center justify-center">
                                    <Star className="size-7 text-green-600 fill-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-lg rounded-3xl bg-gradient-to-br from-amber-50 to-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-slate-600 uppercase tracking-widest mb-1">High Ratings (4+)</p>
                                    <p className="text-3xl font-black text-slate-900">
                                        {feedbacks.filter(f => f.rating >= 4).length}
                                    </p>
                                </div>
                                <div className="size-14 bg-amber-100 rounded-2xl flex items-center justify-center">
                                    <Star className="size-7 text-amber-600 fill-amber-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Feedbacks List */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm">
                        <Loader2 className="size-10 text-primary animate-spin mb-4" />
                        <p className="text-gray-500 font-medium">Loading feedbacks...</p>
                    </div>
                ) : feedbacks.length === 0 ? (
                    <Card className="border-none shadow-lg rounded-3xl bg-white p-12 text-center">
                        <div className="size-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <MessageSquare className="size-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No feedbacks yet</h3>
                        <p className="text-gray-500">Users haven't submitted any feedback yet.</p>
                    </Card>
                ) : (
                    <>
                    <div className="space-y-4">
                            {paginatedFeedbacks.map((feedback) => (
                            <Card key={feedback.id} className="border-none shadow-md rounded-2xl overflow-hidden bg-white hover:shadow-lg transition-all">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                                    <User className="size-5 text-primary" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900">{feedback.seekerName || 'Anonymous'}</h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Calendar className="size-3 text-gray-400" />
                                                        <span className="text-xs text-gray-500">
                                                            {new Date(feedback.createdAt).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {feedback.comment && (
                                                <div className="pl-12">
                                                    <p className="text-slate-700 leading-relaxed">{feedback.comment}</p>
                                                </div>
                                            )}
                                        </div>

                                            <div className="flex flex-col items-end gap-3">
                                        <div className="flex flex-col items-end gap-2">
                                            <Badge className={`${getRatingColor(feedback.rating)} border-none px-3 py-1 font-bold`}>
                                                <div className="flex items-center gap-1.5">
                                                    <Star className="size-3 fill-current" />
                                                    <span>{feedback.rating}/5</span>
                                                </div>
                                            </Badge>
                                            <div className="flex gap-0.5">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        className={`size-4 ${star <= feedback.rating
                                                            ? "fill-yellow-400 text-yellow-400"
                                                            : "text-gray-300"
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDelete(feedback.id)}
                                                    className="text-red-600 hover:bg-red-50 hover:!text-red-700 border-red-200"
                                                >
                                                    <Trash2 className="size-4 mr-2" />
                                                    Delete
                                                </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                        {/* Pagination */}
                        {feedbacks.length > 0 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={feedbacks.length}
                                pageSize={pageSize}
                                onPageChange={handlePageChange}
                                onPageSizeChange={handlePageSizeChange}
                                pageSizeOptions={[5, 10, 20, 30]}
                            />
                        )}
                    </>
                )}
            </div>
        </AdminLayout>
    )
}
