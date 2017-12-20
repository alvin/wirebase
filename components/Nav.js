import Link from 'next/link'

export default ({url}) => pug`
.ui.inverted.dark.grey.menu
  .ui.container
    .ui.inverted.dark.grey.menu
      Link(href="/")
        .item.link(className=${url.pathname == '/' ? 'active' : ''}) Home
      Link(href="/test")
        .item.link(className=${url.pathname == '/test' ? 'active' : ''}) Test Page
`