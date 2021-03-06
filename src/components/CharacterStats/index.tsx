import React from 'react'
import { Paper } from '@material-ui/core'

import { ClassCode } from '@store'
import { CharacterStats as CharacterStatsType } from '@store/Character'

import MainStat from './MainStat'
import StatList from './StatList'

interface Props {
	statData: DeepReadonly<CharacterStatsType>
	type: 'attack' | 'defense'
	classCode: ClassCode
	className?: string
}

const CharacterStats: React.FC<Props> = props => {
	const { className, ...otherProps } = props
	return (
		<Paper className={className}>
			<MainStat {...otherProps} />
			<StatList {...otherProps} />
		</Paper>
	)
}

export default CharacterStats
