'use client';

import { useParams } from 'next/navigation';
import Workspace from '../workspace';


export default function WorkspacePage() {
  const { workspaceId } = useParams() as {workspaceId: string};

  return (
      <Workspace 
        workspaceId={workspaceId} 
      />
    );
}