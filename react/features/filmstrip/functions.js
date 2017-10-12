/* @flow */

declare var interfaceConfig: Object;

import {
    getPinnedParticipant
} from '../base/participants';

/**
 * A selector for determining whether or not remote video thumbnails should be
 * displayed in the filmstrip.
 *
 * @param {Object} state - The full redux state.
 * @returns {boolean} - True if remote video thumbnails should be displayed.
 */
export function shouldRemoteVideosBeVisible(state: Object) {
    const participants = state['features/base/participants'];
    const participantsCount = participants.length;
    const pinnedParticipant = getPinnedParticipant(state);

    const shouldShowVideos
        = participantsCount > 2

        // Always show the filmstrip when there is another participant to show
        // and the filmstrip is hovered, or local video is pinned, or the
        // toolbar is displayed.
        || (participantsCount > 1
            && (state['features/filmstrip'].hovered
                || state['features/toolbox'].visible
                || (pinnedParticipant && pinnedParticipant.local)))

        || interfaceConfig.filmStripOnly

        || state['features/base/config'].disable1On1Mode;

    return Boolean(shouldShowVideos);
}
