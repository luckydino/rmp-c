import { AppState } from '../redux/app/app-slice';

export interface RMPSave {
    version: number;
    graph: string;
    svgViewBoxZoom: number;
    svgViewBoxMin: { x: number; y: number };
}

export const CURRENT_VERSION = 1;

/**
 * Contains all version upgrade functions.
 * Starting from 0, it should be possible to upgrade the save to CURRENT_VERSION.
 */
const upgrades: { [version: number]: (param: string) => string } = {
    0: param =>
        JSON.stringify({
            version: 1,
            graph: JSON.parse(param)?.graph,
            svgViewBoxZoom: 100,
            svgViewBoxMin: { x: 0, y: 0 },
        }),
};

const INITIAL_PARAM = JSON.stringify({
    graph: '{}',
    svgViewBoxZoom: 100,
    svgViewBoxMin: { x: -100, y: -100 },
    version: CURRENT_VERSION,
} as RMPSave);

/**
 * Upgrade the passed param to the latest format.
 */
export const upgrade: (originalParam: string | null) => string = originalParam => {
    if (!originalParam) return INITIAL_PARAM;

    const originalSave = JSON.parse(originalParam);
    if (!('version' in originalSave) || !Number.isInteger(originalSave.version)) return INITIAL_PARAM;

    let version = Number(originalSave.version);
    let save = JSON.stringify(originalSave);
    while (version in upgrades) {
        save = upgrades[version](save);
        version = Number(JSON.parse(save).version);
    }

    // version should be CURRENT_VERSION now
    return save;
};

/**
 * Return a valid save string from AppState.
 */
export const stringifyParam = (appState: AppState) => {
    const save: RMPSave = { ...appState, version: CURRENT_VERSION };
    return JSON.stringify(save);
};
