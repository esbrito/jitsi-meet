import { SET_ORIENTATION } from './actionTypes';

export function setOrientation(orientation: Symbol) {
    return {
        type: SET_ORIENTATION,
        orientation
    };
}
