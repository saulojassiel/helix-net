"use client";

import { ReactNode } from "react";

interface WorkspaceLayoutProps {
  header: ReactNode;
  explorer: ReactNode;
  graph: ReactNode;
  inspector: ReactNode;
}

export default function WorkspaceLayout({
  header,
  explorer,
  graph,
  inspector,
}: WorkspaceLayoutProps) {
  return (
    <main className="min-h-screen bg-black p-8 text-white">
      {header}

      <div className="mt-8 grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)_340px]">
        <aside className="space-y-6">
          {explorer}
        </aside>

        {graph}

        {inspector}
      </div>
    </main>
  );
}