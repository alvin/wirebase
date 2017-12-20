import Store from 'react-observable-store';
import wirebaseConfig from '../config/wirebase'
import Model from '../modules/model'
const Comments = new Model('comments')


export default () => {
  console.log(Store.get('comments'))
  if (typeof(window) != 'undefined' && Store.get('comments') == null ) {  
    Store.init({ comments: []})
    Comments.getDocsWhen("workspaceId","==", wirebaseConfig.workspaceId, (comments) => {
      console.log('got comments', comments)
      Store.update('comments', comments );
    })
  }
}