export const clearInput = (input) => () => {
    if (typeof input === `string`) {
        input = document.body.querySelector(input)
    }

    input.value = ``
    input.removeAttribute(`value`)

    const options = Array.from(input.querySelectorAll(`option`))

    if (options.length) {
        options.forEach(o => o.removeAttribute(`selected`))
    }
}