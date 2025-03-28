'use client';

import { useParams } from 'next/navigation';
import Workspace from '../Workspace';


export default function WorkspacePage() {
  const { id } = useParams() as {id: string};

  return (
      <Workspace 
        workspaceId={id} 
      />
    );
}