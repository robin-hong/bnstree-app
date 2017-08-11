import {createSelector} from 'reselect'
import {Map, List, fromJS} from 'immutable'

import {currentLanguageSelector} from '../../selectors'
import {characterSelector} from '../Character/selectors'

function merger(a, b) {
    if (a && a.mergeWith && !List.isList(a) && !List.isList(b)) {
        return a.mergeWith(merger, b)
    }
    return b
}

const keyOrder = [
    'LB',
    'RB',
    'Tab',
    'F',
    '1',
    '2',
    '3',
    '4',
    'Z',
    'X',
    'C',
    'V',
    'G',
    'B',
    'Q',
    'E',
    'S',
    'Familiar',
    'Passive',
    'None'
]

const tagOrder = [
    'STUN',
    'DAZE',
    'KNOCKDOWN',
    'KNOCKBACK',
    'UNCONSCIOUS',
    'GRAB',
    'PHANTOM_GRIP',
    'GRAPPLE',
    'FROST_PRISON',
    'AERIAL',
    'PULL',
    'LOCKDOWN',
    'DEEP_FREEZE',
    'ROOT',
    'CHILL',
    'FREEZE',
    'BLEED',
    'DEEP_WOUND',
    'CHARGE_DISABLE',
    'DEFENSE_DISABLE',
    'OFFENSIVE_DEFENSE_DISABLE',
    'JOINT_ATTACK',
    'HEAL',
    'PARTY_BUFF',
    'SOULBURN',
    'TIME_WARP',
    'RESTRAIN',
    'AMPLIFICATION',
    'TIME_DISTORTION',
    'INSPIRATION',
    'REVIVAL',
    'PARTY_PROTECTION',
    'SOULBLADE_PROTECTION',
    'STEALTH_PROTECTION',
    'FREEZE_PROTECTION',
    'CHARGE',
    'DEFENSE',
    'OFFENSIVE_DEFENSE',
    'BLOCK',
    'COUNTER',
    'DEFLECT',
    'DAMAGE_RESIST',
    'STATUS_RESIST',
    'PROJECTILE_RESIST',
    'DEFENSE_PENETRATION',
    'DEFLECT_PENETRATION',
    'DEFENSE_BREAK',
    'THREAT',
    'TAUNT',
    'FAMILIAR',
    'PROJECTILE',
    'MOVEMENT',
    'ESCAPE',
    'WINDWALK'
]

const uiSelector = state => state.getIn(['classes', 'ui'], Map())

const charDataSelector = state => state.getIn(['classes', 'character'], Map())
export const dataSelector = state => state.getIn(['classes', 'data'], Map())
const buildDataSelector = state => state.getIn(['classes', 'build'], Map())
export const refSelector = state => state.getIn(['classes', 'ref'], Map())

const characterBuildDataSelector = state => state.getIn(['character', 'data', 'skillData'], Map())

//ui
export const characterModeSelector = createSelector(uiSelector, state =>
    state.get('characterMode', false)
)
export const charSelector = createSelector(
    charDataSelector,
    characterModeSelector,
    characterSelector,
    (data, characterMode, characterStat) => {
        if (characterMode) {
            let totalStats = characterStat.getIn(['statData', 'total_ability'], Map())
            return fromJS({
                ap: totalStats.get('int_attack_power_value', 13),
                ad: totalStats.get('int_attack_damage_modify_diff', 0),
                c: 30,
                element: {
                    earth: totalStats.get('attack_attribute_earth_rate', 100),
                    flame: totalStats.get('attack_attribute_fire_rate', 100),
                    frost: totalStats.get('attack_attribute_ice_rate', 100),
                    lightning: totalStats.get('attack_attribute_lightning_rate', 100),
                    shadow: totalStats.get('attack_attribute_void_rate', 100),
                    wind: totalStats.get('attack_attribute_wind_rate', 100)
                }
            })
        }
        return data
    }
)

export const classSelector = createSelector(uiSelector, state => state.get('classCode', 'BM'))
export const viewSelector = createSelector(
    uiSelector,
    characterModeSelector,
    (state, characterMode) =>
        characterMode
            ? fromJS({
                  mode: 'LIST',
                  order: 'LEVEL',
                  visibility: 'TRAINABLE'
              })
            : state.get('view', Map())
)
export const filterSelector = createSelector(uiSelector, state => state.get('filter', 'ALL'))
export const searchSelector = createSelector(uiSelector, state => state.get('search', ''))
export const patchSelector = createSelector(uiSelector, state => state.get('patch', 'BASE'))

//data
const classDataSelector = createSelector(dataSelector, classSelector, (state, classCode) =>
    state.get(classCode, Map())
)
export const elementDataSelector = createSelector(classDataSelector, state =>
    state.get('classData', List())
)
export const buildListSelector = createSelector(classDataSelector, state =>
    state.get('buildList', Map())
)
export const userBuildListSelector = createSelector(classDataSelector, state =>
    state.get('userBuildList', Map())
)

//build
export const characterElementSelector = createSelector(
    characterBuildDataSelector,
    elementDataSelector,
    (characterBuild, elementData) => {
        let index = characterBuild.get('elementIndex', 0)
        return elementData.getIn([index, 'element'])
    }
)
export const buildElementSelector = createSelector(
    buildDataSelector,
    classSelector,
    characterModeSelector,
    characterElementSelector,
    (state, classCode, characterMode, characterElement) =>
        characterMode ? characterElement : state.getIn([classCode, 'element'])
)
export const buildSelector = createSelector(
    buildDataSelector,
    classSelector,
    buildElementSelector,
    characterModeSelector,
    characterBuildDataSelector,
    (state, classCode, element, characterMode, characterBuild) =>
        characterMode
            ? characterBuild.get('build', Map())
            : state.getIn([classCode, 'build', element], Map())
)

