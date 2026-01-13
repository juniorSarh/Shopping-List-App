// Utility for handling browser refresh on button clicks
export const refreshOnAction = () => {
  // Force a hard refresh to clear any stale state
  window.location.reload();
};

// Alternative: Soft refresh (preserves some state)
export const softRefresh = () => {
  window.location.href = window.location.href;
};

// For delete operations - shows confirmation and refreshes
export const refreshAfterDelete = async (deleteAction: () => Promise<void>, message?: string) => {
  if (message && !window.confirm(message)) {
    return;
  }
  
  try {
    // Execute the delete action
    await deleteAction();
    
    // Wait a moment for the state to update, then refresh
    setTimeout(() => {
      refreshOnAction();
    }, 500);
  } catch (error) {
    console.error('Delete action failed:', error);
    alert('Delete action failed. Please try again.');
  }
};

// For general actions that should refresh the page
export const refreshAfterAction = async (action: () => Promise<void>) => {
  try {
    await action();
    // Wait a moment for the state to update, then refresh
    setTimeout(() => {
      refreshOnAction();
    }, 300);
  } catch (error) {
    console.error('Action failed:', error);
    alert('Action failed. Please try again.');
  }
};
