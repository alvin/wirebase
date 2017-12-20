import Nav from './Nav'

export default ({url,children}) => pug`
div
  Nav(url=${url})
  .ui.container
    | ${children}
`