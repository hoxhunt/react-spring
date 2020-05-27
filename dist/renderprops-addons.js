'use strict'

Object.defineProperty(exports, '__esModule', { value: true })

function _interopDefault(ex) {
  return ex && typeof ex === 'object' && 'default' in ex ? ex['default'] : ex
}

var _extends = _interopDefault(require('@babel/runtime/helpers/esm/extends'))
var _objectWithoutPropertiesLoose = _interopDefault(
  require('@babel/runtime/helpers/esm/objectWithoutPropertiesLoose')
)
var React = _interopDefault(require('react'))
var renderprops = require('react-spring/renderprops')

const El = renderprops.Globals.defaultElement
const AnimatedDiv = renderprops.animated(El)
const { Provider, Consumer } = React.createContext(null)

function getScrollType(horizontal) {
  return horizontal ? 'scrollLeft' : 'scrollTop'
}

const START_TRANSLATE_3D = 'translate3d(0px,0px,0px)'
const START_TRANSLATE = 'translate(0px,0px)'
class ParallaxLayer extends React.PureComponent {
  componentDidMount() {
    const parent = this.parent

    if (parent) {
      parent.layers = parent.layers.concat(this)
      parent.update()
    }
  }

  componentWillUnmount() {
    const parent = this.parent

    if (parent) {
      parent.layers = parent.layers.filter(layer => layer !== this)
      parent.update()
    }
  }

  setPosition(height, scrollTop, immediate = false) {
    const { config } = this.parent.props
    const targetScroll = Math.floor(this.props.offset) * height
    const offset = height * this.props.offset + targetScroll * this.props.speed
    const to = parseFloat(-(scrollTop * this.props.speed) + offset)
    this.controller.update({
      translate: to,
      config,
      immediate,
    })
  }

  setHeight(height, immediate = false) {
    const { config } = this.parent.props
    const to = parseFloat(height * this.props.factor)
    this.controller.update({
      space: to,
      config,
      immediate,
    })
  }

  initialize() {
    const props = this.props
    const parent = this.parent
    const targetScroll = Math.floor(props.offset) * parent.space
    const offset = parent.space * props.offset + targetScroll * props.speed
    const to = parseFloat(-(parent.current * props.speed) + offset)
    this.controller = new renderprops.Controller({
      space: parent.space * props.factor,
      translate: to,
    })
  }

  renderLayer() {
    const _this$props = this.props,
      props = _objectWithoutPropertiesLoose(_this$props, [
        'style',
        'children',
        'offset',
        'speed',
        'factor',
        'className',
      ])

    const horizontal = this.parent.props.horizontal
    const translate3d = this.controller.interpolations.translate.interpolate(
      x => (horizontal ? `translate3d(${x}px,0,0)` : `translate3d(0,${x}px,0)`)
    )
    return /*#__PURE__*/ React.createElement(
      AnimatedDiv,
      _extends({}, props, {
        className: className,
        style: _extends(
          {
            position: 'absolute',
            backgroundSize: 'auto',
            backgroundRepeat: 'no-repeat',
            willChange: 'transform',
            [horizontal ? 'height' : 'width']: '100%',
            [horizontal ? 'width' : 'height']: this.controller.interpolations
              .space,
            WebkitTransform: translate3d,
            MsTransform: translate3d,
            transform: translate3d,
          },
          style
        ),
      }),
      children
    )
  }

  render() {
    return /*#__PURE__*/ React.createElement(Consumer, null, parent => {
      if (parent && !this.parent) {
        this.parent = parent
        this.initialize()
      }

      return this.renderLayer()
    })
  }
}
ParallaxLayer.defaultProps = {
  factor: 1,
  offset: 0,
  speed: 0,
}
class Parallax extends React.PureComponent {
  // TODO keep until major release
  constructor(props) {
    super()

    this.moveItems = () => {
      this.layers.forEach(layer => layer.setPosition(this.space, this.current))
      this.busy = false
    }

    this.scrollerRaf = () => renderprops.Globals.requestFrame(this.moveItems)

    this.onScroll = event => {
      const { horizontal } = this.props

      if (!this.busy) {
        this.busy = true
        this.scrollerRaf()
        this.current = event.target[getScrollType(horizontal)]
      }
    }

    this.update = () => {
      const { scrolling, horizontal } = this.props
      const scrollType = getScrollType(horizontal)
      if (!this.container) return
      this.space = this.container[horizontal ? 'clientWidth' : 'clientHeight']
      if (scrolling) this.current = this.container[scrollType]
      else this.container[scrollType] = this.current = this.offset * this.space
      if (this.content)
        this.content.style[horizontal ? 'width' : 'height'] = `${this.space *
          this.props.pages}px`
      this.layers.forEach(layer => {
        layer.setHeight(this.space, true)
        layer.setPosition(this.space, this.current, true)
      })
    }

    this.updateRaf = () => {
      renderprops.Globals.requestFrame(this.update) // Some browsers don't fire on maximize

      setTimeout(this.update, 150)
    }

    this.scrollStop = event => this.controller.stop()

    this.state = {
      ready: false,
    }
    this.layers = []
    this.space = 0
    this.current = 0
    this.offset = 0
    this.busy = false
    this.controller = new renderprops.Controller({
      scroll: 0,
    })
  }

  scrollTo(offset) {
    const { horizontal, config } = this.props
    const scrollType = getScrollType(horizontal)
    this.scrollStop()
    this.offset = offset
    const target = this.container
    this.controller.update({
      scroll: offset * this.space,
      config,
      onFrame: ({ scroll }) => (target[scrollType] = scroll),
    })
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateRaf, false)
    this.update()
    this.setState({
      ready: true,
    })
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateRaf, false)
  }

  componentDidUpdate() {
    this.update()
  }

  render() {
    const {
      style,
      innerStyle,
      pages,
      id,
      className,
      scrolling,
      children,
      horizontal,
    } = this.props
    const overflow = scrolling ? 'scroll' : 'hidden'
    return /*#__PURE__*/ React.createElement(
      El,
      {
        ref: node => (this.container = node),
        onScroll: this.onScroll,
        onWheel: scrolling ? this.scrollStop : null,
        onTouchStart: scrolling ? this.scrollStop : null,
        style: _extends(
          {
            position: 'absolute',
            width: '100%',
            height: '100%',
            overflow,
            overflowY: horizontal ? 'hidden' : overflow,
            overflowX: horizontal ? overflow : 'hidden',
            WebkitOverflowScrolling: 'touch',
            WebkitTransform: START_TRANSLATE,
            MsTransform: START_TRANSLATE,
            transform: START_TRANSLATE_3D,
          },
          style
        ),
        id: id,
        className: className,
      },
      this.state.ready &&
        /*#__PURE__*/ React.createElement(
          El,
          {
            ref: node => (this.content = node),
            style: _extends(
              {
                position: 'absolute',
                [horizontal ? 'height' : 'width']: '100%',
                WebkitTransform: START_TRANSLATE,
                MsTransform: START_TRANSLATE,
                transform: START_TRANSLATE_3D,
                overflow: 'hidden',
                [horizontal ? 'width' : 'height']: this.space * pages,
              },
              innerStyle
            ),
          },
          /*#__PURE__*/ React.createElement(
            Provider,
            {
              value: this,
            },
            children
          )
        )
    )
  }
}
Parallax.Layer = ParallaxLayer
Parallax.defaultProps = {
  config: renderprops.config.slow,
  scrolling: true,
  horizontal: false,
}

exports.Parallax = Parallax
exports.ParallaxLayer = ParallaxLayer
