'use client';

import { useParams } from 'next/navigation';
import Workspace from '../Workspace';


export default function WorkspacePage() {
  const { workspaceId } = useParams() as { workspaceId: string };

  return (
      <Workspace 
        workspaceId={workspaceId} 
      />
    );
}