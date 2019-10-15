import initState from './stateInit'
import { DefaultState, localStorageKey } from './stateConstants'
// import { API } from '../api'

const State = arg => {
    return new Promise(resolve => {
        const storedProject = localStorage.getItem(localStorageKey)

        if (!storedProject) {
            if (typeof arg === `string` || arg === undefined) {
                return resolve(initState(DefaultState(arg || ``)))
            }

            return resolve(initState(arg))
        }

        const project = JSON.parse(storedProject)
        return resolve(initState(project))
        // return resolve(API({ path: `project/open`, data: project.name })
        //     .then(initState))
    })
}

export default State