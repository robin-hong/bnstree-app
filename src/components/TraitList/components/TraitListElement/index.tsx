import * as React from 'react'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import { Paper, withWidth } from '@material-ui/core'
import { PaperProps } from '@material-ui/core/Paper'
import { WithWidth, isWidthDown } from '@material-ui/core/withWidth'
import compose from '@src/utils/compose'
import { STATIC_SERVER } from '@src/utils/constants'

import ImageLoader from '@components/ImageLoader'
import Virtualizer from '@components/Virtualizer'
import SkillName from '@components/SkillName'
import TraitTooltip from '@components/TraitTooltip'

import { RootState } from '@store'
import { Trait } from '@store/Skills'
import { selectors as skillSelectors } from '@store/Skills'
import { actions as userActions } from '@store/User'

import { TraitListElementContainer } from './style'

interface PropsFromStore {
	classCode: ReturnType<typeof skillSelectors.getCurrentClass>
	specialization: ReturnType<typeof skillSelectors.getSpecialization>
	build: ReturnType<typeof skillSelectors.getBuild>
}

interface PropsFromDispatch {
	updatePreferences: typeof userActions.updatePreferences
}

interface SelfProps {
	trait: DeepReadonly<Trait>
}

interface Props extends SelfProps, PropsFromStore, PropsFromDispatch, WithWidth {}

class TraitListElement extends React.PureComponent<Props> {
	renderContainer = (props: PaperProps) => {
		const { trait, build } = this.props
		const currentIndex = build[trait.index[0] - 1] || 1
		const active = currentIndex === trait.index[1]

		return <TraitListElementContainer active={active} {...props} />
	}

	render = () => {
		const { trait, classCode, specialization, build, width, updatePreferences } = this.props

		return (
			<Virtualizer minHeight="7rem">
				<Paper
					component={this.renderContainer}
					onClick={() =>
						updatePreferences({
							skills: {
								builds: {
									[classCode]: {
										[specialization]: new Array(5)
											.fill(1)
											.map((_n, i) => (i === trait.index[0] - 1 ? trait.index[1] : build[i] || 1))
									}
								}
							}
						})
					}>
					<TraitTooltip
						trait={trait}
						specialization={specialization}
						target={<ImageLoader src={`${STATIC_SERVER}/images/skills/${trait.data.icon}`} />}
					/>
					<SkillName name={trait.data.name} variant={isWidthDown('xs', width) ? 'caption' : 'subtitle1'} />
				</Paper>
			</Virtualizer>
		)
	}
}

const mapStateToProps = (state: RootState) => {
	return {
		classCode: skillSelectors.getCurrentClass(state),
		specialization: skillSelectors.getSpecialization(state),
		build: skillSelectors.getBuild(state)
	}
}

const mapDispatchToProps = (dispatch: Dispatch) =>
	bindActionCreators(
		{
			updatePreferences: userActions.updatePreferences
		},
		dispatch
	)

export default compose<Props, SelfProps>(
	withWidth(),
	connect(
		mapStateToProps,
		mapDispatchToProps
	)
)(React.memo(TraitListElement))
