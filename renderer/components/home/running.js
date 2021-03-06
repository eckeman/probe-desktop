/* global require */
import React from 'react'

import styled from 'styled-components'

import {
  Flex,
  Box,
  Heading,
  Text,
  Container,
  Button,
  theme
} from 'ooni-components'

import { MdClear } from 'react-icons/md'
import { Line as LineProgress } from 'rc-progress'
import { FormattedMessage } from 'react-intl'

import { testGroups } from '../nettests'

import { MdKeyboardArrowUp, MdKeyboardArrowDown} from 'react-icons/md'

import Lottie from 'react-lottie'

import moment from 'moment'

const debug = require('debug')('ooniprobe-desktop.renderer.components.home.running')

const StyledRunningTest = styled.div`
  text-align: center;
  color: white;
`

const CodeLogContainer = styled.div`
  margin: 0 auto;
  width: 100%;
  height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
  overflow-wrap: break-word;
  background-color: black;
`

const Lines = styled(Text)`
  padding-top: 20px;
  padding-left: 20px;
  color: white;
  font-family: monospace;
  white-space: pre;
  text-align: left;
`

const ToggleButtonContainer = styled(Flex)`
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.white};
  cursor: pointer;
  &:hover {
    color: ${props => props.theme.colors.gray4};
  }
`


const ToggleLogButton = ({open, onClick}) => {
  if (open) {
    return <ToggleButtonContainer onClick={onClick}>
      <Box>
        <FormattedMessage id='Dashboard.Running.CloseLog' />
      </Box>
      <Box>
        <MdKeyboardArrowDown size={30} />
      </Box>
    </ToggleButtonContainer>
  }
  return <ToggleButtonContainer onClick={onClick}>
    <Box>
      <FormattedMessage id='Dashboard.Running.ShowLog' />
    </Box>
    <Box>
      <MdKeyboardArrowUp size={30} />
    </Box>
  </ToggleButtonContainer>
}

const CodeLog = ({lines}) => {
  return (
    <CodeLogContainer>
      <Lines>{lines.join('\n')}</Lines>
    </CodeLogContainer>
  )
}

const LogContainer = styled.div`
position: absolute;
bottom: 0;
left: 0;
width: 100%;
`

const Log = ({lines, onToggleLog, open}) => {
  return <LogContainer>
    <ToggleLogButton onClick={onToggleLog} open={open} />
    {open && <CodeLog lines={lines} />}
  </LogContainer>
}

const CloseButtonContainer = styled.div`
  color: white;
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 99999;
  cursor: pointer;
`

//name, icon, color, description, longDescription, onClickClose, active
const RunningTest = ({testGroup, logOpen, onToggleLog, progressLine, percent, logLines, runningTestName, error, eta, onKill}) => {
  const lottieOptions = {
    loop: true,
    autoplay: true,
    animationData: testGroup['animation'] || null,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  }
  let TestName = <span />
  if (runningTestName) {
    TestName = <FormattedMessage id={`Test.${runningTestName.split('.')[1]}.Fullname`} />
  }

  return <StyledRunningTest>
    <Container>
      <CloseButtonContainer>
        <MdClear onClick={onKill} size={30} />
      </CloseButtonContainer>
      <Heading h={2}>{testGroup.name}</Heading>
      <Heading h={3}>
        <FormattedMessage
          id='Dashboard.Running.Running'
          values={{
            TestName
          }}
        />
      </Heading>
      {!logOpen && lottieOptions.animationData
        && <Lottie
          width={300}
          height={300}
          options={lottieOptions}
        />}
      {
        !lottieOptions.animationData &&
        React.cloneElement(testGroup.icon, {size: 300})
      }
      <LineProgress
        percent={percent*100}
        strokeColor={theme.colors.white}
        strokeWidth='2'
        trailColor='rgba(255,255,255,0.4)'
        trailWidth='2'
      />
      {eta > 0 &&
      <Flex justifyContent='center'>
        <Box pr={1}>
          <FormattedMessage id='Dashboard.Running.EstimatedTimeLeft' />
        </Box>
        <Box>
          <FormattedMessage id='Dashboard.Running.Seconds' values={{ seconds: moment.duration(eta*1000).humanize() }}/>
        </Box>
      </Flex>
      }
      <Text>{progressLine}</Text>
    </Container>

    <Log lines={logLines} onToggleLog={onToggleLog} open={logOpen} />
    {error && <p>{error}</p>}
  </StyledRunningTest>
}

const WindowContainer = styled.div`
  position: absolute;
  top: 0px;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: ${props => props.bg};
`

const WindowDraggable = styled.div`
  background-color: ${props => props.bg};
  height: 50px;
  width: 100%;
  /* This makes it possible to drag the window around from the side bar */
  -webkit-app-region: drag;
`

const ContentContainer = styled.div`
  width: 100%;
  z-index: 10;
`

class Running extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      error: null,
      logOpen: false,
      done: true
    }
    this.onToggleLog = this.onToggleLog.bind(this)
  }

  onToggleLog() {
    this.setState({
      logOpen: !this.state.logOpen
    })
  }

  render() {
    const {
      testGroupName,
      progressLine,
      percent,
      runningTestName,
      logLines,
      eta,
      error,
      onKill
    } = this.props

    const {
      logOpen
    } = this.state

    const testGroup = testGroups[testGroupName]

    return <WindowContainer bg={testGroup.color}>
      <WindowDraggable bg={testGroup.color} />
      <ContentContainer color={testGroup.color}>
        <RunningTest
          progressLine={progressLine}
          percent={percent}
          runningTestName={runningTestName}
          logLines={logLines}
          error={error}
          testGroup={testGroup}
          logOpen={logOpen}
          onKill={onKill}
          onToggleLog={this.onToggleLog}
          eta={eta}
        />
      </ContentContainer>
    </WindowContainer>
  }
}

Running.defaultProps = {
  progressLine: '',
  percent: 0,
  eta: -1,
  logLines: [],
  error: null,
  runningTestName: ''
}
export default Running
