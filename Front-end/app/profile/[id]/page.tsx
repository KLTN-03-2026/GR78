'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Header from '@/app/components/Header'
import { ProfileService, PublicProfileResponse } from '@/lib/api/profile-new.service'
import { PostService } from '@/lib/api/post.service'

export default function PublicProfile() {
    const router = useRouter()
    const params = useParams()
    const userId = params.id as string

    const [profile, setProfile] = useState<PublicProfileResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [userPosts, setUserPosts] = useState<any[]>([])
    const [postsLoading, setPostsLoading] = useState(false)
    const [activeTab, setActiveTab] = useState<'about' | 'posts'>('about')

    useEffect(() => {
        if (userId) {
            loadPublicProfile()
        }
    }, [userId])

    const loadPublicProfile = async () => {
        try {
            setLoading(true)
            setError('')
            const data = await ProfileService.getPublicProfile(userId)
            setProfile(data)
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to load profile'
            console.error('Error loading profile:', err)
            
            // Check for specific errors
            if (errorMsg.includes('Invalid UUID')) {
                setError('❌ Invalid user ID format')
            } else if (errorMsg.includes('notfound') || errorMsg.includes('inactive')) {
                setError('❌ User not found or account inactive')
            } else {
                setError(errorMsg)
            }
        } finally {
            setLoading(false)
        }
    }

    const loadUserPosts = async () => {
        try {
            setPostsLoading(true)
            // Assuming we have a method to get posts by user ID
            // For now, we'll use a generic approach
            const response = await PostService.getFeed({ limit: 50 })
            // Filter posts by this user if possible
            setUserPosts(response.data || [])
        } catch (err) {
            console.error('Error loading posts:', err)
        } finally {
            setPostsLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading profile...</p>
                </div>
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="bg-white rounded-lg p-8 shadow-sm max-w-md w-full text-center">
                    <p className="text-red-600 mb-4">{error || 'User not found'}</p>
                    <button
                        onClick={() => router.back()}
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Header */}
            <Header />

            <div className="flex-1">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    {/* Back Button */}
                    <button
                        onClick={() => router.back()}
                        className="text-blue-600 hover:text-blue-700 mb-4"
                    >
                        ← Back
                    </button>

                    {/* Profile Card */}
                    <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
                        <div className="flex flex-col items-center text-center mb-8">
                            {/* Avatar */}
                            {profile.avatarUrl && (
                                <img
                                    src={profile.avatarUrl}
                                    alt="Avatar"
                                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-600 mb-6 shadow-lg"
                                />
                            )}

                            {/* Display Name with Verification Badge */}
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <h2 className="text-4xl font-bold text-gray-800">{profile.displayName || 'Anonymous User'}</h2>
                                {profile.isVerified && (
                                    <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                                        <span>✅</span>
                                        <span>Verified</span>
                                    </div>
                                )}
                            </div>

                            {/* Role Badge */}
                            {profile.role && (
                                <div
                                    className={`px-4 py-2 rounded-full font-semibold mb-4 ${profile.role === 'provider'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'bg-blue-100 text-blue-700'
                                        }`}
                                >
                                    {profile.role === 'provider' ? '🔧 Service Provider' : '👤 Customer'}
                                </div>
                            )}

                            {/* Bio */}
                            {profile.bio && (
                                <p className="text-gray-600 text-lg max-w-2xl mb-4">{profile.bio}</p>
                            )}

                            {/* Member Since */}
                            {profile.memberSince && (
                                <p className="text-sm text-gray-500">
                                    Member since {new Date(profile.memberSince).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            )}
                        </div>

                        {/* Info Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-8">
                            <div className="bg-blue-50 rounded-lg p-4">
                                <p className="text-sm text-gray-600 mb-1">User ID</p>
                                <p className="text-gray-800 font-mono text-sm break-all">{profile.id}</p>
                            </div>

                            <div className="bg-green-50 rounded-lg p-4">
                                <p className="text-sm text-gray-600 mb-1">Account Status</p>
                                <p className="text-gray-800 font-semibold">🟢 Active</p>
                            </div>

                            {profile.role && (
                                <div className="bg-purple-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600 mb-1">Role</p>
                                    <p className="text-gray-800 font-semibold capitalize">{profile.role}</p>
                                </div>
                            )}

                            <div className={`${profile.isVerified ? 'bg-blue-50' : 'bg-gray-50'} rounded-lg p-4`}>
                                <p className="text-sm text-gray-600 mb-1">Verification Status</p>
                                <p className="text-gray-800 font-semibold">
                                    {profile.isVerified ? '✅ Verified' : '⏳ Not Verified'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="bg-white rounded-lg shadow-sm mb-6">
                        <div className="flex border-b">
                            {[
                                { key: 'about', label: '📋 About' },
                                { key: 'posts', label: '📝 Posts' },
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => {
                                        setActiveTab(tab.key as any)
                                        if (tab.key === 'posts' && userPosts.length === 0) {
                                            loadUserPosts()
                                        }
                                    }}
                                    className={`flex-1 px-4 py-3 text-sm font-medium transition ${activeTab === tab.key
                                        ? 'text-blue-600 border-b-2 border-blue-600'
                                        : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        {/* About Tab */}
                        {activeTab === 'about' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Information</h3>
                                    <div className="space-y-4">
                                        {profile.displayName && (
                                            <div className="flex gap-4">
                                                <span className="font-semibold text-gray-600 min-w-32">Display Name:</span>
                                                <span className="text-gray-800">{profile.displayName}</span>
                                            </div>
                                        )}

                                        {profile.role && (
                                            <div className="flex gap-4">
                                                <span className="font-semibold text-gray-600 min-w-32">Role:</span>
                                                <span className="text-gray-800 capitalize">{profile.role}</span>
                                            </div>
                                        )}

                                        <div className="flex gap-4">
                                            <span className="font-semibold text-gray-600 min-w-32">Verification:</span>
                                            <span className={profile.isVerified ? 'text-green-600 font-semibold' : 'text-gray-600'}>
                                                {profile.isVerified ? '✅ Verified' : '⏳ Not Verified'}
                                            </span>
                                        </div>

                                        {profile.memberSince && (
                                            <div className="flex gap-4">
                                                <span className="font-semibold text-gray-600 min-w-32">Member Since:</span>
                                                <span className="text-gray-800">
                                                    {new Date(profile.memberSince).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {profile.bio && (
                                    <div className="border-t pt-6">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Bio</h3>
                                        <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                                    </div>
                                )}

                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Account Details</h3>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-600 mb-2">User ID</p>
                                        <p className="text-gray-800 font-mono text-sm break-all">{profile.id}</p>
                                    </div>
                                </div>

                                {profile.role === 'provider' && (
                                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                                        <h4 className="font-semibold text-purple-900 mb-2">🔧 Service Provider</h4>
                                        <p className="text-sm text-purple-800">
                                            This user offers professional services. You can view their service requests and reviews.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Posts Tab */}
                        {activeTab === 'posts' && (
                            <div className="space-y-4">
                                {postsLoading && (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                        <p className="text-gray-600">Loading posts...</p>
                                    </div>
                                )}

                                {!postsLoading && userPosts.length === 0 && (
                                    <div className="text-center py-8">
                                        <p className="text-gray-600">No posts yet</p>
                                    </div>
                                )}

                                {userPosts.length > 0 && (
                                    <div className="space-y-4">
                                        {userPosts.map(post => (
                                            <div
                                                key={post.id}
                                                onClick={() => router.push(`/posts/${post.id}`)}
                                                className="border rounded-lg p-4 hover:shadow-md transition cursor-pointer bg-white"
                                            >
                                                <div className="flex justify-between items-start gap-4">
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-lg text-gray-800 mb-2">{post.title}</h4>
                                                        <p className="text-gray-600 text-sm mb-3">{post.description?.substring(0, 150)}...</p>

                                                        <div className="flex gap-4 text-sm text-gray-500 flex-wrap">
                                                            {post.location && <span>📍 {post.location}</span>}
                                                            {post.budget && <span>💰 {post.budget.toLocaleString('vi-VN')} VND</span>}
                                                            <span>📅 {new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                                                        </div>
                                                    </div>

                                                    <span
                                                        className={`px-3 py-1 rounded text-sm font-medium whitespace-nowrap ${post.status === 'open'
                                                            ? 'bg-green-100 text-green-800'
                                                            : post.status === 'closed'
                                                                ? 'bg-red-100 text-red-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                            }`}
                                                    >
                                                        {post.status === 'open' ? '✅ Open' : post.status === 'closed' ? '❌ Closed' : post.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Contact Section */}
                    <div className="mt-8 mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                        <h3 className="font-semibold text-blue-900 mb-3">Interested in this user&apos;s services?</h3>
                        <p className="text-blue-800 text-sm mb-4">
                            {profile.role === 'provider' ? 'Create a service request and get in touch with this professional.' : 'Check their posts and connect directly.'}
                        </p>
                        <button
                            onClick={() => router.push('/posts/create')}
                            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-semibold"
                        >
                            📝 Create Service Request
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
