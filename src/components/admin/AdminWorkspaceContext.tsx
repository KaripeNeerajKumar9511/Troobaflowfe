import { createContext, useContext, type ReactNode, useState } from 'react';

type AdminWorkspaceContextValue = {
  contextTitle: string | null;
  setContextTitle: (title: string | null) => void;
  contextSubtitle: string | null;
  setContextSubtitle: (subtitle: string | null) => void;
  /** When set, clicking the context title navigates here (e.g. back to user models). */
  titleLink: string | null;
  setTitleLink: (path: string | null) => void;
};

const AdminWorkspaceContext = createContext<AdminWorkspaceContextValue | undefined>(undefined);

export function AdminWorkspaceProvider({ children }: { children: ReactNode }) {
  const [contextTitle, setContextTitle] = useState<string | null>(null);
  const [contextSubtitle, setContextSubtitle] = useState<string | null>(null);
  const [titleLink, setTitleLink] = useState<string | null>(null);

  return (
    <AdminWorkspaceContext.Provider
      value={{
        contextTitle,
        setContextTitle,
        contextSubtitle,
        setContextSubtitle,
        titleLink,
        setTitleLink,
      }}
    >
      {children}
    </AdminWorkspaceContext.Provider>
  );
}

export function useAdminWorkspace() {
  const ctx = useContext(AdminWorkspaceContext);
  if (!ctx) throw new Error('useAdminWorkspace must be used within AdminWorkspaceProvider');
  return ctx;
}
