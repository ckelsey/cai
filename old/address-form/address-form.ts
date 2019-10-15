import { Component, Vue, Prop } from 'vue-property-decorator'
import user from '@/services/user'
import ModalContent from '../modal-content'

@Component({
    components: {
        'modal-content': ModalContent
    }
})
export default class AddressForm extends Vue {
    @Prop()
    public model: any

    public user = user

    public States = { CA: `California` }

    public imageErrorMessage = ``
    public get imageInput() {
        return this.$refs.imageInput as HTMLInputElement
    }

    public startDateErrorMessage = ``

    public get startDate() {
        return this.$refs.startDate as HTMLInputElement
    }

    public endDateErrorMessage = ``

    public get endDate() {
        return this.$refs.endDate as HTMLInputElement
    }

    public streetErrorMessage = ``

    public get streetInput() {
        return this.$refs.streetInput as HTMLInputElement
    }

    public cityErrorMessage = ``

    public get cityInput() {
        return this.$refs.cityInput as HTMLInputElement
    }

    public stateErrorMessage = ``

    public get stateInput() {
        return this.$refs.stateInput as HTMLInputElement
    }

    public countryErrorMessage = ``

    public get countryInput() {
        return this.$refs.countryInput as HTMLInputElement
    }

    public countyErrorMessage = ``

    public get countyInput() {
        return this.$refs.countyInput as HTMLInputElement
    }

    public zipErrorMessage = ``

    public get zipInput() {
        return this.$refs.zipInput as HTMLInputElement
    }

    public get verified() {

        return this.model.confirmed
    }

    public toggleCheckbox(ref: string) {
        (this.$refs[ref] as any).click()
    }

    public validate() {
        let valid = true

        Object.keys(this.model).forEach((key: any) => {
            switch (key) {
                case `street`:
                    if (this.model.street === `` || !this.model.street) {
                        this.streetErrorMessage = `this field is required`
                        valid = false
                    } else {
                        this.streetErrorMessage = ``
                    }
                    break

                case `city`:
                    if (this.model.city === `` || !this.model.city) {
                        this.cityErrorMessage = `this field is required`
                        valid = false
                    } else {
                        this.cityErrorMessage = ``
                    }
                    break

                case `state`:
                    if (this.model.state === `` || !this.model.state) {
                        this.stateErrorMessage = `this field is required`
                        valid = false
                    } else {
                        this.stateErrorMessage = ``
                    }
                    break

                case `zip`:
                    if (this.model.zip === `` || !this.model.zip) {
                        this.zipErrorMessage = `this field is required`
                        valid = false
                    } else {
                        this.zipErrorMessage = ``
                    }
                    break

                case `county`:
                    if (this.model.county === `` || !this.model.county) {
                        this.countyErrorMessage = `this field is required`
                        valid = false
                    } else {
                        this.countyErrorMessage = ``
                    }
                    break

                case `country`:
                    if (this.model.country === `` || !this.model.country) {
                        this.countryErrorMessage = `this field is required`
                        valid = false
                    } else {
                        this.countryErrorMessage = ``
                    }
                    break

                case `startDate`:
                    if (this.model.startDate === `` || !this.model.startDate) {
                        this.startDateErrorMessage = `this field is required`
                        valid = false
                    } else {
                        if (isNaN(Date.parse(this.model.startDate.toString()))) {
                            this.startDateErrorMessage = `invalid date`
                            valid = false
                        } else {
                            this.startDateErrorMessage = ``
                        }
                    }
                    break

                case `endDate`:
                    if (this.model.endDate !== `` && this.model.endDate) {
                        if (isNaN(Date.parse(this.model.endDate.toString()))) {
                            this.endDateErrorMessage = `invalid date`
                            valid = false
                        } else {
                            this.endDateErrorMessage = ``
                        }
                    } else {
                        this.endDateErrorMessage = ``
                    }
                    break
            }
        })

        const verifyImageFile = this.imageInput.files ? Array.from(this.imageInput.files)[0] : null

        if (!verifyImageFile) {
            valid = false
            this.imageErrorMessage = `this field is required`
        } else {
            this.imageErrorMessage = ``
            this.model.file = verifyImageFile
        }

        return valid
    }

    public saveAddress(e: Event) {
        if (e) {
            e.preventDefault()
        }

        const isValid = this.validate()

        if (!isValid) { return }

        const data = Object.assign({}, this.model, {
            address: `${this.model.street}, ${this.model.city} ${this.model.state} ${this.model.zip}, ${this.model.country}`
        })

        return this.user.saveAddress(data)
            .catch((err) => {
                console.log(err)
            })
    }

    public deleteAddress(e: Event) {
        if (e) {
            e.preventDefault()
        }
        return this.user.deleteAddress(this.model)
    }
}
