import {launchExternalApp} from './external';
import {launchInternalApp} from './internal';
import {launchSystemApp} from './system';
import {AppDefinition} from '../types';

import {OpenApp} from '../types';

// This type defines the state and setters that the app launchers depend on.
type WindowManagerDeps = {
  openApps: OpenApp[];
  setOpenApps: React.Dispatch<React.SetStateAction<OpenApp[]>>;
  activeAppInstanceId: string | null;
  setActiveAppInstanceId: React.Dispatch<React.SetStateAction<string | null>>;
  nextZIndex: number;
  setNextZIndex: React.Dispatch<React.SetStateAction<number>>;
  desktopRef: React.RefObject<HTMLDivElement>;
  getNextPosition: (appWidth: number, appHeight: number) => {x: number; y: number};
};

const SYSTEM_APP_IDS = ['fileExplorer', 'settings', 'appStore'];

/**
 * A centralized function to open any type of application.
 * It determines the app type and delegates to the appropriate launcher.
 * @param appIdentifier The ID or definition of the app to open.
 * @param deps The state and setters from the managing hook.
 * @param appDefinitions The list of all available app definitions.
 * @param initialData Optional data to pass to the new app instance.
 */
export function openApp(
  appIdentifier: string | AppDefinition,
  deps: WindowManagerDeps,
  appDefinitions: AppDefinition[],
  initialData?: any
) {
  let appDef: AppDefinition | undefined;

  if (typeof appIdentifier === 'string') {
    appDef = appDefinitions.find(app => app.id === appIdentifier);
  } else {
    // This handles cases where a partial AppDefinition is passed
    const potentialAppDef = appIdentifier as any;
    if (potentialAppDef.path && !potentialAppDef.externalPath) {
      potentialAppDef.externalPath = potentialAppDef.path;
    }
    appDef = potentialAppDef;
  }

  if (!appDef) {
    const id =
      typeof appIdentifier === 'string'
        ? appIdentifier
        : JSON.stringify(appIdentifier);
    console.error(`App with identifier "${id}" not found or invalid.`);
    return;
  }

  if (appDef.isExternal) {
    launchExternalApp(appDef);
  } else if (SYSTEM_APP_IDS.includes(appDef.id)) {
    launchSystemApp(appDef, deps, initialData);
  } else {
    launchInternalApp(appDef, deps, initialData);
  }
}

// Re-exporting the individual launchers in case they are needed directly.
export {launchExternalApp, launchInternalApp, launchSystemApp};
