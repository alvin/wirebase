import Layout from '../components/Layout'
import Commentable from '../components/Commentable'

export default ({url}) => pug`
Layout(url=${url})
  .ui.two.column.stackable.divided.grid
    .column
      Commentable(title="Homepage Content Left")
        .ui.basic.padded.segment
            h3 Aliquam erat volutpat. 
            p Nam vel lectus elit. Praesent et leo viverra, bibendum elit feugiat, dapibus turpis. Suspendisse facilisis quam nunc, eget tincidunt lectus iaculis at.
    .column
      Commentable(title="Homepage Content Right")
        .ui.basic.padded.segment
          .ui.segment
            .ui.small.header
              img.ui.avatar.tiny.image(src='https://randomuser.me/api/portraits/women/51.jpg')
              b Participant Testimonial
            p Sed rutrum magna in lacus feugiat ultrices. 
  .ui.divider
  Commentable(title="Homepage Content Bottom")
    .ui.vertical.stripe.segment.center.aligned.very.padded
      h3.ui.header.large Pellentesque luctus et neque sit amet interdum. 
      p Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean eu nisi ac nisi lacinia pharetra a sit amet purus. Sed rutrum magna in lacus feugiat ultrices. Duis vehicula urna in dictum varius. Nam blandit nulla eu fermentum blandit. Fusce vel elit ac leo laoreet finibus a ac quam.
      .ui.basic.segment.center.aligned
        a.ui.large.button Do Something, Quick!
      .ui.divider
`