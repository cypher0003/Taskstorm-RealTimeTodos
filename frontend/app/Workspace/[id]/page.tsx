'use client';

import { useParams } from 'next/navigation';
import Workspace from '../workspace';


export default function WorkspacePage() {
  const { id } = useParams() as { id: string };
  console.log(id);

  return (
      <Workspace 
        workspaceId={id} 
      />
    );
}