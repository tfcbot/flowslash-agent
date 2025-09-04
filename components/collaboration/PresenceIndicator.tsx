// Real-time presence indicator for collaborative editing
import React from 'react';
import db from '@/lib/db';

interface PresenceIndicatorProps {
  workflowId: string;
  currentUserId: string;
}

export function PresenceIndicator({ workflowId, currentUserId }: PresenceIndicatorProps) {
  // Query active users in this workflow
  const { data } = db.useQuery({
    presence: {
      $: { 
        where: { 
          workflowId,
          isOnline: true,
          lastSeen: { $gt: Date.now() - 30000 } // Active in last 30 seconds
        } 
      }
    }
  });

  const activeUsers = data?.presence?.filter(p => p.userId !== currentUserId) || [];

  if (activeUsers.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      <span className="text-sm text-[#fff5f5]/70">
        {activeUsers.length} other{activeUsers.length !== 1 ? 's' : ''} editing:
      </span>
      <div className="flex -space-x-2">
        {activeUsers.slice(0, 3).map((user) => (
          <div
            key={user.id}
            className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium"
            title={user.userName}
          >
            {user.userName.charAt(0).toUpperCase()}
          </div>
        ))}
        {activeUsers.length > 3 && (
          <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-500 flex items-center justify-center text-white text-xs font-medium">
            +{activeUsers.length - 3}
          </div>
        )}
      </div>
    </div>
  );
}

interface NodeCollaborationOverlayProps {
  workflowId: string;
  currentUserId: string;
}

export function NodeCollaborationOverlay({ workflowId, currentUserId }: NodeCollaborationOverlayProps) {
  // Query users with selected nodes
  const { data } = db.useQuery({
    presence: {
      $: { 
        where: { 
          workflowId,
          isOnline: true,
          lastSeen: { $gt: Date.now() - 10000 } // Active in last 10 seconds
        } 
      }
    }
  });

  const usersWithSelections = data?.presence?.filter(p => 
    p.userId !== currentUserId && 
    p.selectedNodeIds && 
    Array.isArray(p.selectedNodeIds) && 
    p.selectedNodeIds.length > 0
  ) || [];

  if (usersWithSelections.length === 0) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      {usersWithSelections.map((user) => (
        user.selectedNodeIds?.map((nodeId: string) => (
          <div
            key={`${user.id}-${nodeId}`}
            className="absolute"
            style={{
              // Position overlay on the selected node
              // This would need to be calculated based on node position
              border: '2px solid rgba(59, 130, 246, 0.8)',
              borderRadius: '8px',
              background: 'rgba(59, 130, 246, 0.1)',
              pointerEvents: 'none',
            }}
          >
            <div className="absolute -top-6 left-0 text-xs bg-blue-500 text-white px-2 py-1 rounded">
              {user.userName}
            </div>
          </div>
        ))
      ))}
    </div>
  );
}