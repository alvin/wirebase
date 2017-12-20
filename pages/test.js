import Layout from '../components/Layout'
import Commentable from '../components/Commentable'

export default ({url}) => pug`
Layout(url=${url})
  .ui.two.column.stackable.divided.grid
    .column
      Commentable(title="Subpage Content Area")
        | sub page content
`