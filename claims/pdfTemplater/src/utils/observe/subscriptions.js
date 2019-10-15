import Observer from './observer'

class Subscription {
    subscriptions = {}

    constructor() {}

    _subscribe(next, error, complete) {

        const observer = new Observer(typeof next === `function` ? { next, error, complete } : next)
        const id = `${new Date().getTime()}_${Object.keys(this.subscriptions).length}_${Math.round(Math.random() * 10000)}`

        observer.id = id

        this.subscriptions[id] = observer

        return this._unsubscribe(observer)
    }

    _unsubscribe(observer) {
        return () => {
            // if (Object.keys(this.subscriptions) === 1) { this.complete() }
            observer.unsubscribe()
            this.subscriptions[observer.id] = null
            delete this.subscriptions[observer.id]
            return this.subscriptions
        }
    }
}

export default Subscription