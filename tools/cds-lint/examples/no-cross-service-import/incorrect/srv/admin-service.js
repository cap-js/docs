const cds = require('@sap/cds')
const { Books } = require('#cds-models/sap/capire/bookshop/CatalogService') // [!code highlight]

module.exports = class AdminService extends cds.ApplicationService {
  // …
}