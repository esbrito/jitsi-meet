/* @flow */

import { ReducerRegistry, set } from '../../base/redux';

import { SET_ORIENTATION } from './actionTypes';
import { PORTRAIT } from './constants';

/**
 * The initial redux state of the feature network-activity.
 *
 * @type {{
 *     requests: Map
 * }}
 */
const _INITIAL_STATE = {
    /**
     * FIXME
     *
     * @type {Symbol}
     */
    orientation: PORTRAIT
};

ReducerRegistry.register(
    'features/mobile/orientation',
    (state = _INITIAL_STATE, action) => {
        switch (action.type) {
        case SET_ORIENTATION: {
            console.info('REDUCER orientation', action);

            return set(state, 'orientation', action.orientation);
        }
        }

        return state;
    });
