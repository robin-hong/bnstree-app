import React from 'react'
import {translate} from 'react-i18next'
import {Link} from 'react-router-dom'
import {Helmet} from 'react-helmet'

import {Row, Col, Button} from 'antd'

import AdSense from '../AdSense/AdSense'

import './styles/Home.scss'
import discordLogo from './images/discord.png'

import CharacterSearch from '../Character/components/CharacterSearch'
import HomeClassLinks from './components/HomeClassLinks'
import HomeNewsList from './components/HomeNewsList'
import HomeCharacter from './components/HomeCharacter'
import StreamList from '../Streams/components/StreamList'

const Home = props => {
    let {t} = props
    return (
        <div className="home">
            <Helmet>
                <title>BnSTree</title>
            </Helmet>
            <div className="home-top">
                <HomeClassLinks />
                <CharacterSearch center />
                <HomeCharacter />
            </div>
            <div className="home-bottom">
                <HomeNewsList />
                <div className="slim-container container">
                    <AdSense client="ca-pub-2048637692232915" slot="6768736382" format="auto" />
                    <Row>
                        <Col md={16} className="home-stream">
                            <h4>
                                {t('streams')}
                            </h4>
                            <StreamList limit={4} />
                            <Link to="/streams" className="more">
                                {t('moreStreams')}
                            </Link>
                        </Col>
                        <Col md={8} className="side-menu">
                            <a
                                href="https://discord.gg/2ZdtPZM"
                                target="_blank"
                                rel="noopener noreferrer">
                                <Button type="primary" className="side-button discord">
                                    <img alt="discord" src={discordLogo} />
                                    BnSTree Discord
                                </Button>
                            </a>
                            <AdSense
                                client="ca-pub-2048637692232915"
                                slot="9888022383"
                                format="auto"
                            />
                        </Col>
                    </Row>
                    <AdSense client="ca-pub-2048637692232915" slot="2719129989" format="auto" />
                </div>
            </div>
        </div>
    )
}

export default translate('general')(Home)
