module.exports = {
  workspaces: {
    relationships: [
      { hasMany: 'comments' }
    ],
    foreignKey: 'workspaceId'
  },
  "comments": {
    relationships: [
      { belongsTo: 'workspaces' }
    ]    
  }
}