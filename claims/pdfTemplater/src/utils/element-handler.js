import ObserveEvent from './observe/event'

const ElementHandler = (elements, state) => {
    const result = {
        element(key) {
            return result[key].element
        },
        subscribe(key) {
            return result[key].subscribe
        },
        reset() {
            Object.keys(result).forEach(item => {
                if (typeof item !== `function` && item.subscribe && typeof item.subscribe === `function`) {
                    item.subscribe.complete()
                }
            })
        }
    }

    elements.forEach(elementData => {
        const element = document.getElementById(elementData.id)
        const observer = !!elementData.event ? ObserveEvent(element, elementData.event) : undefined
        result[elementData.id] = {
            element,
            subscribe: !!elementData.event ? fn => state.subscribeTo(fn, observer.subscribe, elementData.id) : undefined
        }
    })

    return result
}

export default ElementHandler