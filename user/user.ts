/** TODO
 * bug when adding phones
 * bug with dates, ie start/end
 */

import requests from '../requests'
import { UserCredentials, UserModel } from '@/types'
import Subject from '@/utils/subject'
import { FileUploader } from '../file-upload'
import { UserSchema, UserDataToAPI, ValidateData } from './user-schema'
import Get from '@/utils/get';

const urlKeys: { [key: string]: string } = {
    phoneNumbers: `phonenum`,
    address: `address`,
    employment: `employment`,
    vehicle: `vehicle`
}

class User {
    public model$: Subject
    public ready$: Subject
    public loggedIn$: Subject
    public verifing$: Subject
    public completionStats$: Subject

    constructor() {
        this.login = this.login.bind(this)
        this.register = this.register.bind(this)
        this.logout = this.logout.bind(this)

        this.model$ = new Subject({})
        this.ready$ = new Subject(false)
        this.loggedIn$ = new Subject(false)
        this.verifing$ = new Subject({ data: null, show: false })
        this.completionStats$ = new Subject({
            account: 0,
            phone: 0,
            employment: 0,
            vehicle: 0,
            address: 0
        })

        let existing: any = localStorage.getItem(`CAI-USER`)

        try {
            existing = JSON.parse(existing as string)
        } catch (error) {
            existing = {}
        }

        this.modelUser(existing)

        if (existing && existing.id) {
            this.getUser(existing)
        }

        // tslint:disable-next-line:align
        // ; (window as any).user = this
    }

    public getDefault(key: string) {
        const props = UserSchema.properties as any
        const data = props[key]
        let result: any

        if (!data) {
            return result
        }

        result = {}

        Object.keys(data.properties).forEach((p) => {
            if (!data.properties[p].formField) { return }

            switch (data.properties[p].type) {
                case `number`:
                case `file`:
                    result[p] = undefined
                    break

                case `checkbox`:
                    result[p] = false

                case `email`:
                case `select`:
                case `year`:
                case `date`:
                case `text`:
                    result[p] = ``
                    break
            }
        })

        return result
    }

    public getData(urlKey: string, data?: any) {
        const userId = Get(data, `id`, Get(this.model$.value, `id`))
        const token = Get(data, `token`, Get(this.model$.value, `token`))

        if (!userId || !token) {
            return Promise.reject(`invalid user`)
        }

        return requests.get(`/user/${userId}/${urlKey}`, {}, token)
            .then((response: any) => Promise.resolve(response))
            .catch((err) => {
                /** TODO */
                return Promise.reject(err)
            })
    }

    public getUser(data: any) {
        if (!data || !data.token) {
            this.loggedIn$.next(false)
            this.setReady()
            return Promise.resolve()
        }

        return requests.get(`/user/${data.id}`, data)
            .then((response: any) => {

                if (!response.id) { throw new Error(response) }

                return this.getData(`phonenum`, data)
                    .then((phones: any) => {
                        return this.modelUser(
                            Object.assign(
                                {},
                                data,
                                response,
                                { phoneNumbers: phones }
                            )
                        )
                    })
                    .catch(Promise.reject)
            })
            .catch(() => {
                return this.refreshToken(data)
            })
    }

    public refreshToken(data: UserModel) {
        this.logout()
        return Promise.reject()
        /** TODO GET REFRESH PATH */
        // return requests.get(`/user/${data.id}`, data)
        //     .then((response: any) => {

        //         if (!response.id) {
        //             /** TODO get refresh path */
        //             throw new Error(response)
        //             // return
        //         }

        //         return this.modelUser(
        //             Object.assign(
        //                 {},
        //                 data,
        //                 response
        //             )
        //         )
        //     })
        //     .catch(() => {
        //         return this.logout()
        //     })
    }

    public modelUser(data: any) {
        if (!data || !data.token) {
            return this.logout()
        }

        delete data.password
        delete data.confirmPassword

        const model = ValidateData(data)
        this.model$.next(model)
        this.loggedIn$.next(!!model.token)

        localStorage.setItem(`CAI-USER`, JSON.stringify(this.model$.value))

        this.setReady()

        return this.model$.value
    }

    public update(data: any): Promise<UserModel> {
        if (!this.loggedIn$.value || !data) { return Promise.reject() }

        return new Promise((resolve, reject) => {
            const model = Object.assign({}, this.model$.value, ValidateData(data))

            return requests.put(`/user/${model.id}`, model)
                .then((response: any) => {
                    if (response.ok !== 1) { throw new Error(response) }

                    this.modelUser(model)

                    return resolve()

                })
                .catch((error) => {
                    /** TODO handle error */
                    return reject(error)
                })
        })
    }

