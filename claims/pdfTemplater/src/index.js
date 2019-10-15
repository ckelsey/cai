/** 
 * !BUGS
 * ! data gets lost on refresh with 500 error after query, update: go to data tab then go to preview-works again?
 * ! delete page doesn't work
 * ! delete img/text


[] MUST [][][][][][][][][][][][][]
    - 1 _____________________________
        - tab sections:
            - Preview
                - page navigation
                - test button(outputs preview)
            - Export
                - where
                - name
                - user/pass for access page
                - csv/json as well?
                - convert svg back to pdf

    


[] WILL [][][][][][][][][][][][][]
    - loading pdf/data spinner
    - Collapsible query/fields/joins


[] AFTER [][][][][][][][][][][][][]
    - write project data to s3
    - write DB to json, then lambda to query s3 select
    - actual icons
    - new project button
    - indicator on whether or not you are dragging or resizing
    - split up state and renderer
    - collapse item styles when not selected
    - deselect item
    - save as button(to duplicate project)
    - open project dialogue
    - Combine PDF docs/templates (such as the user agreement + claim form)
    - efficient json viewer
    - data -> fields in join randomly get lost?


- CAI POST REQUIREMENTS [][][][][][][][][][][][][]

- S3 Bucket: CAI DB JSON files
    - Collection folders:
        - settlements
        - users
        - claims
        - collection metadata

- S3 Bucket: CAI Settlement Projects
    - Per project name
        - project data folder
            - project JSON
            - project SVG's
            - project template PDF's
        - output folder
            - exported CSV
            - exported JSON
            - exported zipped PDF's
            - Folder
                - individual PDF
                
- S3 Bucket: static web host for settlement admins
    - User login
    - Bulk Download PDF's -> linked lambda -> signed url to zip file
    - Download CSV -> linked lambda -> signed url to file
    - Download JSON -> linked lambda -> signed url to file
    - View data/JSON
        - Download specific PDF -> linked lambda -> signed url to file

- To Lambda Functions:
    - Open Project
    - Save Project
    - Export Project
    - Project DB Query
    - S3-DB build metadata script
    - S3-DB Query
    
**/

import './style.scss'
import State from './utils/state/state'
import { SetActiveTab, PageElements } from './utils/pageHelpers'
import ProjectTab from './components/tabs/project'
import TemplateTab from './components/tabs/template'
import QueryTab from './components/tabs/query'
import PreviewTab from './components/tabs/preview'
import ObserveEvent from './utils/observe/event'
import { API } from './utils/api'
import Database from './components/database/database'

const resolveState = state => {
    if (!state) { return }

    ProjectTab(state, resolveState)
    TemplateTab(state)
    PreviewTab(state)
    const query = QueryTab(state)

    API({ path: `query/init` })
        .then(databaseMeta => {
            state.DB = new Database(
                query.element(`queryContainer`),
                state.data,
                databaseMeta,
                dbData => {
                    state.data = dbData
                    state.save()
                }
            )
        })


    Object.keys(PageElements.tabs)
        .forEach(
            (tab, i) =>
                state.subscriptions[`tabsclick${i}`] = ObserveEvent(
                    PageElements.tabs[tab],
                    `click`
                )
                    .subscribe(() => {
                        console.log(`tab`, tab)
                        state.tab = tab
                    })
        )

    state.subscribeTab(SetActiveTab)
    state.initialized$(resolveState)

    console.log(`state`, state)
}

State().then(resolveState)