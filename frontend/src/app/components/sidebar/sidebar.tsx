import { FC } from 'react';
interface sidebarProps {
  open: boolean;
}
const Sidebar: FC<sidebarProps> = ({ open }) => {
  return (
    open && (
      <aside className="w-64 bg-gray-800 text-white p-4">
        <nav className="flex flex-col gap-2">
          <a href="/dashboard">Dashboard</a>
          <a href="/dashboard/users">Users</a>
          <a href="/dashboard/settings">Settings</a>
        </nav>
      </aside>
    )
  );
};
export default Sidebar;
