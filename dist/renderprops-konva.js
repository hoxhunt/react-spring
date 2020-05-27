'use strict'

Object.defineProperty(exports, '__esModule', { value: true })

function _interopDefault(ex) {
  return ex && typeof ex === 'object' && 'default' in ex ? ex['default'] : ex
}

var _extends = _interopDefault(require('@babel/runtime/helpers/esm/extends'))
var _objectWithoutPropertiesLoose = _interopDefault(
  require('@babel/runtime/helpers/esm/objectWithoutPropertiesLoose')
)
var React = require('react')
var React__default = _interopDefault(React)

let bugfixes = undefined
let applyAnimatedValues = undefined
let colorNames = []
let requestFrame = cb =>
  typeof window !== 'undefined' && window.requestAnimationFrame(cb)
let cancelFrame = cb =>
  typeof window !== 'undefined' && window.cancelAnimationFrame(cb)
let interpolation = undefined
let now = () => Date.now()
let defaultElement = undefined
let createAnimatedStyle = undefined
const injectApplyAnimatedValues = (fn, transform) =>
  (applyAnimatedValues = {
    fn,
    transform,
  })
const injectColorNames = names => (colorNames = names)
const injectBugfixes = fn => (bugfixes = fn)
const injectInterpolation = cls => (interpolation = cls)
const injectFrame = (raf, caf) => ([requestFrame, cancelFrame] = [raf, caf])
const injectNow = nowFn => (now = nowFn)
const injectDefaultElement = el => (defaultElement = el)
const injectCreateAnimatedStyle = factory => (createAnimatedStyle = factory)

var Globals = /*#__PURE__*/ Object.freeze({
  get bugfixes() {
    return bugfixes
  },
  get applyAnimatedValues() {
    return applyAnimatedValues
  },
  get colorNames() {
    return colorNames
  },
  get requestFrame() {
    return requestFrame
  },
  get cancelFrame() {
    return cancelFrame
  },
  get interpolation() {
    return interpolation
  },
  get now() {
    return now
  },
  get defaultElement() {
    return defaultElement
  },
  get createAnimatedStyle() {
    return createAnimatedStyle
  },
  injectApplyAnimatedValues: injectApplyAnimatedValues,
  injectColorNames: injectColorNames,
  injectBugfixes: injectBugfixes,
  injectInterpolation: injectInterpolation,
  injectFrame: injectFrame,
  injectNow: injectNow,
  injectDefaultElement: injectDefaultElement,
  injectCreateAnimatedStyle: injectCreateAnimatedStyle,
})

class Animated {
  attach() {}

  detach() {}

  getValue() {}

  getAnimatedValue() {
    return this.getValue()
  }

  addChild(child) {}

  removeChild(child) {}

  getChildren() {
    return []
  }
}

const getValues = object => Object.keys(object).map(k => object[k])

class AnimatedWithChildren extends Animated {
  constructor(...args) {
    super(...args)
    this.children = []

    this.getChildren = () => this.children

    this.getPayload = (index = undefined) =>
      index !== void 0 && this.payload
        ? this.payload[index]
        : this.payload || this
  }

  addChild(child) {
    if (this.children.length === 0) this.attach()
    this.children.push(child)
  }

  removeChild(child) {
    const index = this.children.indexOf(child)
    this.children.splice(index, 1)
    if (this.children.length === 0) this.detach()
  }
}
class AnimatedArrayWithChildren extends AnimatedWithChildren {
  constructor(...args) {
    super(...args)
    this.payload = []

    this.getAnimatedValue = () => this.getValue()

    this.attach = () =>
      this.payload.forEach(p => p instanceof Animated && p.addChild(this))

    this.detach = () =>
      this.payload.forEach(p => p instanceof Animated && p.removeChild(this))
  }
}
class AnimatedObjectWithChildren extends AnimatedWithChildren {
  constructor(...args) {
    super(...args)
    this.payload = {}

    this.getAnimatedValue = () => this.getValue(true)

    this.attach = () =>
      getValues(this.payload).forEach(
        s => s instanceof Animated && s.addChild(this)
      )

    this.detach = () =>
      getValues(this.payload).forEach(
        s => s instanceof Animated && s.removeChild(this)
      )
  }

  getValue(animated = false) {
    const payload = {}

    for (const key in this.payload) {
      const value = this.payload[key]
      if (animated && !(value instanceof Animated)) continue
      payload[key] =
        value instanceof Animated
          ? value[animated ? 'getAnimatedValue' : 'getValue']()
          : value
    }

    return payload
  }
}

class Interpolation {
  // Default config = config, args
  // Short config   = range, output, extrapolate
  static create(config, output, extra) {
    if (typeof config === 'function') return config
    else if (
      interpolation &&
      config.output &&
      typeof config.output[0] === 'string'
    )
      return interpolation(config)
    else if (Array.isArray(config))
      return Interpolation.create({
        range: config,
        output,
        extrapolate: extra || 'extend',
      })
    let outputRange = config.output
    let inputRange = config.range || [0, 1]

    let easing = config.easing || (t => t)

    let extrapolateLeft = 'extend'
    let map = config.map
    if (config.extrapolateLeft !== undefined)
      extrapolateLeft = config.extrapolateLeft
    else if (config.extrapolate !== undefined)
      extrapolateLeft = config.extrapolate
    let extrapolateRight = 'extend'
    if (config.extrapolateRight !== undefined)
      extrapolateRight = config.extrapolateRight
    else if (config.extrapolate !== undefined)
      extrapolateRight = config.extrapolate
    return input => {
      let range = findRange(input, inputRange)
      return interpolate(
        input,
        inputRange[range],
        inputRange[range + 1],
        outputRange[range],
        outputRange[range + 1],
        easing,
        extrapolateLeft,
        extrapolateRight,
        map
      )
    }
  }
}

function interpolate(
  input,
  inputMin,
  inputMax,
  outputMin,
  outputMax,
  easing,
  extrapolateLeft,
  extrapolateRight,
  map
) {
  let result = map ? map(input) : input // Extrapolate

  if (result < inputMin) {
    if (extrapolateLeft === 'identity') return result
    else if (extrapolateLeft === 'clamp') result = inputMin
  }

  if (result > inputMax) {
    if (extrapolateRight === 'identity') return result
    else if (extrapolateRight === 'clamp') result = inputMax
  }

  if (outputMin === outputMax) return outputMin
  if (inputMin === inputMax) return input <= inputMin ? outputMin : outputMax // Input Range

  if (inputMin === -Infinity) result = -result
  else if (inputMax === Infinity) result = result - inputMin
  else result = (result - inputMin) / (inputMax - inputMin) // Easing

  result = easing(result) // Output Range

  if (outputMin === -Infinity) result = -result
  else if (outputMax === Infinity) result = result + outputMin
  else result = result * (outputMax - outputMin) + outputMin
  return result
}

function findRange(input, inputRange) {
  for (var i = 1; i < inputRange.length - 1; ++i)
    if (inputRange[i] >= input) break

  return i - 1
}

