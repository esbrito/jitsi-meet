import PropTypes from 'prop-types';
import React, { Component } from 'react';

// eslint-disable-next-line react-native/split-platform-components
import { BackAndroid, BackHandler, View, Dimensions } from 'react-native';
import { connect as reactReduxConnect } from 'react-redux';

import { appNavigate } from '../../app';
import { connect, disconnect } from '../../base/connection';
import { DialogContainer } from '../../base/dialog';
import { Container, LoadingIndicator } from '../../base/react';
import { createDesiredLocalTracks } from '../../base/tracks';
import { Filmstrip } from '../../filmstrip';
import { LargeVideo } from '../../large-video';
import { OverlayContainer } from '../../overlay';
import { setToolboxVisible, Toolbox } from '../../toolbox';

import styles from './styles';
import { calculateNewOrientation } from '../../mobile/orientation';

/**
 * The conference page of the mobile (i.e. React Native) application.
 */
class Conference extends Component {
    /**
     * Conference component's property types.
     *
     * @static
     */
    static propTypes = {
        /**
         * The indicator which determines that we are still connecting to the
         * conference which includes establishing the XMPP connection and then
         * joining the room. If truthy, then an activity/loading indicator will
         * be rendered.
         *
         * @private
         */
        _connecting: PropTypes.bool,

        /**
         * The handler which dispatches the (redux) action connect.
         *
         * @private
         */
        _onConnect: PropTypes.func,

        /**
         * The handler which dispatches the (redux) action disconnect.
         *
         * @private
         */
        _onDisconnect: PropTypes.func,

        /**
         * Handles a hardware button press for back navigation. Leaves the
         * associated {@code Conference}.
         *
         * @private
         * @returns {boolean} As the associated conference is unconditionally
         * left and exiting the app while it renders a {@code Conference} is
         * undesired, {@code true} is always returned.
         */
        _onHardwareBackPress: PropTypes.func,

        _onLayout: PropTypes.func,

        /**
         *
         */
        _orientation: PropTypes.symbol,

        /**
         * The handler which dispatches the (redux) action setToolboxVisible to
         * show/hide the Toolbox.
         *
         * @private
         */
        _setToolboxVisible: PropTypes.func
    };

    /**
     * Initializes a new Conference instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        // Bind event handlers so they are only bound once per instance.
        this._onClick = this._onClick.bind(this);
        this._onLayout = this._onLayout.bind(this);
        this._onHardwareBackPress = this._onHardwareBackPress.bind(this);

        Dimensions.addEventListener('change', event => {
            console.info('Dimensions change', event);
        });
    }

    /**
     * Implements {@link Component#componentDidMount()}. Invoked immediately
     * after this component is mounted.
     *
     * @inheritdoc
     * returns {void}
     */
    componentDidMount() {
        // Set handling any hardware button presses for back navigation up.
        const backHandler = BackHandler || BackAndroid;

        if (backHandler) {
            this._backHandler = backHandler;
            backHandler.addEventListener(
                'hardwareBackPress',
                this._onHardwareBackPress);
        }

        // this._setToolboxTimeout(this.props._toolboxVisible);
    }

    /**
     * Implements {@link Component#componentWillMount()}. Invoked immediately
     * before mounting occurs. Connects the conference described by the redux
     * store/state.
     *
     * @inheritdoc
     * @returns {void}
     */
    componentWillMount() {
        this.props._onConnect();
    }

