
import { setOrientation } from './actions';
import { LANDSCAPE, PORTRAIT } from './constants';

export function calculateNewOrientation(event: { width: Number, height: Number }):StoreAction {
    const { width, height } = event;
    const orientation = width > height ? LANDSCAPE : PORTRAIT;

    console.info('SET ORIENTATION', width, height, orientation);

    return setOrientation(orientation);
}

export function createOnLayoutListener(dispatch: Function) {
    return event => {
        const newAction = calculateNewOrientation(event.nativeEvent.layout);

        dispatch(newAction);
    };
}