class AnimatedInterpolation extends AnimatedArrayWithChildren {
  constructor(parents, _config, _arg) {
    super()

    this.getValue = () =>
      this.calc(...this.payload.map(value => value.getValue()))

    this.updateConfig = (config, arg) =>
      (this.calc = Interpolation.create(config, arg))

    this.interpolate = (config, arg) =>
      new AnimatedInterpolation(this, config, arg)

    this.payload = // AnimatedArrays should unfold, except AnimatedInterpolation which is taken as is
      parents instanceof AnimatedArrayWithChildren && !parents.updateConfig
        ? parents.payload
        : Array.isArray(parents)
        ? parents
        : [parents]
    this.calc = Interpolation.create(_config, _arg)
  }
}
const interpolate$1 = (parents, config, arg) =>
  parents && new AnimatedInterpolation(parents, config, arg)

/**
 * Animated works by building a directed acyclic graph of dependencies
 * transparently when you render your Animated components.
 *
 *               new Animated.Value(0)
 *     .interpolate()        .interpolate()    new Animated.Value(1)
 *         opacity               translateY      scale
 *          style                         transform
 *         View#234                         style
 *                                         View#123
 *
 * A) Top Down phase
 * When an Animated.Value is updated, we recursively go down through this
 * graph in order to find leaf nodes: the views that we flag as needing
 * an update.
 *
 * B) Bottom Up phase
 * When a view is flagged as needing an update, we recursively go back up
 * in order to build the new value that it needs. The reason why we need
 * this two-phases process is to deal with composite props such as
 * transform which can receive values from multiple parents.
 */

function findAnimatedStyles(node, styles) {
  if (typeof node.update === 'function') styles.add(node)
  else node.getChildren().forEach(child => findAnimatedStyles(child, styles))
}
/**
 * Standard value for driving animations.  One `Animated.Value` can drive
 * multiple properties in a synchronized fashion, but can only be driven by one
 * mechanism at a time.  Using a new mechanism (e.g. starting a new animation,
 * or calling `setValue`) will stop any previous ones.
 */

class AnimatedValue extends AnimatedWithChildren {
  constructor(_value) {
    super()

    this.setValue = (value, flush = true) => {
      this.value = value
      if (flush) this.flush()
    }

    this.getValue = () => this.value

    this.updateStyles = () => findAnimatedStyles(this, this.animatedStyles)

    this.updateValue = value => this.flush((this.value = value))

    this.interpolate = (config, arg) =>
      new AnimatedInterpolation(this, config, arg)

    this.value = _value
    this.animatedStyles = new Set()
    this.done = false
    this.startPosition = _value
    this.lastPosition = _value
    this.lastVelocity = undefined
    this.lastTime = undefined
    this.controller = undefined
  }

  flush() {
    if (this.animatedStyles.size === 0) this.updateStyles()
    this.animatedStyles.forEach(animatedStyle => animatedStyle.update())
  }

  prepare(controller) {
    // Values stay loyal to their original controller, this is also a way to
    // detect trailing values originating from a foreign controller
    if (this.controller === undefined) this.controller = controller

    if (this.controller === controller) {
      this.startPosition = this.value
      this.lastPosition = this.value
      this.lastVelocity = controller.isActive ? this.lastVelocity : undefined
      this.lastTime = controller.isActive ? this.lastTime : undefined
      this.done = false
      this.animatedStyles.clear()
    }
  }
}

class AnimatedArray extends AnimatedArrayWithChildren {
  constructor(array) {
    super()

    this.setValue = (value, flush = true) => {
      if (Array.isArray(value)) {
        if (value.length === this.payload.length)
          value.forEach((v, i) => this.payload[i].setValue(v, flush))
      } else
        this.payload.forEach((v, i) => this.payload[i].setValue(value, flush))
    }

    this.getValue = () => this.payload.map(v => v.getValue())

    this.interpolate = (config, arg) =>
      new AnimatedInterpolation(this, config, arg)

    this.payload = array.map(n => new AnimatedValue(n))
  }
}

let active = false
const controllers = new Set()

const frameLoop = () => {
  let time = now()

  for (let controller of controllers) {
    let isDone = true
    let noChange = true

    for (
      let configIdx = 0;
      configIdx < controller.configs.length;
      configIdx++
    ) {
      let config = controller.configs[configIdx]
      let endOfAnimation, lastTime

      for (let valIdx = 0; valIdx < config.animatedValues.length; valIdx++) {
        let animation = config.animatedValues[valIdx] // If an animation is done, skip, until all of them conclude

        if (animation.done) continue
        let from = config.fromValues[valIdx]
        let to = config.toValues[valIdx]
        let position = animation.lastPosition
        let isAnimated = to instanceof Animated
        let velocity = Array.isArray(config.initialVelocity)
          ? config.initialVelocity[valIdx]
          : config.initialVelocity
        if (isAnimated) to = to.getValue() // Conclude animation if it's either immediate, or from-values match end-state

        if (config.immediate || (!isAnimated && !config.decay && from === to)) {
          animation.updateValue(to)
          animation.done = true
          continue
        } // Doing delay here instead of setTimeout is one async worry less

        if (config.delay && time - controller.startTime < config.delay) {
          isDone = false
          continue
        } // Flag change

        noChange = false // Break animation when string values are involved

        if (typeof from === 'string' || typeof to === 'string') {
          animation.updateValue(to)
          animation.done = true
          continue
        }

        if (config.duration !== void 0) {
          /** Duration easing */
          position =
            from +
            config.easing(
              (time - controller.startTime - config.delay) / config.duration
            ) *
              (to - from)
          endOfAnimation =
            time >= controller.startTime + config.delay + config.duration
        } else if (config.decay) {
          /** Decay easing */
          position =
            from +
            (velocity / (1 - 0.998)) *
              (1 - Math.exp(-(1 - 0.998) * (time - controller.startTime)))
          endOfAnimation = Math.abs(animation.lastPosition - position) < 0.1
          if (endOfAnimation) to = position
        } else {
          /** Spring easing */
          lastTime = animation.lastTime !== void 0 ? animation.lastTime : time
          velocity =
            animation.lastVelocity !== void 0
              ? animation.lastVelocity
              : config.initialVelocity // If we lost a lot of frames just jump to the end.
          // if (time > lastTime + 64) lastTime = time
          // http://gafferongames.com/game-physics/fix-your-timestep/

          let numSteps = Math.floor(time - lastTime)

          for (let i = 0; i < numSteps; ++i) {
            let force = -config.tension * (position - to)
            let damping = -config.friction * velocity
            let acceleration = (force + damping) / config.mass
            velocity = velocity + (acceleration * 1) / 1000
            position = position + (velocity * 1) / 1000
          } // Conditions for stopping the spring animation

          let isOvershooting =
            config.clamp && config.tension !== 0
              ? from < to
                ? position > to
                : position < to
              : false
          let isVelocity = Math.abs(velocity) <= config.precision
          let isDisplacement =
            config.tension !== 0
              ? Math.abs(to - position) <= config.precision
              : true
          endOfAnimation = isOvershooting || (isVelocity && isDisplacement)
          animation.lastVelocity = velocity
          animation.lastTime = time
        } // Trails aren't done until their parents conclude

        if (isAnimated && !config.toValues[valIdx].done) endOfAnimation = false

        if (endOfAnimation) {
          // Ensure that we end up with a round value
          if (animation.value !== to) position = to
          animation.done = true
        } else isDone = false

        animation.updateValue(position)
        animation.lastPosition = position
      } // Keep track of updated values only when necessary

      if (controller.props.onFrame || !controller.props.native)
        controller.animatedProps[config.name] = config.interpolation.getValue()
    } // Update callbacks in the end of the frame

    if (controller.props.onFrame || !controller.props.native) {
      if (!controller.props.native && controller.onUpdate) controller.onUpdate()
      if (controller.props.onFrame)
        controller.props.onFrame(controller.animatedProps)
    } // Either call onEnd or next frame

    if (isDone) {
      controllers.delete(controller)
      controller.debouncedOnEnd({
        finished: true,
        noChange,
      })
    }
  } // Loop over as long as there are controllers ...

  if (controllers.size) requestFrame(frameLoop)
  else active = false
}

