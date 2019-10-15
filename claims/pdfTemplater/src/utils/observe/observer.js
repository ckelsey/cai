class Observer {
    handler
    isUnsubscribed
    id

    constructor(handler) {
        this.handler = handler
        this.next = this.next.bind(this)
        this.error = this.error.bind(this)
        this.complete = this.complete.bind(this)
        this.unsubscribe = this.unsubscribe.bind(this)
        this.isUnsubscribed = false
    }

    next(value) {
        if (this.handler.next && !this.isUnsubscribed) {
            this.handler.next(value)
        }
    }

    error(error) {
        if (!this.isUnsubscribed) {
            if (this.handler.error) {
                this.handler.error(error)
            }

            this.unsubscribe()
        }
    }

    complete() {
        if (!this.isUnsubscribed) {
            if (this.handler.complete) {
                this.handler.complete()
            }

            this.unsubscribe()
        }
    }

    unsubscribe() {
        this.isUnsubscribed = true
    }
}

export default Observer