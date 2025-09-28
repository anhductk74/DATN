'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { userService } from '@/services';
import { ApiResponse } from '@/types/auth';

export default function UserProfile() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!session) return;

    setLoading(true);
    setError(null);

    try {
      const response: ApiResponse<any> = await userService.getUserProfile();
      setProfile(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status, session]);

  if (status === 'loading') {
    return <div>Loading session...</div>;
  }

  if (status === 'unauthenticated') {
    return <div>Please login to view profile</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">User Profile</h2>
      
      {/* Session Info */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Session Info</h3>
        <div className="bg-gray-100 p-4 rounded">
          <p><strong>User ID:</strong> {session?.user?.id}</p>
          <p><strong>Email:</strong> {session?.user?.email}</p>
          <p><strong>Name:</strong> {session?.user?.name}</p>
          <p><strong>Username:</strong> {session?.user?.username}</p>
          <p><strong>Roles:</strong> {session?.user?.roles?.join(', ')}</p>
          <p><strong>Has Access Token:</strong> {session?.accessToken ? 'Yes' : 'No'}</p>
        </div>
      </div>

      {/* API Profile Data */}
      <div>
        <h3 className="text-lg font-semibold mb-2">API Profile Data</h3>
        {loading && <div>Loading profile...</div>}
        {error && <div className="text-red-500">Error: {error}</div>}
        {profile && (
          <div className="bg-gray-100 p-4 rounded">
            <pre>{JSON.stringify(profile, null, 2)}</pre>
          </div>
        )}
        <button 
          onClick={fetchProfile}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={loading}
        >
          Refresh Profile
        </button>
      </div>
    </div>
  );
}