const addController = controller => {
  if (!controllers.has(controller)) {
    controllers.add(controller)
    if (!active) requestFrame(frameLoop)
    active = true
  }
}

const removeController = controller => {
  if (controllers.has(controller)) {
    controllers.delete(controller)
  }
}

function withDefault(value, defaultValue) {
  return value === undefined || value === null ? defaultValue : value
}
function toArray(a) {
  return a !== void 0 ? (Array.isArray(a) ? a : [a]) : []
}
function shallowEqual(a, b) {
  if (typeof a !== typeof b) return false
  if (typeof a === 'string' || typeof a === 'number') return a === b
  let i

  for (i in a) if (!(i in b)) return false

  for (i in b) if (a[i] !== b[i]) return false

  return i === void 0 ? a === b : true
}
function callProp(obj, ...args) {
  return typeof obj === 'function' ? obj(...args) : obj
}
function getValues$1(object) {
  return Object.keys(object).map(k => object[k])
}
function getForwardProps(props) {
  const forward = _objectWithoutPropertiesLoose(props, [
    'to',
    'from',
    'config',
    'native',
    'onStart',
    'onRest',
    'onFrame',
    'children',
    'reset',
    'reverse',
    'force',
    'immediate',
    'impl',
    'inject',
    'delay',
    'attach',
    'destroyed',
    'interpolateTo',
    'autoStart',
    'ref',
  ])

  return forward
}
function interpolateTo(props) {
  const forward = getForwardProps(props)
  const rest = Object.keys(props).reduce(
    (a, k) =>
      forward[k] !== void 0
        ? a
        : _extends({}, a, {
            [k]: props[k],
          }),
    {}
  )
  return _extends(
    {
      to: forward,
    },
    rest
  )
}
function convertToAnimatedValue(acc, [name, value]) {
  return _extends({}, acc, {
    [name]: new (Array.isArray(value) ? AnimatedArray : AnimatedValue)(value),
  })
}
function convertValues(props) {
  const { from, to, native } = props
  const allProps = Object.entries(_extends({}, from, to))
  return native
    ? allProps.reduce(convertToAnimatedValue, {})
    : _extends({}, from, to)
}
function handleRef(ref, forward) {
  if (forward) {
    // If it's a function, assume it's a ref callback
    if (typeof forward === 'function') forward(ref)
    else if (typeof forward === 'object') {
      // If it's an object and has a 'current' property, assume it's a ref object
      forward.current = ref
    }
  }

  return ref
}

class Controller {
  constructor(
    props,
    config = {
      native: true,
      interpolateTo: true,
      autoStart: true,
    }
  ) {
    this.getValues = () =>
      this.props.native ? this.interpolations : this.animatedProps

    this.dependents = new Set()
    this.isActive = false
    this.hasChanged = false
    this.props = {}
    this.merged = {}
    this.animations = {}
    this.interpolations = {}
    this.animatedProps = {}
    this.configs = []
    this.frame = undefined
    this.startTime = undefined
    this.lastTime = undefined
    this.update(_extends({}, props, config))
  }

  update(props, ...start) {
    this.props = _extends({}, this.props, props)
    let {
      from = {},
      to = {},
      config = {},
      delay = 0,
      reverse,
      attach,
      reset,
      immediate,
      autoStart,
      ref,
    } = this.props.interpolateTo ? interpolateTo(this.props) : this.props // Reverse values when requested

    if (reverse) {
      ;[from, to] = [to, from]
    }

    this.hasChanged = false // Attachment handling, trailed springs can "attach" themselves to a previous spring

    let target = attach && attach(this) // Reset merged props when necessary

    let extra = reset ? {} : this.merged // This will collect all props that were ever set

    this.merged = _extends({}, from, extra, to) // Reduces input { name: value } pairs into animated values

    this.animations = Object.entries(this.merged).reduce(
      (acc, [name, value], i) => {
        // Issue cached entries, except on reset
        let entry = (!reset && acc[name]) || {} // Figure out what the value is supposed to be

        const isNumber = typeof value === 'number'
        const isString =
          typeof value === 'string' &&
          !value.startsWith('#') &&
          !/\d/.test(value) &&
          !colorNames[value]
        const isArray = !isNumber && !isString && Array.isArray(value)
        let fromValue = from[name] !== undefined ? from[name] : value
        let toValue = isNumber || isArray ? value : isString ? value : 1
        let toConfig = callProp(config, name)
        if (target) toValue = target.animations[name].parent // Detect changes, animated values will be checked in the raf-loop

        if (toConfig.decay !== void 0 || !shallowEqual(entry.changes, value)) {
          this.hasChanged = true
          let parent, interpolation$$1
          if (isNumber || isString)
            parent = interpolation$$1 =
              entry.parent || new AnimatedValue(fromValue)
          else if (isArray)
            parent = interpolation$$1 =
              entry.parent || new AnimatedArray(fromValue)
          else {
            const prev =
              entry.interpolation &&
              entry.interpolation.calc(entry.parent.value)

            if (entry.parent) {
              parent = entry.parent
              parent.setValue(0, false)
            } else parent = new AnimatedValue(0)

            const range = {
              output: [prev !== void 0 ? prev : fromValue, value],
            }

            if (entry.interpolation) {
              interpolation$$1 = entry.interpolation
              entry.interpolation.updateConfig(range)
            } else interpolation$$1 = parent.interpolate(range)
          } // Set immediate values

          if (callProp(immediate, name)) parent.setValue(value, false) // Reset animated values

          const animatedValues = toArray(parent.getPayload())
          animatedValues.forEach(value => value.prepare(this))
          return _extends({}, acc, {
            [name]: _extends({}, entry, {
              name,
              parent,
              interpolation: interpolation$$1,
              animatedValues,
              changes: value,
              fromValues: toArray(parent.getValue()),
              toValues: toArray(target ? toValue.getPayload() : toValue),
              immediate: callProp(immediate, name),
              delay: withDefault(toConfig.delay, delay || 0),
              initialVelocity: withDefault(toConfig.velocity, 0),
              clamp: withDefault(toConfig.clamp, false),
              precision: withDefault(toConfig.precision, 0.01),
              tension: withDefault(toConfig.tension, 170),
              friction: withDefault(toConfig.friction, 26),
              mass: withDefault(toConfig.mass, 1),
              duration: toConfig.duration,
              easing: withDefault(toConfig.easing, t => t),
              decay: toConfig.decay,
            }),
          })
        } else return acc
      },
      this.animations
    )

    if (this.hasChanged) {
      this.configs = getValues$1(this.animations)
      this.animatedProps = {}
      this.interpolations = {}

      for (let key in this.animations) {
        this.interpolations[key] = this.animations[key].interpolation
        this.animatedProps[key] = this.animations[key].interpolation.getValue()
      }
    } // TODO: clean up ref in controller

    if (!ref && (autoStart || start.length)) this.start(...start)
    const [onEnd, onUpdate] = start
    this.onEnd = typeof onEnd === 'function' && onEnd
    this.onUpdate = onUpdate
    return this.getValues()
  }

