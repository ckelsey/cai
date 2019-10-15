import { Component, Vue, Prop } from 'vue-property-decorator'
import user from '@/services/user'
import ModalContent from '../modal-content'

@Component({
    components: {
        'modal-content': ModalContent
    }
})
export default class PhoneForm extends Vue {
    @Prop()
    public model: any

    public user = user

    public imageErrorMessage = ``

    public get imageInput() {
        return this.$refs.imageInput as HTMLInputElement
    }

    public get verifyModal() {
        return this.$refs.verifyModal as any
    }

    public get verifyNumber() {
        return this.$refs.verifyNumber as HTMLInputElement
    }

    public phoneNumErrorMessage = ``

    public get phoneNum() {
        return this.$refs.phoneNum as HTMLInputElement
    }

    public typeErrorMessage = ``

    public get type() {
        return this.$refs.type as HTMLInputElement
    }

    public carrierErrorMessage = ``

    public get carrier() {
        return this.$refs.carrier as HTMLInputElement
    }

    public startDateErrorMessage = ``

    public get startDate() {
        return this.$refs.startDate as HTMLInputElement
    }

    public endDateErrorMessage = ``

    public get endDate() {
        return this.$refs.endDate as HTMLInputElement
    }

    public get verified() {
        if (!this.model.confirmed && this.model.type !== `mobile`) {
            return false
        }

        if (this.model.type === `mobile`) {
            if (!this.model.SMSVerification.verified) {
                return false
            }
        }

        return true
    }

    public toggleCheckbox(ref: string) {
        (this.$refs[ref] as any).click()
    }

    public validate() {
        let valid = true

        Object.keys(this.model).forEach((key: any) => {
            switch (key) {
                case `phoneNum`:
                    if (this.model.phoneNum === `` || !this.model.phoneNum) {
                        this.phoneNumErrorMessage = `this field is required`
                        valid = false
                    } else {
                        const numberREGEX = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im
                        const digits = this.model.phoneNum.replace(/\D/g, '')
                        const length = digits.length
                        const isValid = numberREGEX.test(digits) && length >= 11

                        if (isValid) {
                            this.phoneNumErrorMessage = ``
                        } else {
                            valid = false
                            this.phoneNumErrorMessage = `not a valid number`
                        }
                    }
                    break

                case `type`:
                    if (this.model.type === `` || !this.model.type) {
                        this.typeErrorMessage = `this field is required`
                        valid = false
                    } else {
                        if ([`mobile`, `landline`].indexOf(this.model.type) === -1) {
                            valid = false
                            this.typeErrorMessage = `this field is required`
                        } else {
                            this.typeErrorMessage = ``
                        }
                    }
                    break

                case `carrier`:
                    if (this.model.carrier === `` || !this.model.carrier) {
                        this.carrierErrorMessage = `this field is required`
                        valid = false
                    } else {
                        this.carrierErrorMessage = ``
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
                    if (this.model.endDate !== `` && this.model.startDate) {
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

        if (this.model.type !== `mobile`) {
            const verifyImageFile = this.imageInput.files ? Array.from(this.imageInput.files)[0] : null

            if (!verifyImageFile) {
                valid = false
                this.imageErrorMessage = `this field is required`
            } else {
                this.imageErrorMessage = ``
                this.model.file = verifyImageFile
            }

            /** TODO VALIDATE pleease */
        }

        return valid
    }

    public savePhone(e: Event) {
        if (e) {
            e.preventDefault()
        }

        const isValid = this.validate()

        if (!isValid) { return }

        return this.user.savePhone(this.model)
            .catch((err) => {
                console.log(err)
            })
    }

    public verifySMS(e: Event) {
        if (e) {
            e.preventDefault()
        }

        const val = this.verifyNumber.value

        if (val) {
            this.user.verifySMS(this.model, val)
                .then(() => {
                    this.verifyModal.close()
                })
        }
    }

    public verifyPhone(e: Event) {
        if (e) {
            e.preventDefault()
        }

        this.verifyModal.show()

        this.user.verifyPhone(this.model)
            .then(() => {
                this.verifyModal.show()
            })
    }

    public deletePhone(e: Event) {
        if (e) {
            e.preventDefault()
        }
        return this.user.deletePhone(this.model)
    }

    /** TODO get carriers and phone types */
}
