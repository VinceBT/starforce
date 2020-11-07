import './Game.scss'

import cx from 'classnames'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import GameEngine from '../model/GameEngine'

type Props = {
  className?: string
}

export default function Game(props: Props) {
  const { className, ...otherProps } = props

  const $container = useRef<HTMLDivElement>(null)

  const [showMenu, setShowMenu] = useState(true)

  useEffect(() => {
    if (!$container.current) return

    const gameEngine = new GameEngine($container.current)

    return () => {
      gameEngine.kill()
    }
  }, [])

  const handleMenuClick = useCallback(() => void setShowMenu(false), [])

  return (
    <div className={cx(className, 'Game')} {...otherProps}>
      <div ref={$container} className="Canvas-container" />
      {showMenu && <div className="Menu-Container" onClick={handleMenuClick} />}
    </div>
  )
}
