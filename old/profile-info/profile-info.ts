import { Component, Vue } from 'vue-property-decorator'
import user from '@/services/user'
import state from '@/services/state'
import Subject from '@/utils/subject'

interface FormItem {
    key: string
    type: string
    value?: any
    values: any[]
}

const messages = [
    `You have a first name right?`,
    `Cool. Last name?`,
    `Lastly, what email can we reach you at?`
]

@Component({
    components: {}
})

export default class ProfileInfo extends Vue {
    public user = user
    public state = state
    public activeClarence = false

    public Inputs = new Subject([])

    public formData: any = [
        [{
            key: `fname`,
            type: `text`,
            label: `First name`
        }, {
            key: `lname`,
            type: `text`,
            label: `Last name`
        }], [{
            key: `email`,
            type: `email`,
            label: `Email`
        }], [{
            key: `password`,
            type: `password`,
            label: `Password`
        }, {
            key: `confirmPassword`,
            type: `password`,
            label: `Confirm password`
        }]
    ]

    public getValues() {
        const results: any = {}

        this.formData.forEach((group: FormItem[]) => {
            group.forEach((item: FormItem) => {
                results[item.key] = item.value
            })
        })

        return results
    }

    public createForm() {
        const User = Object.assign({}, this.user.model)

        this.formData = this.formData.map((group: FormItem[]) => {
            return group.map((item: FormItem) => {
                item.value = User[item.key]
                return item
            })
        })
    }

    public goToDashboard(e?: Event) {
        if (e) {
            e.preventDefault()
        }

        this.state.profile = ``
    }

    public submitInfo(e: Event) {
        e.preventDefault()

        const data: any = this.getValues()
        /** TODO - all fields are required */

        if (data.email !== this.user.model.email) {
            this.state.alert = Object.assign(this.state.alert, {
                msg: `You will need to check your email and confirm the address before you can log in with it`,
                active: true,
                status: `alert-warning`
            })
        }

        if (data.password && data.password !== ``) {
            const passwordError = this.$refs.password as HTMLElement
            const passwordConfirmError = this.$refs.confirmPassword as HTMLElement

            if (data.password !== data.confirmPassword) {
                passwordConfirmError.textContent = passwordError.textContent = `passwords do not match`
                return
            } else {
                passwordConfirmError.textContent = passwordError.textContent = ``
            }
        }

        this.user.update(data)
            .then(() => {
                this.goToDashboard()
            })
            .catch((err) => {
                this.state.alert = Object.assign(this.state.alert, {
                    msg: `There was an error during save. ${err}`,
                    active: true,
                    status: `alert-error`
                })
            })

    }

    public mounted() {
        this.createForm()

        state.profileObserver$.subscribe(val => {
            if (val === `info`) {
                this.createForm()

                const inputs = Array
                    .from(this.$el.querySelectorAll(`input`))
                    .map((input: any, index: number) => {
                        input[`help`] = messages[index]
                        input[`helpEvent`] = `focus`
                        return input
                    })

                this.Inputs.next(inputs)

                requestAnimationFrame(() => {
                    this.activeClarence = true
                })
            }
        })
    }
}
