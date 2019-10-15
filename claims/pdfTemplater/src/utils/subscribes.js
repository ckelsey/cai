export const subscribes = subscribes => ({
    subscribe: (evt, fn) => {
        if (!subscribes[evt]) { subscribes[evt] = [] }
        subscribes[evt].push(fn)
    },
    trigger: (evt, data) => {
        if (!subscribes[evt]) { return }
        subscribes[evt].forEach(fn => fn(data))
    },
})