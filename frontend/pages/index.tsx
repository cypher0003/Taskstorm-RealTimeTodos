import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import NewWorkspace from '../components/NewWorkspace';

export default function Home() {
  const [isAddingWorkspace, setIsAddingWorkspace] = useState(false);

  function handleAddWorkspace() {
    setIsAddingWorkspace(true);
  }

  function handleCloseWorkspace() {
    setIsAddingWorkspace(false);
  }

  return (
    <>
      <Sidebar onAddWorkspace={handleAddWorkspace} />
      {isAddingWorkspace && <NewWorkspace onClose={handleCloseWorkspace} />}
    </>
  );
}