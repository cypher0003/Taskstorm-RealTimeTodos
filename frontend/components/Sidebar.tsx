import { Users, PlusCircle } from 'lucide-react';

const friends = [
  { id: 1, name: 'Anna' },
  { id: 2, name: 'Max' },
  { id: 3, name: 'Lisa' }
];

export default function Sidebar({ onAddWorkspace }: { onAddWorkspace: () => void }) {
  return (
    <div className="sidebar-container">
      <div className="sidebar-list-header">
        <Users className="sidebar-list-icon" />
        <h3 className="sidebar-title">To-Do Workspaces</h3>
      </div>
      <div className="sidebar-list-items">
      </div>
      <div className="add-todo-button" onClick={onAddWorkspace}>
        <PlusCircle className="add-todo-icon" />
        <span>Workspace hinzufügen</span>
      </div>
    </div>
  );
}