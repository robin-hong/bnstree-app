import styled from '@style/styled-components'

import FadeContainer from '@components/FadeContainer'

export const BackgroundContainer = styled.div`
	position: fixed;
	background: #111;
	top: -1rem;
	left: 0;
	right: 0;
	bottom: 0;
	height: calc(100vh + 10rem);
	z-index: -1;
	opacity: 0.9;
`

export const ImageFadeContainer = styled(FadeContainer)`
	position: absolute;
	top: 0;
	bottom: 0;
	left: 0;
	right: 0;

	& img {
		position: absolute;
		left: 50%;
		transform: translate(-50%, 0);
		min-width: 100%;
		min-height: 100%;
		filter: brightness(0.5);
	}
`

export const Backdrop = styled.div`
	position: absolute;
	bottom: 0;
	width: 100%;
	height: 50%;
	background: linear-gradient(to top, rgb(10, 10, 10) 0%, rgba(0, 0, 0, 0) 100%);
`
