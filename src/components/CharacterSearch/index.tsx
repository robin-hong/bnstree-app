import * as React from 'react'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { Paper, MenuItem } from '@material-ui/core'
import * as Autosuggest from 'react-autosuggest'
import gql from 'graphql-tag'
import classNames from 'classnames'
import { debounce, get } from 'lodash-es'
import apollo from '@src/apollo'
import compose from '@src/utils/compose'

import { RootState } from '@src/store/rootReducer'
import { CharacterRegion } from '@src/store/constants'
import { getCharacterPreferences } from '@src/store/Character/selectors'
import UserActions from '@src/store/User/actions'

import style from './styles/index.css'
import SearchInput from './SearchInput'

interface PropsFromStore {
	region: ReturnType<typeof getCharacterPreferences>['region']
}

interface PropsFromDispatch {
	updatePreferences: typeof UserActions.updatePreferences
}

interface SelfProps {
	className?: string
	onSubmit: () => void
}

interface Props extends SelfProps, PropsFromStore, PropsFromDispatch, RouteComponentProps<{}> {}

interface State {
	name: string
	suggestions: string[]
}

class CharacterSearch extends React.PureComponent<Props, State> {
	state: State = {
		name: '',
		suggestions: []
	}

	fetchSuggestions = (options: Autosuggest.SuggestionsFetchRequestedParams) => {
		const { value } = options
		const { region } = this.props
		apollo
			.query({
				query: gql`
					query searchSuggestions($name: String!, $region: CharacterRegion!) {
						character {
							search(name: $name, region: $region) {
								suggestions
							}
						}
					}
				`,
				variables: {
					name: value,
					region
				},
				errorPolicy: 'ignore'
			})
			.then(response => {
				this.setState({
					suggestions: get(response, 'data.character.search.suggestions', [])
				})
			})
	}
	debouncedFetchSuggestions = debounce(this.fetchSuggestions, 200)

	selectRegion = (region: string) => {
		const { updatePreferences } = this.props
		updatePreferences({ character: { region: (region as CharacterRegion) || 'NA' } })
	}

	submit = (event?: React.FormEvent<HTMLFormElement>) => {
		if (event) {
			event.preventDefault()
		}
		const { region, history, onSubmit } = this.props
		const { name } = this.state

		onSubmit()
		if (name.trim() !== '') {
			history.push(`/character/${this.validateRegion(region).toLowerCase()}/${name}`)
		}
		this.setState({ name: '' })
	}

	renderInput = (inputProps: any) => {
		const { region } = this.props
		const { ref, ...other } = inputProps

		return (
			<form onSubmit={this.submit}>
				<SearchInput ref={ref} inputProps={other} currentRegion={region} onChange={this.selectRegion} />
			</form>
		)
	}

	renderSuggestionContainer = (options: any) => {
		const { containerProps, children } = options

		return (
			<Paper square {...containerProps}>
				{children}
			</Paper>
		)
	}

	renderSuggestion = (suggestion: string, options: any) => {
		const { isHighlighted } = options

		return (
			<MenuItem selected={isHighlighted} className={style.suggestionMenuItem} component="div">
				{suggestion}
			</MenuItem>
		)
	}

	validateRegion = (region: string) => {
		const validRegions = ['NA', 'EU', 'KR', 'TW']
		return validRegions.includes(region) ? region : 'NA'
	}

	render = () => {
		const { className } = this.props
		const { suggestions, name } = this.state

		return (
			<div className={classNames(style.characterSearch, className)}>
				<Autosuggest
					suggestions={suggestions}
					onSuggestionsFetchRequested={this.debouncedFetchSuggestions}
					onSuggestionsClearRequested={() => this.setState({ suggestions: [] })}
					getSuggestionValue={suggestion => suggestion}
					inputProps={{
						value: name,
						onChange: event => this.setState({ name: event.currentTarget.value })
					}}
					onSuggestionSelected={async (_event, { suggestion }) => {
						await this.setState({ name: suggestion })
						this.submit()
					}}
					renderInputComponent={this.renderInput}
					renderSuggestionsContainer={this.renderSuggestionContainer}
					renderSuggestion={this.renderSuggestion}
					theme={{
						container: style.autoselectContainer,
						suggestionsContainer: style.suggestionsContainer,
						suggestionsList: style.suggestionsList
					}}
				/>
			</div>
		)
	}
}

const mapStateToProps = (state: RootState) => {
	return {
		region: getCharacterPreferences(state).region || 'NA'
	}
}

const mapDispatchToProps = (dispatch: Dispatch) =>
	bindActionCreators(
		{
			updatePreferences: UserActions.updatePreferences
		},
		dispatch
	)

export default compose<Props, SelfProps>(
	withRouter,
	connect(
		mapStateToProps,
		mapDispatchToProps
	)
)(CharacterSearch)
