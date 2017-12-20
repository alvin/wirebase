import Router from 'next/router'
import React, { Component } from 'react'
import { Sidebar, Modal, Segment, Button, Menu, Image, Icon, Header } from 'semantic-ui-react'

import wirebaseConfig from '../config/wirebase'
const workspaceId = wirebaseConfig.workspaceId;
import Model from '../modules/model'
const Comments = new Model('comments')
import shortid from 'shortid'
import TimeAgo from 'react-timeago'
import Avatar from 'react-avatar';

class Commentable extends Component {
  
  constructor(props) {
    super(props);
    const allComments = []
    
    this.state = { 
      visible: false, 
      comments: []
    }
    
  }

  toggleVisibility = () => this.setState({ visible: !this.state.visible })
  
  filterComments(allComments) {
    return allComments.filter(c => (
      c.workspaceId == workspaceId 
      && c.page == Router.route 
      && c.region == this.props.title) 
    )    
  }
  
  loadData() {
    return Comments.getDocsWhen("workspaceId","==", wirebaseConfig.workspaceId, (allComments) => {
      console.log('got comments from wire', allComments)
      this.setState({comments: this.filterComments(allComments)})
    })
  }
  
  componentDidMount() {
    this.dataRef = this.loadData()
  }
    
  componentWillUnmount() {

  }
  
  sendPasswordReset = async () => {
    if (this.userEmail && this.userEmail.value) {
      
      var auth = window.firebase.auth();
      var emailAddress =this.userEmail.value;

      auth.sendPasswordResetEmail(emailAddress).then(function() {
          this.setState({resetEmailSent: true})
      }).catch(function(error) {
        // An error happened.
      });

    }
  }
  
  createUserOrLogin = async () => {
    if (this.userEmail && this.userEmail.value) {
      
      
      if (this.userPassword && this.userPassword.value) {
        window.firebase.auth().signInWithEmailAndPassword(this.userEmail.value, this.userPassword.value).catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          // ...
        });
        
      } else {
        this.userPassword = shortid.generate()
      
        window.firebase.auth().createUserWithEmailAndPassword(this.userEmail.value, this.userPassword )
        .then(() => {
      
          var user = firebase.auth().currentUser;
          if (this.userName && this.userName.value) {
            user.updateProfile({
              displayName: this.userName.value
            }).then(function() {
              this.setState({userPrompt: false})
            }).catch(function(error) {
              // An error happened.
            });
          
          }  else {
              this.setState({userPrompt: false})
          }
      
        })
        .catch((error) => {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          // ...
            this.setState({signInPrompt: true})
        
        });
      
      }
    }
  }
  
  saveComment = async () => {
    
    
    if (this.pendingContent && this.pendingContent.value) {

      window.firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          // User is signed in.
          var displayName = user.displayName;
          var email = user.email;
          var emailVerified = user.emailVerified;
          var photoURL = user.photoURL;
          var isAnonymous = user.isAnonymous;
          var uid = user.uid;
          var providerData = user.providerData;

        
        
          const {title} = this.props    
          var note = {
            page: Router.route,
            workspaceId: workspaceId,
            content: this.pendingContent.value,
            createdByName: displayName,
            createdBy: window.firebase.auth().currentUser.uid,
            createdAt: new Date
          }
          if (title) note.region = title
  
          Comments.create(note)
          
        
        } else {
          this.setState({userPrompt: true})
        }
      });


    }
    
    
    
    
  }

  render() {
    const { visible, comments, userPrompt, signInPrompt, resetEmailSent, hintActive} = this.state
    const { children, title } = this.props
    const Actions = Modal.Actions
    const user = typeof(window) != 'undefined' && window.firebase ? window.firebase.auth().currentUser : null
    
    return pug`
      
      span.commentable
        if hintActive || visible
          Sidebar(animation="uncover" direction="bottom" visible=${true} inverted=${visible} borderless=${true} as=${Menu} size="small")
            .item 
              .ui.black.label ${title}
            
            .right.menu
              .item 
                | Click to open discussion panel  
              .item
                i.icon.comment
        Sidebar(animation="scale down" width="wide" direction="right" visible=${visible} icon="labeled" style=${{backgroundColor:'#fff'}})
          .ui.inverted.black.block.header
            | Discussion
            .ui.header.inverted(onClick=${this.toggleVisibility}, style=${{float:'right', cursor:'pointer', marginRight: '-0.5rem'}}) ×
          .ui.padded.basic.segment
            if !comments || !comments.length
              .ui.secondary.center.aligned.segment No comments yet...
            else
              .ui.comments.horizontally
                each comment, idx in comments
                  .comment(key=${comment.id})
                    //a.avatar
                    Avatar(name=${comment.createdByName} size="37"  color="#777777" round=${true} style=${{width: '37px', float: 'left', marginRight: '0.5rem'}})
                    .content
                      a.author ${comment.createdByName}
                      .metadata
                        span.date 
                          TimeAgo(date=${comment.createdAt})
                      .text
                        | ${comment.content}
                    if idx < comments.length - 1
                      .ui.divider
            form.ui.reply.form
              .field
                textarea(style=${{maxHeight: '4rem', minHeight: '4rem'}} ref=${input => input && (this.pendingContent = input)})
              .ui.blue.labeled.submit.icon.button( onClick=${this.saveComment})
                i.icon.edit
                |  Add Comment
            if user && this.userPassword 
              .ui.segment
                | Thanks for commenting. You have been signed in automatically and can sign in later with the password
                .ui.label ${this.userPassword }
            Modal(open=${userPrompt} onClose=${(e) => this.setState({userPrompt: false})} closeOnEscape=${true})
              .content
                .ui.inline.form
                  if this.pendingContent && this.pendingContent.value
                      .ui.block.header.top.attached Add your comment:
                      .ui.segment.bottom.attached ${this.pendingContent.value}                  
                  .fields
                    .eight.wide.field
                      label E-mail
                      input(type='email',  ref=${input => input && (this.userEmail = input)} placeholder='yourname@yourcompany.com')
                    if !signInPrompt
                      .eight.wide.field
                        a.ui.mini.blue.button.basic(onClick=${(e) => this.setState({signInPrompt: true})} style=${{float: "right"}})
                          i.icon.key
                          | Sign In
                        label Your Name
                        input(type='text',  ref=${input => input && (this.userName = input)} placeholder='Johanna Smith')
                    if signInPrompt
                      .eight.wide.field
                        label 
                          if !resetEmailSent
                            a.ui.mini.blue.button.basic(onClick=${(e) => this.sendPasswordReset() } style=${{float: "right"}}) 
                              i.icon.send
                              | Send New Password
                          else
                            small(style=${{float: "right", opacity: "0.7", fontWeight: "300"}}) Please sign in with the password you were emailed 
                          | Password
                        input(type='text',  ref=${input => input && (this.userPassword = input)} placeholder='Enter the password that we emailed you')
              Actions
                Button(className="deny" onClick=${(e) => this.setState({userPrompt: false}) } ) Cancel
                .ui.primary.button.approve(onClick=${(e) => this.createUserOrLogin() }) Add Comment
        span(onClick=${this.toggleVisibility} onMouseOver=${(e) => this.setState({hintActive: true}) }  onMouseOut=${(e) => this.setState({hintActive: false}) } style=${{cursor: "pointer"}})
          | ${children}
    `
  }
}

export default Commentable