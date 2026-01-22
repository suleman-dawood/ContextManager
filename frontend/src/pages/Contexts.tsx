import { useState } from 'react';
import { useContexts } from '../hooks/useContexts';
import { AppHeader } from '../components/AppHeader';
import { Loading } from '../components/Loading';
import { Error } from '../components/Error';
import { ContextList } from '../components/ContextList';
import { ContextForm } from '../components/ContextForm';
import type { Context, CreateContextRequest, UpdateContextRequest } from '../types';
import '../styles/Contexts.css';

export function Contexts() {
    const { contexts, loading, error, createContext, updateContext, deleteContext } = useContexts();

    const [editingContext, setEditingContext] = useState<Context | null>(null);
    const canCreate = contexts.length < 10;
    const canDelete = contexts.length > 3;
  
    async function handleCreateContext(contextData: CreateContextRequest) {
        await createContext(contextData);
    }

    async function handleUpdateContext(contextData: UpdateContextRequest) {
        if (!editingContext) return;
        await updateContext(editingContext.id, contextData);
        setEditingContext(null);
    }

    async function handleDeleteContext(contextId: string) {
        await deleteContext(contextId);
    }

    return (
    <div className="contexts-page page-wrapper">
      <AppHeader />

      <div className="context-container">
        <h1>Manage Your Contexts</h1>
        <h2>Contexts are used to group tasks. You can create, edit, and delete contexts here.</h2>

        {loading && <Loading message="Loading contexts..." />}
        {error && <Error message={error} />}

        <div className="contexts-section">
          <h2>Create Context</h2>
          {!canCreate && <p className="warning-text">Maximum 10 contexts allowed.</p>}

          <ContextForm
            mode="create"
            onSubmit={handleCreateContext}
            disabled={!canCreate}
          />
        </div>

        {editingContext && (
          <div className="contexts-section">
            <h2>Edit Context</h2>
            <ContextForm
              mode="edit"
              initialValues={{
                name: editingContext.name,
                description: editingContext.description,
                color: editingContext.color,
                icon: editingContext.icon
              }}
              onSubmit={handleUpdateContext}
              onCancel={() => setEditingContext(null)}
            />
          </div>
        )}

        <div className="contexts-section">
          <h2>All Contexts</h2>
          {!canDelete && <p className="warning-text">Minimum 3 contexts needed.</p>}

          <ContextList
            contexts={contexts}
            onEdit={setEditingContext}
            onDelete={handleDeleteContext}
            disableDelete={!canDelete}
          />
        </div>


      </div>
    </div>
  );
}