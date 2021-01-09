import './Game.scss'

import cx from 'classnames'
import FontFaceObserver from 'fontfaceobserver'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Lottie from 'react-lottie'

import speakerImage from '../../assets/images/speakerup.png'
import loaderLottie from '../../assets/lotties/loader.json'
import GameEngine, { GameEngineEvents } from '../../model/GameEngine'
import SoundEngine from '../../model/SoundEngine'

type Props = {
  className?: string
}

export default function Game(props: Props) {
  const { className, ...otherProps } = props

  const $container = useRef<HTMLDivElement>(null)
  const $gameEngine = useRef<GameEngine | null>(null)

  const audioLoaded = useRef(false)
  const fontsLoaded = useRef(false)

  const [showLoading, setShowLoading] = useState(true)
  const [showSplash, setShowSplash] = useState(true)
  const [showMenu, setShowMenu] = useState(false)
  const [showGameover, setShowGameover] = useState(false)
  const [showPause, setShowPause] = useState(false)

  const updateLoadingStatus = useCallback(() => {
    if (audioLoaded.current && fontsLoaded.current) setShowLoading(false)
  }, [])

  useEffect(() => {
    if (!$container.current) return

    const font = new FontFaceObserver('BitTrip7sRB')
    font.load().then(function () {
      audioLoaded.current = true
      updateLoadingStatus()
    })

    const soundEngine = new SoundEngine()

    soundEngine.loadAll().then(() => {
      fontsLoaded.current = true
      updateLoadingStatus()

      if ($container.current) {
        $gameEngine.current = new GameEngine($container.current, soundEngine)
        $gameEngine.current.on(GameEngineEvents.DEATH, () => {
          setShowGameover(true)
        })
        $gameEngine.current.on(GameEngineEvents.PAUSE, () => {
          setShowPause(true)
        })
        $gameEngine.current.on(GameEngineEvents.RESUME, () => {
          setShowPause(false)
        })
      }
    })

    return () => {
      $gameEngine.current?.kill()
    }
  }, [updateLoadingStatus])

  const handleSplashClick = useCallback(() => {
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

      <div className={cx('Splash-Container', showSplash && 'show')} onClick={handleSplashClick}>
        <h1 className="title">Starforce</h1>
        <div className="separator" />
        <p className="subtitle">Click to start</p>
        <div className="separator" />
        <p className="subtitle">Better with headphones</p>
        <img alt="speaker" className="sound" src={speakerImage} />
      </div>

      <div className={cx('Loading-Container', showLoading && 'show')}>
        <Lottie
          options={{
            loop: true,
            autoplay: true,
            animationData: loaderLottie,
            rendererSettings: {
              preserveAspectRatio: 'xMidYMid slice',
            },
          }}
          height={300}
          width={300}
        />
      </div>
    </div>
  )
}