  start(onEnd, onUpdate) {
    this.startTime = now()
    if (this.isActive) this.stop()
    this.isActive = true
    this.onEnd = typeof onEnd === 'function' && onEnd
    this.onUpdate = onUpdate
    if (this.props.onStart) this.props.onStart()
    addController(this)
    return new Promise(res => (this.resolve = res))
  }

  stop(finished = false) {
    // Reset collected changes since the animation has been stopped cold turkey
    if (finished)
      getValues$1(this.animations).forEach(a => (a.changes = undefined))
    this.debouncedOnEnd({
      finished,
    })
  }

  destroy() {
    removeController(this)
    this.props = {}
    this.merged = {}
    this.animations = {}
    this.interpolations = {}
    this.animatedProps = {}
    this.configs = []
  }

  debouncedOnEnd(result) {
    removeController(this)
    this.isActive = false
    const onEnd = this.onEnd
    this.onEnd = null
    if (onEnd) onEnd(result)
    if (this.resolve) this.resolve()
    this.resolve = null
  }
}

class AnimatedProps extends AnimatedObjectWithChildren {
  constructor(props, callback) {
    super()
    if (props.style)
      props = _extends({}, props, {
        style: createAnimatedStyle(props.style),
      })
    this.payload = props
    this.update = callback
    this.attach()
  }
}

function createAnimatedComponent(Component) {
  class AnimatedComponent extends React__default.Component {
    constructor(props) {
      super()

      this.callback = () => {
        if (this.node) {
          const didUpdate = applyAnimatedValues.fn(
            this.node,
            this.propsAnimated.getAnimatedValue(),
            this
          )
          if (didUpdate === false) this.forceUpdate()
        }
      }

      this.attachProps(props)
    }

    componentWillUnmount() {
      this.propsAnimated && this.propsAnimated.detach()
    }

    setNativeProps(props) {
      const didUpdate = applyAnimatedValues.fn(this.node, props, this)
      if (didUpdate === false) this.forceUpdate()
    } // The system is best designed when setNativeProps is implemented. It is
    // able to avoid re-rendering and directly set the attributes that
    // changed. However, setNativeProps can only be implemented on leaf
    // native components. If you want to animate a composite component, you
    // need to re-render it. In this case, we have a fallback that uses
    // forceUpdate.

    attachProps(_ref) {
      let nextProps = _objectWithoutPropertiesLoose(_ref, ['forwardRef'])

      const oldPropsAnimated = this.propsAnimated
      this.propsAnimated = new AnimatedProps(nextProps, this.callback) // When you call detach, it removes the element from the parent list
      // of children. If it goes to 0, then the parent also detaches itself
      // and so on.
      // An optimization is to attach the new elements and THEN detach the old
      // ones instead of detaching and THEN attaching.
      // This way the intermediate state isn't to go to 0 and trigger
      // this expensive recursive detaching to then re-attach everything on
      // the very next operation.

      oldPropsAnimated && oldPropsAnimated.detach()
    }

    shouldComponentUpdate(props) {
      const nextProps = _objectWithoutPropertiesLoose(props, ['style'])

      const _this$props = this.props,
        currentProps = _objectWithoutPropertiesLoose(_this$props, ['style'])

      if (
        !shallowEqual(currentProps, nextProps) ||
        !shallowEqual(currentStyle, style)
      ) {
        this.attachProps(props)
        return true
      }

      return false
    }

    render() {
      const _this$propsAnimated$g = this.propsAnimated.getValue(),
        animatedProps = _objectWithoutPropertiesLoose(_this$propsAnimated$g, [
          'scrollTop',
          'scrollLeft',
        ])

      return /*#__PURE__*/ React__default.createElement(
        Component,
        _extends({}, animatedProps, {
          ref: node => (this.node = handleRef(node, this.props.forwardRef)),
        })
      )
    }
  }

  return React__default.forwardRef((props, ref) =>
    /*#__PURE__*/ React__default.createElement(
      AnimatedComponent,
      _extends({}, props, {
        forwardRef: ref,
      })
    )
  )
}

