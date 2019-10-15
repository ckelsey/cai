import { subscribes } from "../utils/subscribes"

export const ErrorHandler = selector => {
    const el = document.body.querySelector(selector)
    const errorMsgText = el.querySelector('#errorMsgText')
    const goBtn = el.querySelector('.goBtn')
    const result = {
        open: (err) => {
            errorMsgText.textContent = err
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

    if (goBtn) {
        goBtn.addEventListener(`click`, result.close)
    }

    return result
}