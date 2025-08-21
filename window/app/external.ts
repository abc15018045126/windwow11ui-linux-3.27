import {AppDefinition} from '../types';

/**
 * Launches an external application.
 * This can be a separate Electron app or any executable.
 * It first tries to use the Electron IPC 'launchExternalApp' if available (in desktop mode),
 * otherwise it falls back to a local API server call.
 *
 * NOTE: This function does not currently work as intended in the original codebase.
 * It is being moved here as part of a refactoring effort, not a bug fix.
 *
 * @param appDef The definition of the external app to launch.
 */
export function launchExternalApp(appDef: AppDefinition): void {
  if (!appDef.isExternal || !appDef.externalPath) {
    console.error('Invalid app definition for external launch.', appDef);
    return;
  }

  if (window.electronAPI?.launchExternalApp) {
    window.electronAPI.launchExternalApp(appDef.externalPath);
  } else {
    // Fallback for web environment (headless server mode)
    fetch('http://localhost:3001/api/launch', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({path: appDef.externalPath}),
    }).catch(error => {
      console.error('Failed to launch external app via API:', error);
      alert(
        'Failed to launch application. Ensure the backend server is running.'
      );
    });
  }
}
