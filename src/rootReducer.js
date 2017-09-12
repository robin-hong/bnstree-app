import {combineReducers} from 'redux-immutable'
import {fromJS} from 'immutable'
import * as actionType from './actionTypes'

import news from './components/News/reducer'
import classes from './components/Classes/reducer'
import character from './components/Character/reducer'
import streams from './components/Streams/reducer'
import market from './components/Market/reducer'

function general(
    state = fromJS({
        language: 'en',
        user: null,
        loading: {},
        initialized: false
    }),
    action
) {
    switch (action.type) {
        case actionType.GENERAL_SET_LANGUAGE:
            return state.set('language', fromJS(action.language))
        case actionType.GENERAL_SET_USER:
            return state.set('user', fromJS(action.user))
        case actionType.GENERAL_SET_LOADING:
            return state.setIn(['loading', action.context], action.loading)
        case actionType.GENERAL_SET_INITIALIZED:
            return state.set('initialized', action.initialized)
        default:
            return state
    }
}

export default combineReducers({general, news, classes, market, character, streams})