// http://www.w3.org/TR/css3-color/#svg-color
const colors = {
  transparent: 0x00000000,
  aliceblue: 0xf0f8ffff,
  antiquewhite: 0xfaebd7ff,
  aqua: 0x00ffffff,
  aquamarine: 0x7fffd4ff,
  azure: 0xf0ffffff,
  beige: 0xf5f5dcff,
  bisque: 0xffe4c4ff,
  black: 0x000000ff,
  blanchedalmond: 0xffebcdff,
  blue: 0x0000ffff,
  blueviolet: 0x8a2be2ff,
  brown: 0xa52a2aff,
  burlywood: 0xdeb887ff,
  burntsienna: 0xea7e5dff,
  cadetblue: 0x5f9ea0ff,
  chartreuse: 0x7fff00ff,
  chocolate: 0xd2691eff,
  coral: 0xff7f50ff,
  cornflowerblue: 0x6495edff,
  cornsilk: 0xfff8dcff,
  crimson: 0xdc143cff,
  cyan: 0x00ffffff,
  darkblue: 0x00008bff,
  darkcyan: 0x008b8bff,
  darkgoldenrod: 0xb8860bff,
  darkgray: 0xa9a9a9ff,
  darkgreen: 0x006400ff,
  darkgrey: 0xa9a9a9ff,
  darkkhaki: 0xbdb76bff,
  darkmagenta: 0x8b008bff,
  darkolivegreen: 0x556b2fff,
  darkorange: 0xff8c00ff,
  darkorchid: 0x9932ccff,
  darkred: 0x8b0000ff,
  darksalmon: 0xe9967aff,
  darkseagreen: 0x8fbc8fff,
  darkslateblue: 0x483d8bff,
  darkslategray: 0x2f4f4fff,
  darkslategrey: 0x2f4f4fff,
  darkturquoise: 0x00ced1ff,
  darkviolet: 0x9400d3ff,
  deeppink: 0xff1493ff,
  deepskyblue: 0x00bfffff,
  dimgray: 0x696969ff,
  dimgrey: 0x696969ff,
  dodgerblue: 0x1e90ffff,
  firebrick: 0xb22222ff,
  floralwhite: 0xfffaf0ff,
  forestgreen: 0x228b22ff,
  fuchsia: 0xff00ffff,
  gainsboro: 0xdcdcdcff,
  ghostwhite: 0xf8f8ffff,
  gold: 0xffd700ff,
  goldenrod: 0xdaa520ff,
  gray: 0x808080ff,
  green: 0x008000ff,
  greenyellow: 0xadff2fff,
  grey: 0x808080ff,
  honeydew: 0xf0fff0ff,
  hotpink: 0xff69b4ff,
  indianred: 0xcd5c5cff,
  indigo: 0x4b0082ff,
  ivory: 0xfffff0ff,
  khaki: 0xf0e68cff,
  lavender: 0xe6e6faff,
  lavenderblush: 0xfff0f5ff,
  lawngreen: 0x7cfc00ff,
  lemonchiffon: 0xfffacdff,
  lightblue: 0xadd8e6ff,
  lightcoral: 0xf08080ff,
  lightcyan: 0xe0ffffff,
  lightgoldenrodyellow: 0xfafad2ff,
  lightgray: 0xd3d3d3ff,
  lightgreen: 0x90ee90ff,
  lightgrey: 0xd3d3d3ff,
  lightpink: 0xffb6c1ff,
  lightsalmon: 0xffa07aff,
  lightseagreen: 0x20b2aaff,
  lightskyblue: 0x87cefaff,
  lightslategray: 0x778899ff,
  lightslategrey: 0x778899ff,
  lightsteelblue: 0xb0c4deff,
  lightyellow: 0xffffe0ff,
  lime: 0x00ff00ff,
  limegreen: 0x32cd32ff,
  linen: 0xfaf0e6ff,
  magenta: 0xff00ffff,
  maroon: 0x800000ff,
  mediumaquamarine: 0x66cdaaff,
  mediumblue: 0x0000cdff,
  mediumorchid: 0xba55d3ff,
  mediumpurple: 0x9370dbff,
  mediumseagreen: 0x3cb371ff,
  mediumslateblue: 0x7b68eeff,
  mediumspringgreen: 0x00fa9aff,
  mediumturquoise: 0x48d1ccff,
  mediumvioletred: 0xc71585ff,
  midnightblue: 0x191970ff,
  mintcream: 0xf5fffaff,
  mistyrose: 0xffe4e1ff,
  moccasin: 0xffe4b5ff,
  navajowhite: 0xffdeadff,
  navy: 0x000080ff,
  oldlace: 0xfdf5e6ff,
  olive: 0x808000ff,
  olivedrab: 0x6b8e23ff,
  orange: 0xffa500ff,
  orangered: 0xff4500ff,
  orchid: 0xda70d6ff,
  palegoldenrod: 0xeee8aaff,
  palegreen: 0x98fb98ff,
  paleturquoise: 0xafeeeeff,
  palevioletred: 0xdb7093ff,
  papayawhip: 0xffefd5ff,
  peachpuff: 0xffdab9ff,
  peru: 0xcd853fff,
  pink: 0xffc0cbff,
  plum: 0xdda0ddff,
  powderblue: 0xb0e0e6ff,
  purple: 0x800080ff,
  rebeccapurple: 0x663399ff,
  red: 0xff0000ff,
  rosybrown: 0xbc8f8fff,
  royalblue: 0x4169e1ff,
  saddlebrown: 0x8b4513ff,
  salmon: 0xfa8072ff,
  sandybrown: 0xf4a460ff,
  seagreen: 0x2e8b57ff,
  seashell: 0xfff5eeff,
  sienna: 0xa0522dff,
  silver: 0xc0c0c0ff,
  skyblue: 0x87ceebff,
  slateblue: 0x6a5acdff,
  slategray: 0x708090ff,
  slategrey: 0x708090ff,
  snow: 0xfffafaff,
  springgreen: 0x00ff7fff,
  steelblue: 0x4682b4ff,
  tan: 0xd2b48cff,
  teal: 0x008080ff,
  thistle: 0xd8bfd8ff,
  tomato: 0xff6347ff,
  turquoise: 0x40e0d0ff,
  violet: 0xee82eeff,
  wheat: 0xf5deb3ff,
  white: 0xffffffff,
  whitesmoke: 0xf5f5f5ff,
  yellow: 0xffff00ff,
  yellowgreen: 0x9acd32ff,
}

// const INTEGER = '[-+]?\\d+';
const NUMBER = '[-+]?\\d*\\.?\\d+'
const PERCENTAGE = NUMBER + '%'

function call() {
  return (
    '\\(\\s*(' +
    Array.prototype.slice.call(arguments).join(')\\s*,\\s*(') +
    ')\\s*\\)'
  )
}

const rgb = new RegExp('rgb' + call(NUMBER, NUMBER, NUMBER))
const rgba = new RegExp('rgba' + call(NUMBER, NUMBER, NUMBER, NUMBER))
const hsl = new RegExp('hsl' + call(NUMBER, PERCENTAGE, PERCENTAGE))
const hsla = new RegExp('hsla' + call(NUMBER, PERCENTAGE, PERCENTAGE, NUMBER))
const hex3 = /^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/
const hex4 = /^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/
const hex6 = /^#([0-9a-fA-F]{6})$/
const hex8 = /^#([0-9a-fA-F]{8})$/