    /**
     * Implements {@link Component#componentWillUnmount()}. Invoked immediately
     * before this component is unmounted and destroyed. Disconnects the
     * conference described by the redux store/state.
     *
     * @inheritdoc
     * @returns {void}
     */
    componentWillUnmount() {
        // Tear handling any hardware button presses for back navigation down.
        const backHandler = this._backHandler;

        if (backHandler) {
            this._backHandler = undefined;
            backHandler.removeEventListener(
                'hardwareBackPress',
                this._onHardwareBackPress);
        }

        this.props._onDisconnect();
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <Container
                onClick = { this._onClick }
                style = { styles.conference }
                touchFeedback = { false }>

                {/*
                  * The LargeVideo is the lowermost stacking layer.
                  */}
                <LargeVideo />

                {/*
                  * The overlays need to be bellow the Toolbox so that the user
                  * may tap the ToolbarButtons.
                  */}
                <OverlayContainer />

                {/*
                  * The activity/loading indicator goes above everything, except
                  * the toolbox/toolbars and the dialogs.
                  */
                  this.props._connecting
                      && <View style = { styles.connectingIndicator }>
                          <LoadingIndicator />
                      </View>
                }

                <View
                    onLayout = { this.props._onLayout }
                    style = { styles.topContainer } >
                {/*
                  * The Toolbox is in a stacking layer above the Filmstrip.
                  */}
                <Toolbox />
                    {/*
                  * The Filmstrip is in a stacking layer above the LargeVideo.
                  * The LargeVideo and the Filmstrip form what the Web/React app
                  * calls "videospace". Presumably, the name and grouping stem
                  * from the fact that these two React Components depict the
                  * videos of the conference's participants.
                  */}
                <Filmstrip />
                </View>

                {/*
                  * The dialogs are in the topmost stacking layers.
                  */}
                <DialogContainer />
            </Container>
        );
    }

    /**
     * Changes the value of the toolboxVisible state, thus allowing us to switch
     * between Toolbox and Filmstrip and change their visibility.
     *
     * @private
     * @returns {void}
     */
    _onClick() {
        this.props._setToolboxVisible(true);
    }

    /**
     * Handles a hardware button press for back navigation.
     *
     * @returns {boolean} If the hardware button press for back navigation was
     * handled by this {@code Conference}, then {@code true}; otherwise,
     * {@code false}.
     */
    _onHardwareBackPress() {
        return this._backHandler && this.props._onHardwareBackPress();
    }

    /**
     *
     * @param event
     * @private
     */
    _onLayout(event) {
        this.props._onLayout(event);
    }
}

/**
 * Maps dispatching of some action to React component props.
 *
 * @param {Function} dispatch - Redux action dispatcher.
 * @private
 * @returns {{
 *     _onConnect: Function,
 *     _onDisconnect: Function,
 *     _setToolboxVisible: Function
 * }}
 */
function _mapDispatchToProps(dispatch) {
    return {
        /**
         * Dispatches actions to create the desired local tracks and for
         * connecting to the conference.
         *
         * @returns {void}
         * @private
         */
        _onConnect() {
            dispatch(createDesiredLocalTracks());
            dispatch(connect());
        },

        /**
         * Dispatches an action disconnecting from the conference.
         *
         * @returns {void}
         * @private
         */
        _onDisconnect() {
            dispatch(disconnect());
        },

        /**
         * Handles a hardware button press for back navigation. Leaves the
         * associated {@code Conference}.
         *
         * @returns {boolean} As the associated conference is unconditionally
         * left and exiting the app while it renders a {@code Conference} is
         * undesired, {@code true} is always returned.
         */
        _onHardwareBackPress() {
            dispatch(appNavigate(undefined));

            return true;
        },

        /**
         * FIXME.
         * @param event
         * @private
         */
        _onLayout(event) {
            dispatch(calculateNewOrientation(event.nativeEvent.layout));
        },

        /**
         * Dispatches an action changing the visibility of the Toolbox.
         *
         * @param {boolean} visible - True to show the Toolbox or false to hide
         * it.
         * @returns {void}
         * @private
         */
        _setToolboxVisible(visible: boolean) {
            dispatch(setToolboxVisible(visible));
        }
    };
}

/**
 * Maps (parts of) the Redux state to the associated Conference's props.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {{
 *     _connecting: boolean,
 *     _toolboxVisible: boolean,
 *     _orientation: Symbol
 * }}
 */
function _mapStateToProps(state) {
    const { connecting, connection } = state['features/base/connection'];
    const { conference, joining, leaving } = state['features/base/conference'];
    const { orientation } = state['features/mobile/orientation'];

    // XXX There is a window of time between the successful establishment of the
    // XMPP connection and the subsequent commencement of joining the MUC during
    // which the app does not appear to be doing anything according to the redux
    // state. In order to not toggle the _connecting props during the window of
    // time in question, define _connecting as follows:
    // - the XMPP connection is connecting, or
    // - the XMPP connection is connected and the conference is joining, or
    // - the XMPP connection is connected and we have no conference yet, nor we
    //   are leaving one.
    const connecting_
        = connecting || (connection && (joining || (!conference && !leaving)));

    return {
        /**
         * The indicator which determines that we are still connecting to the
         * conference which includes establishing the XMPP connection and then
         * joining the room. If truthy, then an activity/loading indicator will
         * be rendered.
         *
         * @private
         * @type {boolean}
         */
        _connecting: Boolean(connecting_),

        _orientation: orientation
    };
}

export default reactReduxConnect(_mapStateToProps, _mapDispatchToProps)(
    Conference);
