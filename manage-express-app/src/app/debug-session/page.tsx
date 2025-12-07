'use client';

import { useSession } from 'next-auth/react';
import { Card, Typography, Button } from 'antd';

const { Title, Paragraph } = Typography;

export default function SessionDebugPage() {
  const { data: session, status } = useSession();

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={2}>Session Debug</Title>
        
        <Title level={4}>Status: {status}</Title>
        
        <Title level={4}>Full Session:</Title>
        <pre style={{ 
          background: '#f5f5f5', 
          padding: '16px', 
          borderRadius: '4px',
          overflow: 'auto',
          maxHeight: '600px'
        }}>
          {JSON.stringify(session, null, 2)}
        </pre>

        <Title level={4}>Company Info:</Title>
        <pre style={{ 
          background: '#f5f5f5', 
          padding: '16px', 
          borderRadius: '4px',
          overflow: 'auto'
        }}>
          {JSON.stringify(session?.user?.company, null, 2)}
        </pre>

        <Button onClick={() => window.location.reload()}>
          Reload Page
        </Button>
      </Card>
    </div>
  );
}
