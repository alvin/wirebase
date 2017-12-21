import Nav from './Nav'
import {Menu, Sidebar} from 'semantic-ui-react'

export default ({url,children}) => pug`
div
  Nav(url=${url})
  .ui.container
    | ${children}
  Sidebar(direction="bottom" borderless=${true} inverted=${true} visible=${true} as=${Menu} id='sidebar-root' style=${{minHeight: '4rem'}})
  
`