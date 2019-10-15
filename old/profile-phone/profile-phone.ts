import { Component, Vue } from 'vue-property-decorator'
import user from '@/services/user'
import PhoneForm from '../phone-form'

@Component({
    components: {
        'phone-form': PhoneForm
    }
})
export default class ProfilePhone extends Vue {
    public user = user
    public newPhone = Object.assign({}, this.user.defaultPhone)
    public proxyPhones = Object.assign({}, this.user.phoneNumbers)
    public get Phones() {
        return this.proxyPhones
    }

    public mounted() {
        this.user.phoneNumbers$.subscribe((val) => {
            this.proxyPhones = Object.assign({}, val)
            this.newPhone = Object.assign({}, this.user.defaultPhone)
        })
    }
}
