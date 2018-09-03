import {createSelector} from 'reselect'
import {Map, List} from 'immutable'

const generalSelector = state => state.getIn([
    'general'
], Map())

export const uiTextSelector = createSelector(generalSelector, ref => ref.get('uiText', Map()))
export const currentLanguageSelector = createSelector(generalSelector, ref => ref.get('language', 'en'))
export const userSelector = createSelector(generalSelector, ref => ref.get('user', null))

export const jobTextSelector = createSelector(generalSelector, (ref) => {
    let names = ref.getIn(['uiText', 'CLASS_NAMES'], Map())

    let order = ref.getIn(['orders', 'CLASSES'], List())

    return names.map((val, key) => {
        return {
            id: key,
            name: val
        }
    }).sort((a,b) => order.indexOf(a.id) - order.indexOf(b.id))
})

export const loadingSelector = createSelector(generalSelector, ref => ref.get('loading', false))

export const newsSelector = createSelector(generalSelector, ref => ref.get('news', List()))
