import { Component, Vue } from 'vue-property-decorator'
import user from '@/services/user'
import AddressForm from '../address-form/address-form'

@Component({
    components: {
        'address-form': AddressForm
    }
})
export default class ProfileAddress extends Vue {
    public user = user
    public newAddress = Object.assign({}, this.user.defaultAddress)
    public proxyAddresses = []
    public get Addresses() {
        return this.proxyAddresses
    }

    public mounted() {
        this.user.addresses$.subscribe((val) => {
            this.proxyAddresses = [].concat(val)
            this.newAddress = Object.assign({}, this.user.defaultAddress)
        })
    }
}