/*
https://github.com/react-community/normalize-css-color

BSD 3-Clause License

Copyright (c) 2016, React Community
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of the copyright holder nor the names of its
  contributors may be used to endorse or promote products derived from
  this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
function normalizeColor(color) {
  let match

  if (typeof color === 'number') {
    return color >>> 0 === color && color >= 0 && color <= 0xffffffff
      ? color
      : null
  } // Ordered based on occurrences on Facebook codebase

  if ((match = hex6.exec(color))) return parseInt(match[1] + 'ff', 16) >>> 0
  if (colors.hasOwnProperty(color)) return colors[color]

  if ((match = rgb.exec(color))) {
    return (
      ((parse255(match[1]) << 24) | // r
      (parse255(match[2]) << 16) | // g
      (parse255(match[3]) << 8) | // b
        0x000000ff) >>> // a
      0
    )
  }

  if ((match = rgba.exec(color))) {
    return (
      ((parse255(match[1]) << 24) | // r
      (parse255(match[2]) << 16) | // g
      (parse255(match[3]) << 8) | // b
        parse1(match[4])) >>> // a
      0
    )
  }

  if ((match = hex3.exec(color))) {
    return (
      parseInt(
        match[1] +
        match[1] + // r
        match[2] +
        match[2] + // g
        match[3] +
        match[3] + // b
          'ff', // a
        16
      ) >>> 0
    )
  } // https://drafts.csswg.org/css-color-4/#hex-notation

  if ((match = hex8.exec(color))) return parseInt(match[1], 16) >>> 0

  if ((match = hex4.exec(color))) {
    return (
      parseInt(
        match[1] +
        match[1] + // r
        match[2] +
        match[2] + // g
        match[3] +
        match[3] + // b
          match[4] +
          match[4], // a
        16
      ) >>> 0
    )
  }

  if ((match = hsl.exec(color))) {
    return (
      (hslToRgb(
        parse360(match[1]), // h
        parsePercentage(match[2]), // s
        parsePercentage(match[3]) // l
      ) |
        0x000000ff) >>> // a
      0
    )
  }

  if ((match = hsla.exec(color))) {
    return (
      (hslToRgb(
        parse360(match[1]), // h
        parsePercentage(match[2]), // s
        parsePercentage(match[3]) // l
      ) |
        parse1(match[4])) >>> // a
      0
    )
  }

  return null
}

function hue2rgb(p, q, t) {
  if (t < 0) t += 1
  if (t > 1) t -= 1
  if (t < 1 / 6) return p + (q - p) * 6 * t
  if (t < 1 / 2) return q
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
  return p
}

function hslToRgb(h, s, l) {
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  const r = hue2rgb(p, q, h + 1 / 3)
  const g = hue2rgb(p, q, h)
  const b = hue2rgb(p, q, h - 1 / 3)
  return (
    (Math.round(r * 255) << 24) |
    (Math.round(g * 255) << 16) |
    (Math.round(b * 255) << 8)
  )
}

function parse255(str) {
  const int = parseInt(str, 10)
  if (int < 0) return 0
  if (int > 255) return 255
  return int
}

function parse360(str) {
  const int = parseFloat(str)
  return (((int % 360) + 360) % 360) / 360
}

function parse1(str) {
  const num = parseFloat(str)
  if (num < 0) return 0
  if (num > 1) return 255
  return Math.round(num * 255)
}

function parsePercentage(str) {
  // parseFloat conveniently ignores the final %
  const int = parseFloat(str)
  if (int < 0) return 0
  if (int > 100) return 1
  return int / 100
}

function colorToRgba(input) {
  let int32Color = normalizeColor(input)
  if (int32Color === null) return input
  int32Color = int32Color || 0
  let r = (int32Color & 0xff000000) >>> 24
  let g = (int32Color & 0x00ff0000) >>> 16
  let b = (int32Color & 0x0000ff00) >>> 8
  let a = (int32Color & 0x000000ff) / 255
  return `rgba(${r}, ${g}, ${b}, ${a})`
} // Problem: https://github.com/animatedjs/animated/pull/102
// Solution: https://stackoverflow.com/questions/638565/parsing-scientific-notation-sensibly/658662

const stringShapeRegex = /[+\-]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)?/g // Covers rgb, rgba, hsl, hsla
// Taken from https://gist.github.com/olmokramer/82ccce673f86db7cda5e

const colorRegex = /(#(?:[0-9a-f]{2}){2,4}|(#[0-9a-f]{3})|(rgb|hsl)a?\((-?\d+%?[,\s]+){2,3}\s*[\d\.]+%?\))/gi // Covers color names (transparent, blue, etc.)

const colorNamesRegex = new RegExp(`(${Object.keys(colors).join('|')})`, 'g')
/**
 * Supports string shapes by extracting numbers so new values can be computed,
 * and recombines those values into new strings of the same shape.  Supports
 * things like:
 *
 *   rgba(123, 42, 99, 0.36)           // colors
 *   -45deg                            // values with units
 *   0 2px 2px 0px rgba(0, 0, 0, 0.12) // box shadows
 */

function createInterpolation(config) {
  // Replace colors with rgba
  const outputRange = config.output
    .map(rangeValue => rangeValue.replace(colorRegex, colorToRgba))
    .map(rangeValue => rangeValue.replace(colorNamesRegex, colorToRgba)) // ->
  // [
  //   [0, 50],
  //   [100, 150],
  //   [200, 250],
  //   [0, 0.5],
  // ]

  const outputRanges = outputRange[0].match(stringShapeRegex).map(() => [])
  outputRange.forEach(value => {
    value
      .match(stringShapeRegex)
      .forEach((number, i) => outputRanges[i].push(+number))
  })
  const interpolations = outputRange[0]
    .match(stringShapeRegex)
    .map((value, i) => {
      return Interpolation.create(
        _extends({}, config, {
          output: outputRanges[i],
        })
      )
    })
  return input => {
    let i = 0
    return (
      outputRange[0] // 'rgba(0, 100, 200, 0)'
        // ->
        // 'rgba(${interpolations[0](input)}, ${interpolations[1](input)}, ...'
        .replace(stringShapeRegex, () => interpolations[i++](input)) // rgba requires that the r,g,b are integers.... so we want to round them, but we *dont* want to
        // round the opacity (4th column).
        .replace(
          /rgba\(([0-9\.-]+), ([0-9\.-]+), ([0-9\.-]+), ([0-9\.-]+)\)/gi,
          (_, p1, p2, p3, p4) =>
            `rgba(${Math.round(p1)}, ${Math.round(p2)}, ${Math.round(
              p3
            )}, ${p4})`
        )
    )
  }
}

const config = {
  default: {
    tension: 170,
    friction: 26,
  },
  gentle: {
    tension: 120,
    friction: 14,
  },
  wobbly: {
    tension: 180,
    friction: 12,
  },
  stiff: {
    tension: 210,
    friction: 20,
  },
  slow: {
    tension: 280,
    friction: 60,
  },
  molasses: {
    tension: 280,
    friction: 120,
  },
}

class Spring extends React__default.Component {
  constructor(...args) {
    super(...args)
    this.state = {
      lastProps: {
        from: {},
        to: {},
      },
      propsChanged: false,
      internal: false,
    }
    this.controller = new Controller(null, null)
    this.didUpdate = false
    this.didInject = false
    this.finished = true

    this.start = () => {
      this.finished = false
      let wasMounted = this.mounted
      this.controller.start(
        props =>
          this.finish(
            _extends({}, props, {
              wasMounted,
            })
          ),
        this.update
      )
    }

    this.stop = () => this.controller.stop(true)

    this.update = () =>
      this.mounted &&
      this.setState({
        internal: true,
      })

    this.finish = ({ finished, noChange, wasMounted }) => {
      this.finished = true

      if (this.mounted && finished) {
        // Only call onRest if either we *were* mounted, or when there were changes
        if (this.props.onRest && (wasMounted || !noChange))
          this.props.onRest(this.controller.merged) // Restore end-state

        if (this.mounted && this.didInject) {
          this.afterInject = convertValues(this.props)
          this.setState({
            internal: true,
          })
        } // If we have an inject or values to apply after the animation we ping here

        if (this.mounted && (this.didInject || this.props.after))
          this.setState({
            internal: true,
          })
        this.didInject = false
      }
    }
  }

  componentDidMount() {
    // componentDidUpdate isn't called on mount, we call it here to start animating
    this.componentDidUpdate()
    this.mounted = true
  }

  componentWillUnmount() {
    // Stop all ongoing animtions
    this.mounted = false
    this.stop()
  }

  static getDerivedStateFromProps(props, { internal, lastProps }) {
    // The following is a test against props that could alter the animation
    const { from, to, reset, force } = props
    const propsChanged =
      !shallowEqual(to, lastProps.to) ||
      !shallowEqual(from, lastProps.from) ||
      (reset && !internal) ||
      (force && !internal)
    return {
      propsChanged,
      lastProps: props,
      internal: false,
    }
  }

