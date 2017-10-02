import React from 'react'
import {connect} from 'react-redux'
import {translate} from 'react-i18next'
import {Map, List} from 'immutable'
import parser from '../parser'

import pieceImages from '../images/map_pieceImg'
import {skillNamesSelector} from '../selectors'

import {Collapse} from 'antd'
const Panel = Collapse.Panel

const trigram = ['☵', '☶', '☳', '☴', '☲', '☷', '☱', '☰']

const statOrder = [
    'attack_critical_value',
    'attack_critical_damage_value',
    'attack_hit_value',
    'max_hp',
    'defend_power_value',
    'defend_dodge_value',
    'defend_parry_value',
    'defend_critical_value'
]

const mapStateToProps = state => {
    return {
        skillNames: skillNamesSelector(state)
    }
}

class SoulshieldListItem extends React.PureComponent {
    render() {
        const {t, set, skillNames} = this.props

        let effects = []
        set.get('effects', List()).forEach((set, i) => {
            let label = 3 * (i + 1) - (i !== 0 ? 1 : 0)
            let attributes = []
            set.forEach((attribute, j) => {
                let text = ''
                if (attribute.get(0) === 'stats') {
                    text = attribute
                        .get(1)
                        .map(
                            stat =>
                                `${t(stat.get(0))} ${stat.get(1)}${stat.get(0) ===
                                'attack_critical_damage_value'
                                    ? '%'
                                    : ''}`
                        )
                        .join(', ')
                } else {
                    text = parser(attribute, null, null, skillNames)
                }

                attributes.push(
                    <p className="attribute" key={j}>
                        {text}
                    </p>
                )
            })

            effects.push(
                <div className="set-effect" key={label}>
                    <div className="set-label">{label}</div>
                    <div>{attributes}</div>
                </div>
            )
        })

        let legacy = set.get('group') === 'legacy'

        let pieces = []
        set.get('stats', List()).forEach((piece, i) => {
            let m1Values = piece.get('m1', List()).sort()
            let m2Values = piece.getIn(['m2', 'values'], List()).sort()

            if (piece.getIn(['m2', 'stat']) === 'max_hp') {
                m1Values = m1Values.map((value, i) => value + m2Values.get(i, 0) * 10)
            }
            let m1 = `${t('max_hp')} ${m1Values.sort().join(legacy ? ', ' : ' ~ ')}`

            let m2 =
                piece.has('m2') && piece.getIn(['m2', 'stat']) !== 'max_hp'
                    ? `${t(piece.getIn(['m2', 'stat']))}
                       ${m2Values.join(legacy ? ', ' : ' ~ ')}`
                    : null

            let sub = []
            let subDiv = null
            let subStats = piece.get('sub', Map())
            subStats
                .get('stats', List())
                .sort((a, b) => statOrder.indexOf(a) - statOrder.indexOf(b))
                .forEach(stat => {
                    let mod = stat === 'max_hp' ? 10 : 1

                    let values = subStats
                        .get(
                            stat === 'max_hp' && subStats.has('healthValues')
                                ? 'healthValues'
                                : 'values',
                            Map()
                        )
                        .sort()
                        .map(value => value * mod)

                    sub.push(
                        <tr key={stat}>
                            <td className="stat-label">{t(stat)}</td>
                            <td>
                                {values.join(legacy ? ', ' : ' ~ ')}
                                <span className={`tag rng`}>%</span>
                            </td>
                        </tr>
                    )
                })
            if (sub.length > 0) {
                subDiv = (
                    <div className="sub">
                        <p>{t('skills:randomSub', {count: subStats.get('limit', 1)})}</p>
                        <table>
                            <tbody>{sub}</tbody>
                        </table>
                    </div>
                )
            }

            pieces.push(
                <div className="soulshield-piece" key={i}>
                    <div className="soulshield-piece-name">
                        <img alt={i + 1} src={pieceImages[`p${i + 1}`]} />
                        <p className={`grade_${set.get('grade')}`}>
                            {set.get('name')} {trigram[i]}
                            {i + 1}
                        </p>
                    </div>
                    <div className="soulshield-piece-stat">
                        <div className="main">
                            <div className="m1">{m1}</div>
                            <div className="m2">{m2}</div>
                        </div>
                        {subDiv}
                        <div className="maxFuse">
                            {t('skills:maxFuse')}: {piece.get('maxFuse')}
                        </div>
                    </div>
                </div>
            )
        })

        for (let i = 0; i < 4; i++) {
            pieces.push(<div className="soulshield-piece hidden" key={`hidden_${i}`} />)
        }

        return (
            <div className="item-list-item soulshield-item">
                <Collapse bordered={false}>
                    <Panel
                        header={
                            <div className="item-header">
                                <div className="item-icon">
                                    <img
                                        alt={set.get('name')}
                                        src={`https://static.bnstree.com/images/soulshields/sets/${set.get(
                                            'icon',
                                            'blank'
                                        )}`}
                                    />
                                </div>
                                <div className="item-details">
                                    <h3 className={`grade_${set.get('grade')}`}>
                                        {set.get('name')}
                                    </h3>
                                    <div className="set-name">
                                        {set.has('group') ? t(`skills:${set.get('group')}`) : ''}
                                    </div>
                                </div>
                            </div>
                        }>
                        <div className="set-effects">
                            <h5 className="set-effect-name">{set.get('setEffect')}</h5>
                            {effects}
                        </div>
                        <Collapse bordered={false}>
                            <Panel
                                className="soulshield-pieces"
                                header={<div className="item-header">{t('skills:stats')}</div>}>
                                <div className="soulshield-piece-list">{pieces}</div>
                            </Panel>
                        </Collapse>
                    </Panel>
                </Collapse>
            </div>
        )
    }
}

export default connect(mapStateToProps)(translate(['character', 'classes'])(SoulshieldListItem))
