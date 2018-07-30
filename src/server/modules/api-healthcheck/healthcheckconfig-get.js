var request = {
  "method": "POST",
  "headers": {
    "x-rdp-clientid": "rufClient",
    "x-rdp-tenantid": "rdw",
    "x-rdp-ownershipdata": "",
    "x-rdp-userid": "system_user",
    "x-rdp-username": "system",
    "x-rdp-useremail": "system",
    "x-rdp-userroles": "[\"admin\"]",
    "x-rdp-authtoken": "vA/BnGa6ue5oCdgxaogJRvxDy7dAudrs3qstHYJNBUE=",
    "cache-control": "no-cache",
    "version": 8.1,
    "content-type": "application/json",
    "connection": "close"
  },
  "body": {
    "dataIndex": "config",
    "params": {
      "query": {
        "filters": {
          "typesCriterion": [
            "apihealthcheckconfig"
          ]
        },
        "contexts": [
          {
            "app": "app-system-healthcheck"
          }
        ]
      },
      "fields": {
        "attributes": [
          "_ALL"
        ]
      },
      "options": {
        "maxRecords": 2000
      }
    }
  },
  "json": true,
  "simple": false,
  "timeout": 30000,
  "gzip": true
}

module.exports = {
  'request': request
};