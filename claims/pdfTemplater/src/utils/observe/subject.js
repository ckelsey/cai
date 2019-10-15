import Subscription from './subscriptions'

const loop = (subscriptions, key, value, previous) => {
    Object.keys(subscriptions)
        .forEach((id) => {
            const obj = subscriptions[id]
            const fn = obj[key]
            fn(value, previous)
        })
}

class Subject extends Subscription {
    noInit = undefined
    state = undefined
    previousState = undefined

    constructor(state, noInit) {
        super()
        this.subscribe = this.subscribe.bind(this)
        this.noInit = noInit
        this.state = state
    }

    get value() {
        return this.state
    }

    get previous() {
        return this.previousState
    }

    next(value) {
        if (typeof this.state === `function`) {
            return loop(this.subscriptions, `next`, this.state)
        }

        if (typeof value === `function`) {
            value = value(this.state)
        }

        this.previousState = this.state
        this.state = value

        loop(this.subscriptions, `next`, this.state, this.previousState)
    }

    error(error) {
        loop(this.subscriptions, `error`, error)
    }

    complete() {
        loop(this.subscriptions, `complete`, undefined)
    }

    subscribe(next, error, complete) {
        if (!this.noInit && this.value !== undefined) {
            next(this.value)
        }

        return super._subscribe(next, error, complete)
    }
}

export default Subject