import SaSupport from 'html-loader!../../assets/templates/sa_support.html'

class PDF {
    templates = {
        SaSupport
    }

    constructor() {
        console.log(this)

        document.getElementById('page').innerHTML = this.templates.SaSupport
    }
}

const pdf = window.PDF = new PDF()



export default pdf
