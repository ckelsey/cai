data[0].claims
    .map(function (claim) {
        var CAI_address = {
            street: `Suite E, 2777 Alvarado Street`,
            city: `San Leandro`,
            state: `CA`,
            zip: `94577`,
        }

        var CAI_email = `compliance@classactioninc.com`

        var users = claim.users;
        if (!users) { return }
        var user = claim.users[0];

        if (!user) { return false; }

        if (!user.agreement_string && !user.agreement_string) { return false; }

        var toDate = function (ts) {
            var d = new Date(ts)
            const month = `0${d.getMonth() + 1}`.slice(-2)
            const day = `0${d.getDate()}`.slice(-2)
            const year = d.getFullYear()
            const hours = d.getHours()
            const hour = `0${hours > 12 ? hours - 12 : hours}`.slice(-2)
            const minute = `0${d.getMinutes()}`.slice(-2)
            const amPm = hours >= 12 ? `pm` : `am`
            return `${month}/${day}/${year} ${hour}:${minute}${amPm}`
        }

        Object.keys(user)
            .forEach(
                function (key) {
                    claim[key] = user[key];
                }
            );

        delete claim.users;
        delete claim.claimData;

        if (claim.filed) {
            claim.filed = toDate(claim.filed)
        }

        if (claim.agreement_string) {
            claim.agreement_string = toDate(claim.agreement_string)
        }

        if (claim.signup) {
            claim.signup = toDate(claim.signup)
        }

        // if (!claim.address || !claim.address.street || !claim.address.zip) {
        //     return false
        // }

        // Object.keys(claim.address).forEach(addressKey => claim[`address_${addressKey}`] = claim.address[addressKey])
        Object.keys(claim.address).forEach(addressKey => claim[`address_${addressKey}`] = claim.address[addressKey] || CAI_address[addressKey])

        delete claim.address;
        delete claim.phones;

        if (!claim.email || claim.email.trim() === ``) {
            claim.email = CAI_address
        }

        if (!claim.fname || claim.fname.trim() === `` || !claim.lname || claim.lname.trim() === ``) {
            return false
        }

        return claim;
    })
    .filter(
        function (claim) {
            return claim ? true : false;
        }
    );