  render() {
    const { children } = this.props
    const propsChanged = this.state.propsChanged // Inject phase -----------------------------------------------------------
    // Handle injected frames, for instance targets/web/fix-auto
    // An inject will return an intermediary React node which measures itself out
    // .. and returns a callback when the values sought after are ready, usually "auto".

    if (this.props.inject && propsChanged && !this.injectProps) {
      const frame = this.props.inject(this.props, injectProps => {
        // The inject frame has rendered, now let's update animations...
        this.injectProps = injectProps
        this.setState({
          internal: true,
        })
      }) // Render out injected frame

      if (frame) return frame
    } // Update phase -----------------------------------------------------------

    if (this.injectProps || propsChanged) {
      // We can potentially cause setState, but we're inside render, the flag prevents that
      this.didInject = false // Update animations, this turns from/to props into AnimatedValues
      // An update can occur on injected props, or when own-props have changed.

      if (this.injectProps) {
        this.controller.update(this.injectProps) // didInject is needed, because there will be a 3rd stage, where the original values
        // .. will be restored after the animation is finished. When someone animates towards
        // .. "auto", the end-result should be "auto", not "1999px", which would block nested
        // .. height/width changes.

        this.didInject = true
      } else if (propsChanged) this.controller.update(this.props) // Flag an update that occured, componentDidUpdate will start the animation later on

      this.didUpdate = true
      this.afterInject = undefined
      this.injectProps = undefined
    } // Render phase -----------------------------------------------------------
    // Render out raw values or AnimatedValues depending on "native"

    let values = _extends({}, this.controller.getValues(), this.afterInject)

    if (this.finished) values = _extends({}, values, this.props.after)
    return Object.keys(values).length ? children(values) : null
  }

  componentDidUpdate() {
    // The animation has to start *after* render, since at that point the scene
    // .. graph should be established, so we do it here. Unfortunatelly, non-native
    // .. animations as well as "auto"-injects call forceUpdate, so it's causing a loop.
    // .. didUpdate prevents that as it gets set only on prop changes.
    if (this.didUpdate) this.start()
    this.didUpdate = false
  }
}
Spring.defaultProps = {
  from: {},
  to: {},
  config: config.default,
  native: false,
  immediate: false,
  reset: false,
  force: false,
  inject: bugfixes,
}

class Trail extends React__default.PureComponent {
  constructor(...args) {
    super(...args)
    this.first = true
    this.instances = new Set()

    this.hook = (instance, index, length, reverse) => {
      // Add instance to set
      this.instances.add(instance) // Return undefined on the first index and from then on the previous instance

      if (reverse ? index === length - 1 : index === 0) return undefined
      else return Array.from(this.instances)[reverse ? index + 1 : index - 1]
    }
  }

  render() {
    const _this$props = this.props,
      { from = {}, initial, keys } = _this$props,
      props = _objectWithoutPropertiesLoose(_this$props, [
        'items',
        'children',
        'from',
        'initial',
        'reverse',
        'keys',
        'delay',
        'onRest',
      ])

    const array = toArray(items)
    return toArray(array).map((item, i) =>
      /*#__PURE__*/ React__default.createElement(
        Spring,
        _extends(
          {
            onRest: i === 0 ? onRest : null,
            key: typeof keys === 'function' ? keys(item) : toArray(keys)[i],
            from: this.first && initial !== void 0 ? initial || {} : from,
          },
          props,
          {
            delay: (i === 0 && delay) || undefined,
            attach: instance => this.hook(instance, i, array.length, reverse),
            children: (function(_children) {
              function children(_x) {
                return _children.apply(this, arguments)
              }

              children.toString = function() {
                return _children.toString()
              }

              return children
            })(props => {
              const child = children(item, i)
              return child ? child(props) : null
            }),
          }
        )
      )
    )
  }

  componentDidUpdate(prevProps) {
    this.first = false
    if (prevProps.items !== this.props.items) this.instances.clear()
  }
}
Trail.defaultProps = {
  keys: item => item,
}

const DEFAULT = '__default'

class KeyframesImpl extends React__default.PureComponent {
  constructor(...args) {
    super(...args)
    this.guid = 0
    this.state = {
      props: {},
      resolve: () => null,
      last: true,
      index: 0,
    }

    this.next = (props, last = true, index = 0) => {
      this.running = true
      return new Promise(resolve => {
        this.mounted &&
          this.setState(
            state => ({
              props,
              resolve,
              last,
              index,
            }),
            () => (this.running = false)
          )
      })
    }
  }

  componentDidMount() {
    this.mounted = true
    this.componentDidUpdate({})
  }

  componentWillUnmount() {
    this.mounted = false
  }

  componentDidUpdate(previous) {
    const { states, filter: f, state } = this.props

    if (
      previous.state !== this.props.state ||
      (this.props.reset && !this.running) ||
      !shallowEqual(states[state], previous.states[previous.state])
    ) {
      if (states && state && states[state]) {
        const localId = ++this.guid
        const slots = states[state]

        if (slots) {
          if (Array.isArray(slots)) {
            let q = Promise.resolve()

            for (let i = 0; i < slots.length; i++) {
              let index = i
              let slot = slots[index]
              let last = index === slots.length - 1
              q = q.then(
                () => localId === this.guid && this.next(f(slot), last, index)
              )
            }
          } else if (typeof slots === 'function') {
            let index = 0
            slots(
              // next
              (props, last = false) =>
                localId === this.guid && this.next(f(props), last, index++), // cancel
              () => requestFrame(() => this.instance && this.instance.stop()), // ownprops
              this.props
            )
          } else {
            this.next(f(states[state]))
          }
        }
      }
    }
  }

  render() {
    const { props, resolve, last, index } = this.state
    if (!props || Object.keys(props).length === 0) return null

    let _this$props = this.props,
      { config, onRest: _onRest } = _this$props,
      rest = _objectWithoutPropertiesLoose(_this$props, [
        'state',
        'filter',
        'states',
        'config',
        'primitive',
        'onRest',
        'forwardRef',
      ]) // Arrayed configs need an index to process

    if (Array.isArray(config)) config = config[index]
    return /*#__PURE__*/ React__default.createElement(
      Component,
      _extends(
        {
          ref: _ref => (this.instance = handleRef(_ref, forwardRef)),
          config: config,
        },
        rest,
        props,
        {
          onRest: args => {
            resolve(args)
            if (_onRest && last) _onRest(args)
          },
        }
      )
    )
  }
}

KeyframesImpl.defaultProps = {
  state: DEFAULT,
}
const Keyframes = React__default.forwardRef((props, ref) =>
  /*#__PURE__*/ React__default.createElement(
    KeyframesImpl,
    _extends({}, props, {
      forwardRef: ref,
    })
  )
)

Keyframes.create = primitive => (states, filter = states => states) => {
  if (typeof states === 'function' || Array.isArray(states))
    states = {
      [DEFAULT]: states,
    }
  return props =>
    /*#__PURE__*/ React__default.createElement(
      KeyframesImpl,
      _extends(
        {
          primitive: primitive,
          states: states,
          filter: filter,
        },
        props
      )
    )
}

Keyframes.Spring = states => Keyframes.create(Spring)(states, interpolateTo)

Keyframes.Trail = states => Keyframes.create(Trail)(states, interpolateTo)

let guid = 0

