import State from '../../utils/state/state'
import {
    SelectValue,
    DisableTabs,
    EnableTabs
} from '../../utils/pageHelpers'
import { API } from '../../utils/api'
import CreateOptions from '../../utils/html/options'
import ElementHandler from '../../utils/element-handler'

const ProjectTab = (state, resolveState) => {
    const Elements = ElementHandler([
        { id: `projectName`, event: `input` },
        { id: `newProjectBtn`, event: `click` },
        { id: `openProjectBtn`, event: `click` },
        { id: `saveProjectBtn`, event: `click` },
        { id: `saveProjectAsBtn`, event: `click` },
        { id: `openProjectSelect`, event: `click` },
        { id: `existingProjects`, event: `click` },
        { id: `currentProject`, event: `click` },
    ], state)

    const getProjects = () => {
        return API({ path: 'project/list' })
            .then(list => {
                const select = Elements.element(`openProjectSelect`)
                const existing = Elements.element(`existingProjects`)

                select.innerHTML = ``

                CreateOptions({
                    values: list.map(l => l.name),
                    parent: select
                })

                if (list.length === 0) {
                    existing.style.display = `none`
                } else {
                    existing.style.removeProperty(`display`)
                }
            })
    }

    const updateProjectName = val => state.name = val.target.value
    const updateProject = name => {
        Elements.element(`projectName`).value = name

        if (!!name) {
            EnableTabs()
            Elements.element(`currentProject`).style.removeProperty(`display`)
        } else {
            DisableTabs()
            Elements.element(`currentProject`).style.display = `none`
        }
    }
    const newProject = () => {
        state.clear()
        State(`New project`).then(resolveState)
    }
    const openProject = () => {
        var projectToOpen = SelectValue(Elements.element(`openProjectSelect`))
        if (!projectToOpen) { return }

        state.clear()

        API({ path: `project/open`, data: projectToOpen })
            .then(State)
            .then(resolveState)
    }

    state.subscribeServerSave(getProjects)
    state.subscribeName(updateProject)
    Elements.subscribe(`projectName`)(updateProjectName)
    Elements.subscribe(`newProjectBtn`)(newProject)
    Elements.subscribe(`openProjectBtn`)(openProject)
    Elements.subscribe(`saveProjectBtn`)(state.saveServer)
    Elements.subscribe(`saveProjectAsBtn`)(state.saveServer)

    return Elements
}

export default ProjectTab