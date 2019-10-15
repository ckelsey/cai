const ObserveEvent = (element, eventName, options) => {
    options = Object.assign({}, {
        preventDefault: false,
        stopPropagation: false,
        useCapture: false
    }, options)

    if (!element || !eventName) { return }

    const subscriptions = {}

    const loop = (method, data) => {
        Object.keys(subscriptions)
            .forEach(
                key => subscriptions[key][method](data)
            )
    }

    const eventHandler = (event) => {
        if (Object.keys(subscriptions).length === 0) { return shutDown() }
        if (options.preventDefault) { event.preventDefault() }
        if (options.stopPropagation) { event.stopPropagation() }

        previous = value
        value = event

        loop(`next`, event)
    }

    const startUp = () => {
        element.removeEventListener(eventName, eventHandler, options.useCapture)
        element.addEventListener(eventName, eventHandler, options.useCapture)
    }

    const shutDown = () => {
        element.removeEventListener(eventName, eventHandler, options.useCapture)
    }

    const unSubscribe = subscriberId => () => {
        subscriptions[subscriberId] = null
        delete subscriptions[subscriberId]

        if (Object.keys(subscriptions).length === 0) {
            shutDown()
        }
    }

    let value
    let previous

    const methods = {
        get value() { return value },
        get previous() { return previous },

        dispose() {
            shutDown()
            Object.keys(subscriptions).forEach(key => {
                subscriptions[key].complete()
                unSubscribe(key)
            })

        },

        subscribe(next, error, complete) {
            if (typeof next !== `function` && typeof error !== `function` && typeof complete !== `function`) { return }

            const subscriber = Object.assign({}, {
                next: () => {},
                complete: () => {}
            }, {
                next,
                complete
            }, {
                id: `${new Date().getTime()}_${Object.keys(subscriptions).length}_${Math.round(Math.random() * 10000)}`
            })

            subscriptions[subscriber.id] = subscriber

            startUp()

            return unSubscribe(subscriber.id)
        }
    }

    return methods
}

export default ObserveEvent