let get = props => {
  let { items, keys } = props,
    rest = _objectWithoutPropertiesLoose(props, ['items', 'keys'])

  items = toArray(items !== void 0 ? items : null)
  keys = typeof keys === 'function' ? items.map(keys) : toArray(keys) // Make sure numeric keys are interpreted as Strings (5 !== "5")

  return _extends(
    {
      items,
      keys: keys.map(key => String(key)),
    },
    rest
  )
}

class Transition extends React__default.PureComponent {
  componentDidMount() {
    this.mounted = true
  }

  componentWillUnmount() {
    this.mounted = false
  }

  constructor(prevProps) {
    super(prevProps)

    this.destroyItem = (item, key, state) => values => {
      const { onRest, onDestroyed } = this.props

      if (this.mounted) {
        onDestroyed && onDestroyed(item)
        this.setState(({ deleted }) => ({
          deleted: deleted.filter(t => t.key !== key),
        }))
        onRest && onRest(item, state, values)
      }
    }

    this.state = {
      first: true,
      transitions: [],
      current: {},
      deleted: [],
      prevProps,
    }
  }

  static getDerivedStateFromProps(props, _ref) {
    let { first } = _ref,
      state = _objectWithoutPropertiesLoose(_ref, ['first', 'prevProps'])

    let {
      items,
      keys,
      initial,
      from,
      enter,
      leave,
      update,
      trail = 0,
      unique,
      config,
    } = get(props)
    let { keys: _keys, items: _items } = get(prevProps)

    let current = _extends({}, state.current)

    let deleted = [...state.deleted] // Compare next keys with current keys

    let currentKeys = Object.keys(current)
    let currentSet = new Set(currentKeys)
    let nextSet = new Set(keys)
    let added = keys.filter(item => !currentSet.has(item))
    let removed = state.transitions
      .filter(item => !item.destroyed && !nextSet.has(item.originalKey))
      .map(i => i.originalKey)
    let updated = keys.filter(item => currentSet.has(item))
    let delay = 0
    added.forEach(key => {
      // In unique mode, remove fading out transitions if their key comes in again
      if (unique && deleted.find(d => d.originalKey === key))
        deleted = deleted.filter(t => t.originalKey !== key)
      const keyIndex = keys.indexOf(key)
      const item = items[keyIndex]
      const state = 'enter'
      current[key] = {
        state,
        originalKey: key,
        key: unique ? String(key) : guid++,
        item,
        trail: (delay = delay + trail),
        config: callProp(config, item, state),
        from: callProp(
          first ? (initial !== void 0 ? initial || {} : from) : from,
          item
        ),
        to: callProp(enter, item),
      }
    })
    removed.forEach(key => {
      const keyIndex = _keys.indexOf(key)

      const item = _items[keyIndex]
      const state = 'leave'
      deleted.push(
        _extends({}, current[key], {
          state,
          destroyed: true,
          left: _keys[Math.max(0, keyIndex - 1)],
          right: _keys[Math.min(_keys.length, keyIndex + 1)],
          trail: (delay = delay + trail),
          config: callProp(config, item, state),
          to: callProp(leave, item),
        })
      )
      delete current[key]
    })
    updated.forEach(key => {
      const keyIndex = keys.indexOf(key)
      const item = items[keyIndex]
      const state = 'update'
      current[key] = _extends({}, current[key], {
        item,
        state,
        trail: (delay = delay + trail),
        config: callProp(config, item, state),
        to: callProp(update, item),
      })
    }) // This tries to restore order for deleted items by finding their last known siblings

    let out = keys.map(key => current[key])
    deleted.forEach(_ref2 => {
      let { left, right } = _ref2,
        transition = _objectWithoutPropertiesLoose(_ref2, ['left', 'right'])

      let pos // Was it the element on the left, if yes, move there ...

      if ((pos = out.findIndex(t => t.originalKey === left)) !== -1) pos += 1 // Or how about the element on the right ...

      if (pos === -1) pos = out.findIndex(t => t.originalKey === right) // Maybe we'll find it in the list of deleted items

      if (pos === -1) pos = deleted.findIndex(t => t.originalKey === left) // Checking right side as well

      if (pos === -1) pos = deleted.findIndex(t => t.originalKey === right) // And if nothing else helps, move it to the start ¯\_(ツ)_/¯

      pos = Math.max(0, pos)
      out = [...out.slice(0, pos), transition, ...out.slice(pos)]
    })
    return {
      first: first && added.length === 0,
      transitions: out,
      current,
      deleted,
      prevProps: props,
    }
  }

  render() {
    const _this$props = this.props,
      {
        from = {},
        enter = {},
        leave = {},
        update = {},
        onFrame,
        onRest,
        onStart,
      } = _this$props,
      extra = _objectWithoutPropertiesLoose(_this$props, [
        'initial',
        'from',
        'enter',
        'leave',
        'update',
        'onDestroyed',
        'keys',
        'items',
        'onFrame',
        'onRest',
        'onStart',
        'trail',
        'config',
        'children',
        'unique',
        'reset',
      ])

    return this.state.transitions.map(
      ({ state, key, item, from, to, trail, config, destroyed }, i) =>
        /*#__PURE__*/ React__default.createElement(
          Keyframes,
          _extends(
            {
              reset: reset && state === 'enter',
              primitive: Spring,
              state: state,
              filter: interpolateTo,
              states: {
                [state]: to,
              },
              key: key,
              onRest: destroyed
                ? this.destroyItem(item, key, state)
                : onRest && (values => onRest(item, state, values)),
              onStart: onStart && (() => onStart(item, state)),
              onFrame: onFrame && (values => onFrame(item, state, values)),
              delay: trail,
              config: config,
            },
            extra,
            {
              from: from,
              children: (function(_children) {
                function children(_x) {
                  return _children.apply(this, arguments)
                }

                children.toString = function() {
                  return _children.toString()
                }

                return children
              })(props => {
                const child = children(item, state, i)
                return child ? child(props) : null
              }),
            }
          )
        )
    )
  }
}
Transition.defaultProps = {
  keys: item => item,
  unique: false,
  reset: false,
}

injectDefaultElement('Group')
injectInterpolation(createInterpolation)
injectColorNames(colors)
injectApplyAnimatedValues(
  (instance, props) => {
    if (instance.nodeType) {
      instance._applyProps(instance, props)
    } else return false
  },
  style => style
)
const konvaElements = [
  'Layer',
  'FastLayer',
  'Group',
  'Label',
  'Rect',
  'Circle',
  'Ellipse',
  'Wedge',
  'Line',
  'Sprite',
  'Image',
  'Text',
  'TextPath',
  'Star',
  'Ring',
  'Arc',
  'Tag',
  'Path',
  'RegularPolygon',
  'Arrow',
  'Shape',
  'Transformer',
]
Object.assign(
  createAnimatedComponent,
  konvaElements.reduce(
    (acc, element) =>
      _extends({}, acc, {
        [element]: createAnimatedComponent(element),
      }),
    {}
  )
)

exports.Spring = Spring
exports.Keyframes = Keyframes
exports.Transition = Transition
exports.Trail = Trail
exports.Controller = Controller
exports.config = config
exports.animated = createAnimatedComponent
exports.interpolate = interpolate$1
exports.Globals = Globals
