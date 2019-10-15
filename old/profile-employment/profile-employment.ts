import { Component, Vue } from 'vue-property-decorator'
import user from '@/services/user'
import FormElement from '../form-element/form-element'

@Component({
    components: {
        'form-element': FormElement
    }
})
export default class ProfileEmployment extends Vue {
    public user = user

    public newEmployment = Object.assign({}, this.user.defaultEmployment)

    public proxy = []

    public get Employment() {
        return this.proxy
    }

    public formData(data: any) {
        const result: any = [
            [{
                key: `company`,
                label: `Company`,
                type: `text`,
                value: data.company,
                validation: (val: string) => val && val !== ``,
                required: true,
                error: ``
            }], [{
                key: `startDate`,
                label: `Start date`,
                type: `date`,
                value: data.startDate,
                validation: (val: string) => val && val !== `` && !isNaN(Date.parse(val.toString())),
                required: true,
                error: ``
            }, {
                key: `endDate`,
                label: `End date`,
                type: `date`,
                value: data.endDate,
                validation: (val: string) => {
                    if (val) {
                        return !isNaN(Date.parse(val.toString()))
                    } else {
                        return true
                    }
                },
                required: false,
                error: ``
            }, {
                key: `current`,
                label: `Current`,
                type: `checkbox`,
                value: data.current,
                validation: () => true,
                required: false,
                error: ``
            }], [{
                key: `file`,
                label: `Paystub`,
                type: `file`,
                validation: (val: any) => !!val,
                required: true,
                error: ``
            }]
        ]

        return result
    }

    public mounted() {
        this.user.employment$.subscribe((val) => {
            this.proxy = [].concat(val)
            this.newEmployment = Object.assign({}, this.user.defaultEmployment)
        })
    }
}
