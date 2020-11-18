import './Game.scss'

import cx from 'classnames'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import speakerImage from '../../assets/images/speakerup.png'
import GameEngine, { GameEngineEvents } from '../../model/GameEngine'

type Props = {
  className?: string
}

export default function Game(props: Props) {
  const { className, ...otherProps } = props

  const $container = useRef<HTMLDivElement>(null)
  const $gameEngine = useRef<GameEngine | null>(null)
  const [showSplash, setShowSplash] = useState(true)
  const [showMenu, setShowMenu] = useState(false)
  const [showGameover, setShowGameover] = useState(false)
  const [showPause, setShowPause] = useState(false)

  useEffect(() => {
    if (!$container.current) return

    $gameEngine.current = new GameEngine($container.current)
    $gameEngine.current.on(GameEngineEvents.DEATH, () => {
      setShowGameover(true)
    })
    $gameEngine.current.on(GameEngineEvents.PAUSE, () => {
      setShowPause(true)
    })
    $gameEngine.current.on(GameEngineEvents.RESUME, () => {
      setShowPause(false)
    })

    console.log($gameEngine.current)

    return () => {
      $gameEngine.current?.kill()
    }
  }, [])

  const handleMenuClick = useCallback(() => {
    if (showSplash && $gameEngine.current) {
      setShowSplash(false)
      setShowMenu(true)
      $gameEngine.current.soundEngine.welcomeSound.play()
    }
  }, [showSplash])

  const handlePlayClick = useCallback(() => {
    if (showMenu && $gameEngine.current) {
      setShowMenu(false)
      $gameEngine.current.hasGameStarted = true
      $gameEngine.current.soundEngine.goSound.play()
    }
  }, [showMenu])

  const handleRestartClick = useCallback(() => {
    if (showGameover && $gameEngine.current) {
      setShowGameover(false)
      $gameEngine.current.restart()
    }
    setShowMenu(false)
  }, [showGameover])

  return (
    <div className={cx(className, 'Game')} {...otherProps}>
      <div ref={$container} className="Canvas-container" />
      <div className={cx('Splash-Container', showSplash && 'show')} onClick={handleMenuClick}>
        <h1 className="title">Starforce</h1>
        <p className="subtitle">Better with headphones</p>
        <img alt="speaker" className="sound" src={speakerImage} />
      </div>

      <div className={cx('Menu-Container', showMenu && 'show')}>
        <h1 className="title">Starforce</h1>
        <button className="button" onClick={handlePlayClick}>
          Play
        </button>
      </div>

      <div className={cx('Gameover-Container', showGameover && 'show')}>
        <h1 className="title">Game over</h1>
        <button className="button" onClick={handleRestartClick}>
          Restart
        </button>
      </div>

      <div className={cx('Pause-Container', showPause && 'show')}>
        <h1 className="title">Pause</h1>
      </div>
    </div>
  )
}
