const cds = require('@sap/cds').connect()

describe('Getting Started...', ()=>{

    it ('should compile the data model', ()=> cds.get('db/bookshop') .then (cds.compile.to.yaml))
    it ('should compile to edmx', ()=> cds.load('srv/cat-service').then(cds.compile.to.edmx))
    it ('should export to swagger', ()=> cds.load('srv/cat-service').then(cds.compile.to.swgr))
    it ('should serve cat-service', ()=> cds.serve('srv/cat-service'))
    it ('should serve cat-service + impl', ()=> cds.serve('srv/cat-service',{'impl':'cat-service'}))
    it ('should deploy the model specified in args', ()=> cds.deploy ('db/bookshop'))
    it ('should deploy the model from config', ()=> cds.deploy())
    it ('should fill the database with initial data', ()=> require ('../db/init'))

})
