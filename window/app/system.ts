import {OpenApp, AppDefinition} from '../types';
import {
  DEFAULT_WINDOW_WIDTH,
  DEFAULT_WINDOW_HEIGHT,
  TASKBAR_HEIGHT,
} from '../constants';

// This type is duplicated from internal.ts. In a future refactor,
// this could be moved to a shared types file within the window/app module.
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

function getNextPosition(
  deps: WindowManagerDeps,
  appWidth: number,
  appHeight: number
) {
  return deps.getNextPosition(appWidth, appHeight);
}

/**
 * Launches a system application.
 * Currently, the logic is identical to launching an internal app, but it is separated
 * into its own function to allow for future specialization, as requested.
 * @param appDef The definition of the app to launch.
 * @param deps The state and setters from the managing hook.
 * @param initialData Optional data to pass to the new app instance.
 */
export function launchSystemApp(
  appDef: AppDefinition,
  deps: WindowManagerDeps,
  initialData?: any
): void {
  const {
    openApps,
    setOpenApps,
    setActiveAppInstanceId,
    nextZIndex,
    setNextZIndex,
  } = deps;

  if (!appDef.id) {
    console.error('Cannot open system app without an ID.', appDef);
    return;
  }

  // If not passing specific data, check if a non-minimized instance already exists.
  if (!initialData) {
    const existingAppInstance = openApps.find(
      app => app.id === appDef.id && !app.isMinimized
    );
    if (existingAppInstance) {
      // Bring existing window to front
      const newZIndex = nextZIndex + 1;
      setNextZIndex(newZIndex);
      setOpenApps(prev =>
        prev.map(app =>
          app.instanceId === existingAppInstance.instanceId
            ? {...app, zIndex: newZIndex, isMinimized: false}
            : app
        )
      );
      setActiveAppInstanceId(existingAppInstance.instanceId);
      return;
    }

    // Check for a minimized instance
    const minimizedInstance = openApps.find(
      app => app.id === appDef.id && app.isMinimized
    );
    if (minimizedInstance) {
      // Un-minimize it and bring to front
      const newZIndex = nextZIndex + 1;
      setNextZIndex(newZIndex);
      setOpenApps(prev =>
        prev.map(a => {
          if (a.instanceId === minimizedInstance.instanceId) {
            return {...a, isMinimized: false, zIndex: newZIndex};
          }
          return a;
        })
      );
      setActiveAppInstanceId(minimizedInstance.instanceId);
      return;
    }
  }

  // Create a new app instance
  const instanceId = `${appDef.id}-${Date.now()}`;
  const newZIndex = nextZIndex + 1;
  setNextZIndex(newZIndex);

  const defaultWidth = appDef.defaultSize?.width || DEFAULT_WINDOW_WIDTH;
  const defaultHeight = appDef.defaultSize?.height || DEFAULT_WINDOW_HEIGHT;

  const newApp: OpenApp = {
    ...appDef,
    icon: appDef.icon,
    instanceId,
    zIndex: newZIndex,
    position: getNextPosition(deps, defaultWidth, defaultHeight),
    size: {width: defaultWidth, height: defaultHeight},
    isMinimized: false,
    isMaximized: false,
    title: appDef.name,
    initialData: initialData,
  };

  setOpenApps(currentOpenApps => [...currentOpenApps, newApp]);
  setActiveAppInstanceId(instanceId);
}
