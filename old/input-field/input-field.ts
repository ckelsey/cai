import { Component, Vue, Prop, Emit } from 'vue-property-decorator'
import Validate from '@/services/validate';
import Inputs from '@/services/inputs';
import { ValidateResponse } from '@/types';

const setEmpty = (input: HTMLInputElement) => {
    const notEmpty = Inputs.empty(input)
    const hasNotEmptyClass = input.classList.contains(`not-empty`)

    if (notEmpty && !hasNotEmptyClass) {
        input.classList.add(`not-empty`)
    }

    if (!notEmpty && hasNotEmptyClass) {
        input.classList.remove(`not-empty`)
    }
}

const setFocus = (input: HTMLInputElement) => {
    const focused = Inputs.focused(input)
    const hasFocusedClass = input.classList.contains(`focused`)

    if (focused && !hasFocusedClass) {
        input.classList.add(`focused`)
    }

    if (!focused && hasFocusedClass) {
        input.classList.remove(`focused`)
    }
}

@Component({
    components: {}
})
export default class InputField extends Vue {
    @Prop()
    public type: string | undefined

    @Prop()
    public model: any | undefined

    @Prop()
    public name: any | undefined

    @Prop()
    public id: any | undefined

    @Prop()
    public autocomplete: any

    public validation: ValidateResponse | undefined

    public get Type() {
        return this.type || `text`
    }

    public get el() {
        return this.$el as HTMLInputElement
    }

    public Proxy: any

    public get proxy() {
        if (this.Proxy !== this.model) {
            this.Proxy = this.model
            requestAnimationFrame(() => {
                this.check()
            })
        }

        return this.Proxy
    }

    public set proxy(val) {
        this.Proxy = val
    }

    public validate() {
        let method: any = Validate.text
        const input = this.el

        switch (this.Type) {
            case `email`:
                method = Validate.email
                break

            case `number`:
                method = Validate.number
                break

            case `checkbox`:
                method = Validate.bool
                break
        }

        return method(Inputs.value(input), input)
    }

    public check() {
        setEmpty(this.el)
        setFocus(this.el)
    }

    public mounted() {
        [`input`, `click`, `focus`, `blur`].forEach((ev) => {
            this.el.addEventListener(ev, () => {
                this.check()
                this.$emit('changestate', Inputs.value(this.el));
            })
        })

        setEmpty(this.el)
        setFocus(this.el)
    }
}
