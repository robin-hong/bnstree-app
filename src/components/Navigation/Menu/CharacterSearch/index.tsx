import React, { useState } from 'react'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { Paper, MenuItem } from '@material-ui/core'
import Autosuggest from 'react-autosuggest'
import gql from 'graphql-tag'
import { debounce, get } from 'lodash-es'
import { useCallback } from '@utils/hooks'
import apollo from '@utils/apollo'
import compose from '@utils/compose'
import { getValidRegion } from '@utils/helpers'

import { RootState, CharacterRegion } from '@store'
import { selectors as characterSelectors } from '@store/Character'
import { actions as userActions } from '@store/User'

import { CharacterSearchContainer, SuggestionMenuItem } from './style'
import SearchInput from './SearchInput'

interface PropsFromStore {
	region: ReturnType<typeof characterSelectors.getCharacterPreferences>['region']
}

interface PropsFromDispatch {
	updatePreferences: typeof userActions.updatePreferences
}

interface SelfProps {
	className?: string
	onSubmit: () => void
}

interface Props extends SelfProps, PropsFromStore, PropsFromDispatch, RouteComponentProps<{}> {}

const CharacterSearch: React.FC<Props> = props => {
	const [name, setName] = useState('')
	const [suggestions, setSuggestions] = useState([])

	const fetchSuggestions = useCallback(
		debounce((options: Autosuggest.SuggestionsFetchRequestedParams) => {
			const { value } = options
			const { region } = props
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
					setSuggestions(get(response, 'data.character.search.suggestions', []))
				})
		}, 200)
	)

	const selectRegion = useCallback((region: string) => {
		const { updatePreferences } = props
		updatePreferences({ character: { region: (region as CharacterRegion) || 'NA' } })
	})

	const submit = useCallback((search: string) => {
		const { region, history, onSubmit } = props
		onSubmit()
		if (search.trim() !== '') {
			const searchRegion = getValidRegion(region)
			history.push(`/character/${searchRegion.toLowerCase()}/${search}`)
			setName('')
		}
	})

	const { className } = props

	return (
		<CharacterSearchContainer className={className}>
			<Autosuggest
				suggestions={suggestions}
				onSuggestionsFetchRequested={fetchSuggestions}
				onSuggestionsClearRequested={useCallback(() => setSuggestions([]))}
				getSuggestionValue={useCallback(suggestion => suggestion)}
				inputProps={{
					value: name,
					onChange: useCallback(event => setName(event.currentTarget.value))
				}}
				onSuggestionSelected={useCallback((_event, { suggestion }) => submit(suggestion))}
				renderInputComponent={useCallback((inputProps: any) => {
					const { region } = props
					const { ref, ...other } = inputProps
					return (
						<SearchInput
							ref={ref}
							inputProps={other}
							currentRegion={region}
							onRegionChange={selectRegion}
							onSubmit={submit}
						/>
					)
				})}
				renderSuggestionsContainer={useCallback((options: any) => {
					const { containerProps, children } = options
					return (
						<Paper square {...containerProps}>
							{children}
						</Paper>
					)
				})}
				renderSuggestion={useCallback((suggestion: string, options: any) => {
					const { isHighlighted } = options
					return (
						<MenuItem selected={isHighlighted} component={SuggestionMenuItem}>
							{suggestion}
						</MenuItem>
					)
				})}
				theme={{
					container: 'autosuggest-container',
					suggestionsContainer: 'suggestions-container',
					suggestionsList: 'suggestions-list'
				}}
			/>
		</CharacterSearchContainer>
	)
}

const mapStateToProps = (state: RootState) => {
	return {
		region: characterSelectors.getCharacterPreferences(state).region || 'NA'
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
	withRouter,
	connect(
		mapStateToProps,
		mapDispatchToProps
	)
)(CharacterSearch)