    public updateData(data: any, modelKey: string) {
        if (!data || !modelKey) { return Promise.reject() }

        const urlKey = urlKeys[modelKey]

        if (!urlKey) { return Promise.reject(`invalid url`) }

        return new Promise((resolve, reject) => {
            if (!this.loggedIn$.value) { return reject(`not logged in`) }
            if (!data || !urlKey || !modelKey) { return reject(`no value`) }

            const userId = this.model$.value.id
            const token = this.model$.value.token
            const dataId = data.id
            const model = this.model$.value
            let apiData = UserDataToAPI(data, urlKey)

            if (!userId || !token) { return reject(`invalid user`) }

            const finish = () => {
                return this.getData(urlKey)
                    .then((newData: any) => {
                        return this.modelUser(
                            Object.assign({},
                                this.model$.value,
                                { [modelKey]: newData }
                            )
                        )
                    })
                    .catch(reject)
            }

            const update = () => {
                return requests.put(`/user/${userId}/${urlKey}/${dataId}`, apiData, token)
                    .then(() => {
                        const existing = model[modelKey]
                        let index
                        let count = existing.length

                        while (count-- && index === undefined) {
                            const item = existing[count]

                            if (item.id === dataId) {
                                index = count
                                model[modelKey][index] = data
                            }
                        }

                        return finish()
                    })
                    .catch(reject)
            }

            const create = () => {
                return requests.post(`/user/${userId}/${urlKey}`, apiData, token)
                    .then(() => {
                        if (Array.isArray(model[modelKey])) {
                            model[modelKey].push(data)
                        } else {
                            Object.keys(data).forEach((prop) => {
                                model[prop] = data[prop]
                            })
                        }

                        return finish()
                    })
                    .catch(reject)
            }

            const delegate = () => {
                if (dataId) {
                    return update()
                } else {
                    return create()
                }
            }

            if (!!data.file) {
                return this.handleUpload(data)
                    .then((fileUrl) => {
                        data.file = fileUrl
                        apiData = UserDataToAPI(data, urlKey)

                        return delegate()
                    })
                    .catch((err) => {
                        return reject(err)
                    })
            }

            return delegate()
        })
    }

    public deleteData(data: any, modelKey: string) {
        if (!data || !modelKey) { return Promise.reject() }

        const urlKey = urlKeys[modelKey]

        if (!urlKey) { return Promise.reject(`invalid url`) }

        const dataId = data.id
        const apiData = UserDataToAPI(data, urlKey)

        return requests.del(`/user/${this.model$.value.id}/${urlKey}/${dataId}`, apiData, this.model$.value.token)
            .then(() => {
                return this.getData(urlKey)
                    .then((newData: any) => {
                        return this.modelUser(
                            Object.assign({},
                                this.model$.value,
                                { [modelKey]: newData }
                            )
                        )
                    })
            })
    }

    public verifyPhone(data: any) {
        if (!data) { return Promise.reject() }
        this.verifing$.next({ data, show: true })
        return requests.post(`/user/${this.model$.value.id}/phonenum/${data.id}/verify`, data, this.model$.value.token)
    }

    public verifySMS(data: any, tokenVal: any) {
        if (!data || !tokenVal) { return Promise.reject() }
        const url = `/user/${this.model$.value.id}/phonenum/${data.id}/verify/${tokenVal}`
        return requests.post(url, data, this.model$.value.token)
            .then(() => {
                this.verifing$.next({ data: null, show: false })
                return this.getData(`phonenum`)
                    .then((newData: any) => {
                        return this.modelUser(
                            Object.assign({},
                                this.model$.value,
                                { phoneNumbers: newData }
                            )
                        )
                    })
            })
            .catch((err) => {
                console.log(err)
            })
    }

    public logout() {
        if (navigator.onLine) {
            if (this.model$.value.token) {
                requests.post(`/user/logout`, { id: this.model$.value.id }, this.model$.value.token)
            }

            localStorage.removeItem(`CAI-USER`)
            this.model$.next({})
            this.loggedIn$.next(false)
            this.setReady()
        }
    }

    public login(credentials: UserCredentials) {
        return requests.post(`/user/login`, credentials)
            .then((response: any) => {
                if (!response.token) {
                    throw new Error(response)
                }

                return this.getUser(response)
                    .then(() => this.model$.value)
            })
            .catch((error) => error)
    }

    public register(credentials: UserCredentials) {
        return requests.post(`/user`, credentials)
            .then(() => {
                return this.login(credentials)
            })
            .catch((error) => {
                /** TODO handle error */
                return error
            })
    }

    public handleUpload(data: any) {
        return new Promise((resolve, reject) => {
            const file = data.file

            const uploader = new FileUploader(file)

            const uploaderSubscription = uploader.state$.subscribe((uploadState: any) => {
                if (uploadState.error) {
                    uploaderSubscription()
                    return reject(uploadState.error)
                }

                if (uploadState.url) {
                    uploaderSubscription()
                    return resolve(uploadState.url)
                }
            })

            uploader.upload()
        })
    }

    public deactivate() {
        /** TODO */
        this.modelUser(Object.assign({}, this.model$.value, { active: 0 }))
    }

    public activate() {
        /** TODO */
        this.modelUser(Object.assign({}, this.model$.value, { active: 1 }))
    }

    private setReady() {
        if (this.ready$.value) { return }

        requestAnimationFrame(() => {
            this.ready$.next(true)
        })
    }
}

export default new User()