//ref
export const skillNamesSelector = createSelector(
    refSelector,
    currentLanguageSelector,
    (state, language) => state.getIn(['skillNames', language], Map())
)

//skillData
const groupDataSelector = createSelector(classDataSelector, data => data.get('groupData', Map()))

const patchDataSelector = createSelector(classDataSelector, data => data.get('patchData', Map()))
export const mergedPatchDataSelector = createSelector(
    patchDataSelector,
    patchSelector,
    (data, patchDate) => {
        let result = Map()
        if (patchDate !== 'BASE') {
            data.forEach((patches, id) => {
                patches = patches.filter(skill => {
                    return skill.get('patch') <= patchDate
                })

                let changes = Map()
                patches.forEach(patch => {
                    changes = changes.mergeWith(merger, patch)
                })

                result.set(id, changes)
            })
        }
        return result
    }
)

const skillDataSelector = createSelector(classDataSelector, data => data.get('skillData', Map()))
const namedSkillDataSelector = createSelector(
    skillDataSelector,
    skillNamesSelector,
    (data, names) => {
        return data.map(skill => {
            let id = skill.get('skillId')
            let tags = skill
                .get('tags', List())
                .sort((a, b) => tagOrder.indexOf(a) - tagOrder.indexOf(b))
            return skill
                .set('name', names.getIn([id, 'name'], ''))
                .set('icon', names.getIn([id, 'icon'], ''))
                .set('tags', tags)
        })
    }
)

const patchedSkillDataSelector = createSelector(
    namedSkillDataSelector,
    mergedPatchDataSelector,
    (data, patch) => {
        return data.mergeWith(merger, patch).filter(skill => !skill.get('deleted', false))
    }
)
const elementSkillDataSelector = createSelector(
    patchedSkillDataSelector,
    buildElementSelector,
    (data, element) => {
        return data.filter(skill => skill.get('elementSpec', element) === element)
    }
)

const statSkillDataSelector = createSelector(
    elementSkillDataSelector,
    classDataSelector,
    buildElementSelector,
    (data, classData, element) => {
        let buildFormat = classData
            .get('classData', List())
            .find(e => e.get('element') === element, null, Map())
            .get('buildFormat', Map())
        let statData = classData.getIn(['statData', element], Map())
        let count = classData.getIn(['buildCount', element, 'count'], 0)
        let types = ['PvE', 'PvP', '6v6']
        return data.map(skill => {
            let id = skill.get('groupId')
            if (buildFormat.includes(id)) {
                types.forEach(t => {
                    skill = skill.setIn(
                        ['buildStat', t],
                        statData
                            .getIn(['types', t, id], Map())
                            .find(s => s.get('move', 1) === skill.get('move'), null, Map())
                            .get('count', 0)
                    )
                })
                skill = skill.setIn(['buildStat', 'total'], count)
            }

            return skill
        })
    }
)

const groupedSkillDataSelector = createSelector(statSkillDataSelector, data => {
    data = data.sort((a, b) => {
        if (a.get('move', '') < b.get('move', '')) {
            return -1
        } else {
            return 1
        }
    })
    data = data.groupBy(skill => skill.get('groupId'))
    return data
})

const filteredSkillDataSelector = createSelector(
    groupedSkillDataSelector,
    groupDataSelector,
    filterSelector,
    searchSelector,
    buildElementSelector,
    buildSelector,
    (data, groupData, filter, search, element, build) => {
        data = data.filter(group => {
            let filterOK = filter === 'ALL'
            let searchOK = false

            group.forEach(skill => {
                let filterList = skill.get('filter', List())
                if (Map.isMap(filterList)) {
                    filterList = filterList.get(element, List())
                }

                filterOK = filterOK || filterList.includes(filter)
                searchOK =
                    searchOK ||
                    skill.get('name', '').toLowerCase().startsWith(search.trim().toLowerCase())
            })

            return filterOK && searchOK
        })
        groupData = groupData.map((group, id) => {
            return group
                .set('moves', data.get(id, Map()).toList())
                .set('currentMove', build.get(id, 1))
        })
        return groupData
    }
)

export const catagorizedSkillDataSelector = createSelector(
    filteredSkillDataSelector,
    viewSelector,
    (data, view) => {
        data = data.filter(group => group.get('moves', List()).size > 0)

        if (view.get('visibility', 'ALL') !== 'ALL') {
            data = data.filter(group => group.get('moves', List()).size > 1)
        }

        if (view.get('mode', 'LIST') === 'ICON' || view.get('order', 'LEVEL') === 'HOTKEY') {
            data = data
                .groupBy(group => group.get('hotkey'))
                .sortBy((value, key) => key, (a, b) => keyOrder.indexOf(a) - keyOrder.indexOf(b))
        } else {
            data = data
                .groupBy(group => group.get('minLevel'))
                .sortBy((value, key) => key, (a, b) => a - b)
        }

        return data.map(group =>
            group.sortBy((value, key) => key, (a, b) => a.substring(0, 5) - b.substring(0, 5))
        )
    }
)