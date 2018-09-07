import * as React from 'react'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import { NavLink } from 'react-router-dom'
import {
	Button,
	IconButton,
	Input,
	Hidden,
	Paper,
	FormGroup,
	FormControlLabel,
	Checkbox,
	Popover,
	MenuItem,
	Menu
} from '@material-ui/core'
import { Tune, Share, FilterList, Clear } from '@material-ui/icons'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import T from '@src/components/T'
import ImageLoader from '@src/components/ImageLoader'
import compose from '@src/utils/compose'
import { classes } from '@src/components/Navigation/links'

import { RootState } from '@src/store/rootReducer'
import { SkillElement, ClassCode } from '@src/store/constants'
import { getSkillPreferences } from '@src/store/Skills/selectors'
import UserActions from '@src/store/User/actions'

import * as style from './styles/index.css'
import classIcons from '@src/images/classIcons'
import elementIcons from './images/elementIcons'
import SettingsDialog from './SettingsDialog'

interface PropsFromStore {
	skillPreferences: ReturnType<typeof getSkillPreferences>
}

interface PropsFromDispatch {
	updatePreferences: typeof UserActions.updatePreferences
	updatePreferencesNoSave: typeof UserActions.updatePreferencesNoSave
}

interface SelfProps {
	classCode: ClassCode
	element: SkillElement
	readonly?: boolean
}

interface Props extends SelfProps, InjectedIntlProps, PropsFromStore, PropsFromDispatch {}

interface State {
	settingsDialogOpen: boolean
	classAnchor: HTMLElement | undefined
	filterAnchor: HTMLElement | undefined
}

class SkillActionBar extends React.PureComponent<Props, State> {
	constructor(props: Props) {
		super(props)
		this.state = {
			settingsDialogOpen: false,
			classAnchor: undefined,
			filterAnchor: undefined
		}
	}

	toggleElement = () => {
		const { updatePreferences, classCode, element, skillPreferences } = this.props

		const classElements = Object.keys(skillPreferences.build[classCode])
		const newElement = classElements[0] === element ? classElements[1] : classElements[0]

		updatePreferences({
			skills: {
				element: {
					[classCode]: newElement
				}
			}
		})
	}

	search = (value: string) => {
		const { updatePreferencesNoSave } = this.props

		updatePreferencesNoSave({
			skills: {
				search: value
			}
		})
	}

	render() {
		const { classCode, element, intl, skillPreferences, updatePreferences } = this.props
		const { settingsDialogOpen, classAnchor, filterAnchor } = this.state

		return (
			<div className={style.skillActionBar}>
				<div className={style.leftGroup}>
					<Button
						className={style.className}
						onClick={event => this.setState({ classAnchor: event.currentTarget })}>
						<ImageLoader src={classIcons[classCode]} />
						<Hidden smDown>
							<T id={['general', 'class_names', classCode]} />
						</Hidden>
					</Button>
					<Menu
						anchorEl={classAnchor}
						open={Boolean(classAnchor)}
						onClose={() => this.setState({ classAnchor: undefined })}>
						{classes.filter(c => c.classCode !== classCode).map(c => (
							<MenuItem
								key={c.classCode}
								onClick={() => this.setState({ classAnchor: undefined })}
								className={style.menuClassName}
								component={(props: any) => <NavLink to={c.link} {...props} />}>
								<ImageLoader src={classIcons[c.classCode as ClassCode]} />
								<T id={['general', 'class_names', c.classCode]} />
							</MenuItem>
						))}
					</Menu>
					<Button className={style.elementToggle} onClick={this.toggleElement}>
						<ImageLoader src={elementIcons[element]} />
						<T id={['general', 'element_types', element]} />
					</Button>
				</div>
				<div className={style.searchContainer}>
					<Input
						disableUnderline
						placeholder={intl.formatMessage({ id: 'skill.search_placeholder' })}
						className={style.search}
						value={skillPreferences.search}
						onChange={event => this.search(event.currentTarget.value)}
						endAdornment={
							<>
								{skillPreferences.search.trim() !== '' && (
									<IconButton className={style.clear} onClick={() => this.search('')}>
										<Clear />
									</IconButton>
								)}
								<IconButton
									className={style.filter}
									onClick={event => this.setState({ filterAnchor: event.currentTarget })}>
									<FilterList />
								</IconButton>
							</>
						}
					/>
				</div>
				<div className={style.rightGroup}>
					<IconButton
						className={style.button}
						color="inherit"
						onClick={() => this.setState({ settingsDialogOpen: true })}>
						<Tune />
					</IconButton>
					<IconButton className={style.button} color="primary" disabled>
						<Share />
					</IconButton>
				</div>
				<Popover
					anchorEl={filterAnchor}
					open={Boolean(filterAnchor)}
					anchorOrigin={{
						vertical: 'bottom',
						horizontal: 'center'
					}}
					transformOrigin={{
						vertical: 'top',
						horizontal: 'center'
					}}
					onClose={() => this.setState({ filterAnchor: undefined })}>
					<Paper>
						<FormGroup>
							<FormControlLabel
								className={style.label}
								control={
									<Checkbox
										checked={skillPreferences.visibility === 'TRAINABLE'}
										color="primary"
										onClick={() =>
											updatePreferences({
												skills: {
													visibility:
														skillPreferences.visibility === 'TRAINABLE'
															? 'ALL'
															: 'TRAINABLE'
												}
											})
										}
										value="checkedA"
									/>
								}
								label={<T id="skill.menu.show_trainable" />}
							/>
						</FormGroup>
					</Paper>
				</Popover>
				<SettingsDialog open={settingsDialogOpen} close={() => this.setState({ settingsDialogOpen: false })} />
			</div>
		)
	}
}

const mapStateToProps = (state: RootState) => {
	return {
		skillPreferences: getSkillPreferences(state)
	}
}

const mapDispatchToProps = (dispatch: Dispatch) =>
	bindActionCreators(
		{
			updatePreferences: UserActions.updatePreferences,
			updatePreferencesNoSave: UserActions.updatePreferencesNoSave
		},
		dispatch
	)

export default compose<Props, SelfProps>(
	injectIntl,
	connect(
		mapStateToProps,
		mapDispatchToProps
	)
)(SkillActionBar)
