import React from 'react';
import { useSession } from 'next-auth/client';
import { useRouter } from 'next/router';

const Dashboard = () => {
  const [session, loading] = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !session) {
      router.push('/');
    }
  }, [session, loading, router]);

  if (loading) return (<p>Loading...</p>);
  if (!session) return null;

  return (
    <div>
      <h1>Dashboard</h1>
      {/* Your dashboard content here */}
    </div>
  );
};

export default Dashboard;