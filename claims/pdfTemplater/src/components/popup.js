import { subscribes } from "../utils/subscribes";

export const popup = (selector, trigger) => {
    let triggerElement

    const el = document.body.querySelector(selector)
    const cancelBtn = el.querySelector('.cancelBtn')
    const goBtn = el.querySelector('.goBtn')

    const result = {
        open: () => {
            el.classList.add('active')
            result.trigger(`open`)
        },
        close: () => {
            el.classList.remove('active')
            result.trigger(`close`)
        },

        get isOpen() {
            return el.classList.contains(`active`)
        },
        ...subscribes({})
    }

    if (cancelBtn) {
        cancelBtn.addEventListener(`click`, result.close)
    }

    if (goBtn) {
        goBtn.addEventListener(`click`, result.close)
    }

    if (trigger) { triggerElement = document.body.querySelector(trigger) }
    if (triggerElement) {
        triggerElement.addEventListener(`click`, result.open)
    }

    return result
}