import Subscription from './subscriptions'

class Observable extends Subscription {
    static fromEvent(element, eventName, preventDefault = false, stopPropagation = false) {
        return new Observable((observer) => {

            const handler = (event) => {

                if (preventDefault) {
                    event.preventDefault()
                }

                if (stopPropagation) {
                    event.stopPropagation()
                }

                observer.next(event)
            }

            element.addEventListener(eventName, handler, false)

            return () => {
                element.removeEventListener(eventName, handler, false)
            }
        })
    }

    isSharing = false
    fn

    constructor(fn) {
        super()
        this.fn = fn
    }

    subscribe(next, error, complete) {
        const subscriptionCount = Object.keys(this.subscriptions).length
        const shouldRunFunction = typeof this.fn === `function` && (!this.isSharing || (this.isSharing && !subscriptionCount))

        const loop = (key, value) => {
            return Object.keys(this.subscriptions)
                .forEach(
                    (subscriptionKey) => this.subscriptions[subscriptionKey][key](value)
                )
        }

        const unsubscribe = super._subscribe(next, error, complete)

        if (shouldRunFunction) {
            this.fn({
                next: (value) => loop(`next`, value),
                error: (e) => loop(`error`, e),
                complete: () => loop(`complete`)
            })
        }

        return unsubscribe
    }

    share() {
        this.isSharing = true
        return this
    }

    fromEvent(element, eventName, preventDefault = false, stopPropagation = false) {
        return this.fromEvent(element, eventName, preventDefault, stopPropagation)
    }
}

export default Observable