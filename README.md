# --- wirebase ---

### HTML wireframing with next.js + PUG/Jade + Semantic UI +Firebase for comments/annotations


## Setup


#### Clone the repo:
    git clone https://github.com/alvin/wirebase.git

#### *---NB - required ---* Create a config/wirebase.json file with your own unique id:
	{
      "workspaceId": "your-unique-project-id-here"
    }

#### Install dependencies 
	npm install

## Development

#### Start local dev server
	npm run dev

#### Nest your markup inside the Commentable component to enable annotations for a region
 
	Commentable(title="A Unique Title")
      .ui.segment
        | Some Content


#### (re)Build Semantic UI and export dist to next.js static/css/semantic
	cd vendor/semantic && gulp build

or listen for changes that you make in vendor/semantic/src:

	cd vendor/semantic && gulp


## Deployment

#### Deploy your wireframe to Zeit's "now" hosting for free

Ensure you have zeit now's CLI tool installed
 
    npm install -g now

To deploy a new revision, just type:

	now

####  Override the default config/firebase.json file with your own firebase app setup (optional, encouraged)

    {
      "apiKey": "",
      "authDomain": "",
      "databaseURL": "",
      "projectId": "",
      "storageBucket": "",
      "messagingSenderId": ""
    }

