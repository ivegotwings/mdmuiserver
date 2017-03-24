var allConfigs = {
    "configs": [{
        "name": "main-app",
        "ctxInfo": [{
            "tenant": "jcp",
            "ctx": {
                "list": "productMaster"
            },
            "security": {
                "user": "",
                "role": ""
            },
            "components": {
                "pebble-actions": {
                    "config": {
                        "title": "Create New...",
                        "actions": [{
                            "name": "createSKU",
                            "icon": "pebble-xl-icons:Product",
                            "text": "SKU",
                            "visible": true,
                            "dataRoute": "entity-create",
                            "dataContext": {
                                "source": "internal",
                                "locale": "en-US",
                                "list": "productMaster",
                                "classification": "_ALL",
                                "entityType": "sku"
                            }
                        },
                        {
                            "name": "createKit",
                            "icon": "pebble-xl-icons:Kit",
                            "text": "PDP",
                            "visible": true,
                            "dataRoute": "entity-create",
                            "dataContext": {
                                "source": "internal",
                                "locale": "en-US",
                                "list": "productMaster",
                                "classification": "_ALL",
                                "entityType": "pdp"
                            }
                        },
                        {
                            "name": "createSupplier",
                            "icon": "pebble-xl-icons:Customer",
                            "text": "Create Suplier",
                            "visible": true,
                            "dataRoute": "entity-create",
                            "dataContext": {
                                "source": "internal",
                                "locale": "en-US",
                                "list": "productMaster",
                                "classification": "_ALL",
                                "entityType": "supplier"
                            }
                        }
                        ]
                    }
                },
                "rock-navmenu": {
                    "config": [{
                        "name": "dashboard",
                        "title": "User Dashboard",
                        "data_route": "dashboard",
                        "icon": "pebble-icons:Dashboard",
                        "isLandingPage": true
                    },
                    {
                        "name": "entity-discovery",
                        "title": "Entity Search & Refine",
                        "data_route": "entity-discovery",
                        "icon": "pebble-icons:SearchDb"
                    },
                    {
                        "name": "entity-manage",
                        "title": "Entity Manage",
                        "data_route": "entity-manage",
                        "queryParams": {
                            "id": "e1"
                        },
                        "icon": "pebble-icons:Entities"
                    },
                    {
                        "name": "divider"
                    },
                    {
                        "name": "manageModel",
                        "title": "Manage Data Model",
                        "data_route": "manage-model",
                        "icon": "pebble-icons:DatamodelDb"
                    },
                    {
                        "name": "integrationManage",
                        "title": "Manage Integrations",
                        "data_route": "manage-integration",
                        "icon": "pebble-icons:IntegrationDb"
                    },
                    {
                        "name": "divider"
                    },
                    {
                        "name": "appStore",
                        "title": "App Store",
                        "data_route": "app-store",
                        "icon": "pebble-icons:AppDb"
                    }
                    ]
                },
                "main-app-routes": {
                    "config": {
                        "dashboard": {
                            "name": "dashboard",
                            "title": "Dashboard",
                            "data_route": "dashboard",
                            "icon": "pebble-icons:Dashboard",
                            "href": "/",
                            "nonClosable": true,
                            "nonMinimizable": true,
                            "isLandingPage": true,
                            "component": {
                                "name": "app-dashboard",
                                "path": "../../src/elements/app-dashboard/app-dashboard.html",
                                "properties": {
                                    "mode": "edit"
                                }
                            }
                        },
                        "entity-discovery": {
                            "name": "entity-discovery",
                            "title": "Entity Search & Discovery",
                            "data_route": "entity-discovery",
                            "icon": "pebble-icons:Search",
                            "href": "/entity-discovery",
                            "nonClosable": true,
                            "nonMinimizable": true,
                            "component": {
                                "name": "app-entity-discovery",
                                "path": "../../src/elements/app-entity-discovery/app-entity-discovery.html",
                                "properties": {}
                            }
                        },
                        "entity-manage": {
                            "name": "entity-manage",
                            "title": "entity-manage",
                            "data_route": "entity-manage",
                            "icon": "pebble-icons:Entities",
                            "href": "/entity-manage?id=e1",
                            "component": {
                                "name": "app-entity-manage",
                                "path": "../../src/elements/app-entity-manage/app-entity-manage.html",
                                "properties": {}
                            }
                        },
                        "entity-create": {
                            "name": "entity-create",
                            "title": "entity-create",
                            "data_route": "entity-create",
                            "icon": "pebble-icons:Entities",
                            "href": "/entity-create",
                            "component": {
                                "name": "app-business-function",
                                "path": "../../src/elements/app-business-function/app-business-function.html",
                                "properties": {
                                    "name": "createentity",
                                    "context": {
                                        "entityType": "sku"
                                    }
                                }
                            }
                        },
                        "manage-model": {
                            "name": "managemodel",
                            "title": "Manage Model",
                            "data_route": "manage-model",
                            "icon": "pebble-icons:DataModelDb",
                            "href": "/",
                            "nonClosable": true,
                            "nonMinimizable": true,
                            "component": {
                                "name": "",
                                "path": ""
                            }
                        },
                        "manage-integration": {
                            "name": "manageintegration",
                            "title": "Manage Integration",
                            "data_route": "manage-integration",
                            "icon": "pebble-icons:IntegrationsDb",
                            "href": "/",
                            "nonClosable": true,
                            "nonMinimizable": true,
                            "component": {
                                "name": "",
                                "path": ""
                            }
                        },
                        "app-store": {
                            "name": "appstore",
                            "title": "App Store",
                            "data_route": "app-store",
                            "icon": "pebble-icons:AppsDb",
                            "href": "/",
                            "nonClosable": true,
                            "nonMinimizable": true,
                            "component": {
                                "name": "",
                                "path": ""
                            }
                        }
                    }
                },
                "tenant-config": {
                    "config": {
                        "logoUrl": "../src/images/jcpenney_logo.svg",
                        "tenantName": "JCPenney",
                        "primaryColor": "#D71921",
                        "primaryLightColor": "#0bb2e8",
                        "secondaryColor": "#364653"
                    }
                }
            }
        }]
    },
    {
        "name": "app-entity-discovery",
        "ctxInfo": [{
            "tenant": "jcp",
            "ctx": {
                "list": "productMaster"
            },
            "security": {
                "user": "",
                "role": ""
            },
            "components": {
                "rock-dimension-selector": {
                    "config": {
                        "catalogSelector": {
                            "visible": true,
                            "catalogItems": [{
                                "id": 1,
                                "title": "Product Master",
                                "subtitle": "Product Master",
                                "value": "productMaster",
                                "image": ""
                            },
                            {
                                "id": 2,
                                "title": "Web Catalog",
                                "subtitle": "Web Catalog",
                                "value": "webCatalog",
                                "image": ""
                            }
                            ],
                            "selectedCatalogItems": [{
                                "id": 1,
                                "title": "Product Master",
                                "subtitle": "Product Master",
                                "value": "productMaster",
                                "image": ""
                            }]
                        },
                        "sourceSelector": {
                            "visible": true,
                            "sourceItems": [{
                                "id": 1,
                                "title": "Internal Source",
                                "subtitle": "Internal Source",
                                "value": "internal",
                                "image": ""
                            }],
                            "selectedSourceItems": [{
                                "id": 1,
                                "title": "Internal source",
                                "subtitle": "Internal source",
                                "value": "internal",
                                "image": ""
                            }]
                        },
                        "localeSelector": {
                            "visible": true,
                            "localeItems": [{
                                "id": 1,
                                "title": "English - United States",
                                "subtitle": "English",
                                "value": "en-US",
                                "image": ""
                            },
                            {
                                "id": 2,
                                "title": "Spanish - Spain",
                                "subtitle": "Spanish",
                                "value": "es-SP",
                                "image": ""
                            }
                            ],
                            "selectedLocaleItems": [{
                                "id": 1,
                                "title": "English - United States",
                                "subtitle": "English",
                                "value": "en-US",
                                "image": ""
                            }]
                        }
                    }
                },
                "rock-saved-searches": {
                    "config": {
                        "favourites": [{
                            "id": 1,
                            "accesstype": "self",
                            "name": "Womens Shoes",
                            "icon": "pebble-icons:SavedSearch",
                            "dimensions": {
                                "catalog": "productMaster",
                                "Source": "internal",
                                "Locale": "en-US",
                                "TimeSlice": "Now"
                            },
                            "searchQuery": "",
                            "searchTags": [{
                                "name": "description",
                                "longName": "Description",
                                "displayType": "textBox",
                                "value": {
                                    "eq": "Womens"
                                }
                            }]
                        }],
                        "my-searches": [{
                            "id": 2,
                            "accesstype": "self",
                            "name": "Mens Shoes",
                            "icon": "pebble-icons:SavedSearch",
                            "shared": false,
                            "dimensions": {
                                "catalog": "productMaster",
                                "Source": "internal",
                                "Locale": "en-US",
                                "TimeSlice": "Now"
                            },
                            "searchQuery": "",
                            "searchTags": [{
                                "name": "description",
                                "longName": "Description",
                                "displayType": "textBox",
                                "value": {
                                    "eq": "Mens"
                                }
                            }]
                        }],
                        "shared-searches": [{
                            "id": 3,
                            "accesstype": "self",
                            "name": "Women's Sport Wear & Dresses",
                            "icon": "pebble-icons:SavedSearch",
                            "shared": true,
                            "dimensions": {
                                "catalog": "productMaster",
                                "Source": "internal",
                                "Locale": "en-US",
                                "TimeSlice": "Now"
                            },
                            "searchQuery": "dresses",
                            "searchTags": [{
                                "name": "description",
                                "longName": "Description",
                                "displayType": "textBox",
                                "value": {
                                    "eq": "dresses"
                                }
                            }]
                        }]
                    }
                },
                "pebble-actions": {
                    "config": {
                        "title": "",
                        "actions": [{
                            "name": "createProductPresentation",
                            "icon": "pebble-xl-icons:Brand",
                            "text": "Group in Product Presentation",
                            "visible": true,
                            "eventName": "action-createProductPresentation"
                        },
                        {
                            "name": "createEnsemble",
                            "icon": "pebble-xl-icons:Channel",
                            "text": "Group in Ensemble",
                            "visible": true,
                            "eventName": "action-createEnsemble"
                        }
                        ]
                    }
                },
                "rock-search-filter": {
                    "config": [{
                        "name": "displayname",
                        "longName": "Display Name",
                        "displayType": "textBox"
                    },
                    {
                        "name": "description",
                        "longName": "Description",
                        "value": "",
                        "displayType": "textArea"
                    },

                    {
                        "name": "creationdate",
                        "longName": "Creation Date",
                        "value": "",
                        "displayType": "dateTime"
                    },
                    {
                        "name": "startdate",
                        "longName": "Start Date",
                        "value": "",
                        "displayType": "dateTime"
                    },
                    {
                        "name": "enddate",
                        "longName": "End Date",
                        "value": "",
                        "displayType": "dateTime"
                    },
                    {
                        "name": "color",
                        "longName": "Color",
                        "displayType": "dropDown"
                    },
                    {
                        "name": "Size",
                        "longName": "Size",
                        "displayType": "dropDown"
                    },
                    {
                        "name": "orin",
                        "longName": "ORIN",
                        "displayType": "numeric"
                    },
                    {
                        "name": "width",
                        "longName": "Width",
                        "displayType": "dropDown"
                    },
                    {
                        "name": "skuqy",
                        "longName": "SKU Quantity",
                        "displayType": "numeric"
                    },
                    {
                        "name": "stuscd",
                        "longName": "Status Code",
                        "displayType": "textBox"
                    }
                    ]
                },
                "rock-entity-search-grid": {
                    "config": {
                        "viewMode": "Tabular",
                        "title": "Search Results",
                        "mode": "Read",
                        "schemaType": "attribute",
                        "dataRequest": {
                            "typesCriterion": ["productPresentation", "lot", "sku"],
                            "attributes": ["displayname", "description", "stuscd", "startdate", "enddate"]
                        },
                        "tabular": {
                            "settings": {
                                "isMultiSelect": true
                            },
                            "columns": [{
                                "header": "Entity Name",
                                "name": "displayname",
                                "sortable": false,
                                "filterable": false,
                                "linkTemplate": "entity-manage?id={id}&type={entityType}"
                            },
                            {
                                "header": "Entity Description",
                                "name": "description",
                                "sortable": false,
                                "filterable": false
                            },
                            {
                                "header": "Status Code",
                                "name": "stuscd",
                                "sortable": false,
                                "filterable": false
                            },
                            {
                                "header": "Start Date",
                                "name": "startdate",
                                "sortable": true,
                                "filterable": false
                            },
                            {
                                "header": "End Date",
                                "name": "enddate",
                                "sortable": true,
                                "filterable": false
                            }
                            ]
                        },
                        "list": {
                            "settings": {
                                "isMultiSelect": true,
                                "actions": [{
                                    "name": "delete",
                                    "icon": "pebble-icons:Delete",
                                    "eventName": "delete-item"
                                },
                                {
                                    "name": "edit",
                                    "icon": "pebble-md-icons:Edit",
                                    "eventName": "edit-item"
                                }
                                ]
                            },
                            "listItems": {
                                "image": "productImageUrl",
                                "title": "displayname",
                                "id": "id",
                                "fields": [{
                                    "name": "description",
                                    "label": "Description",
                                    "noTrim": false
                                },
                                {
                                    "name": "stuscd",
                                    "label": "Status Code",
                                    "noTrim": true
                                }
                                ]
                            }
                        },
                        "tile": {
                            "settings": {
                                "isMultiSelect": true,
                                "actions": [{
                                    "name": "delete",
                                    "icon": "pebble-icons:Delete",
                                    "eventName": "delete-item"
                                },
                                {
                                    "name": "edit",
                                    "icon": "pebble-md-icons:Edit",
                                    "eventName": "edit-item"
                                }
                                ]
                            },
                            "tileItems": {
                                "image": "productImageUrl",
                                "title": "displayname",
                                "id": "id",
                                "fields": [{
                                    "name": "description",
                                    "label": "Description",
                                    "noTrim": false
                                },
                                {
                                    "name": "stuscd",
                                    "label": "Status Code",
                                    "noTrim": true
                                }
                                ]
                            }
                        }
                    }
                },
                "rock-entity-quick-manage": {
                    "config": {
                        "rock-tabs": {
                            "scrollable": true,
                            "fitContainer": false,
                            "tabItems": [{
                                "name": "attributes",
                                "title": "Attributes",
                                "enableDropdownMenu": true,
                                "selected": true,
                                "component": {
                                    "name": "rock-attribute-manage",
                                    "path": "/src/elements/rock-attribute-manage/rock-attribute-manage.html",
                                    "properties": {
                                        "attributeGroups": [
                                            "coreAttributes"
                                        ],
                                        "context": {
                                            "attributeNames": [
                                                "displayname",
                                                "description",
                                                "enddate",
                                                "startdate",
                                                "stuscd",
                                                "orin",
                                                "productid",
                                                "onlineonly",
                                                "shortnm",
                                                "chnlcd",
                                                "trukitmin",
                                                "whseclasscd",
                                                "drctshprstrid",
                                                "disposalfeeid",
                                                "willcallrstrid",
                                                "questionalordqy"
                                            ]
                                        }
                                    }
                                },
                                "menuItems": [{
                                    "name": "core-attributes",
                                    "icon": "icons:add-box",
                                    "title": "Core Attributes",
                                    "component": {
                                        "name": "rock-attribute-manage",
                                        "path": "/src/elements/rock-attribute-manage/rock-attribute-manage.html",
                                        "properties": {
                                            "locales": [{
                                                "locale": "en-US",
                                                "language": "English"
                                            }],
                                            "source": "SAP",
                                            "list": "productMaster",
                                            "mode": "view",
                                            "no-of-columns": 1,
                                            "context": {
                                                "groupName": "Core Attributes",
                                                "attributeNames": [
                                                    "displayname",
                                                    "description",
                                                    "enddate",
                                                    "startdate",
                                                    "stuscd"
                                                ]
                                            }
                                        }
                                    }
                                }]
                            }]
                        },
                        "pebble-toolbar": {
                            "buttonItems": [{
                                "buttons": [{
                                    "name": "refresh",
                                    "icon": "pebble-md-icons:ToolbarRefresh",
                                    "text": "",
                                    "visible": true,
                                    "eventName": "refresh"
                                },
                                {
                                    "name": "moreActions",
                                    "icon": "pebble-md-icons:ToolbarMore",
                                    "text": "",
                                    "eventName": "moreActions",
                                    "buttons": [{
                                        "name": "add",
                                        "icon": "pebble-sm-icons:Add",
                                        "text": "",
                                        "visible": true,
                                        "eventName": "add"
                                    },
                                    {
                                        "name": "delete",
                                        "icon": "pebble-md-icons:Delete",
                                        "text": "",
                                        "visible": true,
                                        "eventName": "delete"
                                    },
                                    {
                                        "name": "cut",
                                        "icon": "pebble-md-icons:Cut",
                                        "text": "",
                                        "visible": true,
                                        "eventName": "cut"
                                    }
                                    ]
                                }
                                ]
                            }]
                        },
                        "rock-entity-tofix": {
                            "completionPercentage": 65,
                            "tofixes": [{
                                "data": {
                                    "name": "brandext",
                                    "type": "error",
                                    "label": "Images not associated",
                                    "eventName": "tofixtap"
                                }
                            },
                            {
                                "data": {
                                    "name": "priceissue",
                                    "type": "error",
                                    "label": "Required Attributes not provided",
                                    "eventName": "tofixtap"
                                }
                            },
                            {
                                "data": {
                                    "name": "msrpissue",
                                    "type": "error",
                                    "label": "Incorrect MSRP",
                                    "eventName": "tofixtap"
                                }
                            },
                            {
                                "data": {
                                    "name": "missingvideos",
                                    "type": "warning",
                                    "label": "Missing videos",
                                    "eventName": "tofixtap"
                                }
                            }
                            ]
                        }
                    }
                },
                "rock-saved-searches-tags": {
                    "config": {
                        "favourites": [{
                            "name": "favourites",
                            "icon": "pebble-icons:Star",
                            "text": "",
                            "visible": true,
                            "eventName": "favourite-saved-search"
                        },
                        {
                            "name": "delete",
                            "icon": "pebble-icons:Delete",
                            "text": "",
                            "visible": true,
                            "eventName": "delete-saved-search"
                        }
                        ],
                        "my-searches": [{
                            "name": "favourites",
                            "icon": "star-border",
                            "text": "",
                            "visible": true,
                            "eventName": "favourite-saved-search"
                        },
                        {
                            "name": "delete",
                            "icon": "pebble-icons:Delete",
                            "text": "",
                            "visible": true,
                            "eventName": "delete-saved-search"
                        }
                        ],
                        "shared-searches": [{
                            "name": "favourites",
                            "icon": "pebble-icons:Star",
                            "text": "",
                            "visible": true,
                            "eventName": "favourite-saved-search"
                        },
                        {
                            "name": "delete",
                            "icon": "pebble-icons:Delete",
                            "text": "",
                            "visible": true,
                            "eventName": "delete-saved-search"
                        }
                        ]
                    }
                }
            }
        }]
    },
    {
        "name": "app-entity-manage",
        "ctxInfo": [{
            "tenant": "jcp",
            "ctx": {
                "list": "productMaster"
            },
            "security": {
                "user": "",
                "role": ""
            },
            "components": {
                "rock-dimension-selector": {
                    "config": {
                        "catalogSelector": {
                            "visible": true,
                            "catalogItems": [{
                                "id": 1,
                                "title": "Product Master",
                                "subtitle": "Product Master",
                                "value": "productMaster",
                                "image": ""
                            },
                            {
                                "id": 2,
                                "title": "Web Catalog",
                                "subtitle": "Web Catalog",
                                "value": "webCatalog",
                                "image": ""
                            }
                            ],
                            "selectedCatalogItems": [{
                                "id": 1,
                                "title": "Product Master",
                                "subtitle": "Product Master",
                                "value": "productMaster",
                                "image": ""
                            }]
                        },
                        "sourceSelector": {
                            "visible": true,
                            "sourceItems": [{
                                "id": 1,
                                "title": "Internal Source",
                                "subtitle": "Internal Source",
                                "value": "internal",
                                "image": ""
                            }],
                            "selectedSourceItems": [{
                                "id": 1,
                                "title": "Internal source",
                                "subtitle": "Internal source",
                                "value": "internal",
                                "image": ""
                            }]
                        },
                        "localeSelector": {
                            "visible": true,
                            "localeItems": [{
                                "id": 1,
                                "title": "English - United States",
                                "subtitle": "English",
                                "value": "en-US",
                                "image": ""
                            },
                            {
                                "id": 2,
                                "title": "Spanish - Spain",
                                "subtitle": "Spanish",
                                "value": "es-SP",
                                "image": ""
                            }
                            ],
                            "selectedLocaleItems": [{
                                "id": 1,
                                "title": "English - United States",
                                "subtitle": "English",
                                "value": "en-US",
                                "image": ""
                            }]
                        }
                    }
                },
                "rock-dimension-grid": {
                    "config": {
                        "locales": [{
                            "id": 1,
                            "title": "en-US",
                            "subtitle": "en-US",
                            "image": "/src/images/lookup-item.jpg"
                        },
                        {
                            "id": 2,
                            "title": "es-SP",
                            "subtitle": "es-SP",
                            "image": "/src/images/lookup-item.jpg"
                        }
                        ],
                        "sources": [{
                            "id": 1,
                            "title": "internal",
                            "subtitle": "Internal",
                            "image": "/src/images/lookup-item.jpg"
                        }],
                        "contexts": [{
                            "id": 1,
                            "title": "productMaster",
                            "subtitle": "productMaster",
                            "image": "/src/images/lookup-item.jpg"
                        },
                        {
                            "id": 2,
                            "title": "webCatalog",
                            "subtitle": "Web Catalog",
                            "image": "/src/images/lookup-item.jpg"
                        }
                        ],
                        "dimension-gridConfig": {
                            "viewMode": "Tabular",
                            "title": "",
                            "mode": "Read",
                            "header": {
                                "displayTitle": false,
                                "defaultValue": ""
                            },
                            "tabular": {
                                "settings": {
                                    "isMultiSelect": true
                                },
                                "columns": [{
                                    "header": "Value",
                                    "name": "Value",
                                    "sortable": true,
                                    "filterable": false,
                                    "editType": "textbox"
                                },
                                {
                                    "header": "Locale",
                                    "name": "Locale",
                                    "sortable": true,
                                    "filterable": false
                                },
                                {
                                    "header": "Context",
                                    "name": "Context",
                                    "sortable": false,
                                    "filterable": false
                                },
                                {
                                    "header": "Source",
                                    "name": "Source",
                                    "sortable": true,
                                    "filterable": false
                                },
                                {
                                    "header": "Time",
                                    "name": "Time",
                                    "sortable": false,
                                    "filterable": false
                                }
                                ]
                            }
                        }
                    }
                },
                "rock-entity-header": {
                    "config": {
                        "headerConfig": [{
                            "attributeName": "skuid",
                            "label": "SKU ID",
                            "noTrim": false
                        },
                        {
                            "attributeName": "description",
                            "label": "Description",
                            "noTrim": false
                        },
                        {
                            "attributeName": "stuscd",
                            "label": "Status Code",
                            "noTrim": false
                        },
                        {
                            "attributeName": "startdate",
                            "label": "Start Date",
                            "noTrim": false
                        },
                        {
                            "attributeName": "enddate",
                            "label": "End Date",
                            "noTrim": false
                        },
                        {
                            "attributeName": "color",
                            "label": "Color",
                            "noTrim": false
                        }

                        ],
                        "toolbarConfig": {
                            "buttonItems": [{
                                "buttons": [{
                                    "name": "search",
                                    "icon": "pebble-md-icons:ToolbarSearch",
                                    "text": "",
                                    "visible": true,
                                    "eventName": "search"
                                },
                                {
                                    "name": "refresh",
                                    "icon": "pebble-md-icons:ToolbarRefresh",
                                    "text": "",
                                    "visible": true,
                                    "eventName": "refresh"
                                },
                                {
                                    "name": "copy",
                                    "icon": "pebble-md-icons:Copy",
                                    "text": "",
                                    "visible": true,
                                    "eventName": "copy"
                                },
                                {
                                    "name": "paste",
                                    "icon": "pebble-md-icons:Paste",
                                    "text": "",
                                    "visible": true,
                                    "eventName": "paste"
                                },
                                {
                                    "name": "clone",
                                    "icon": "pebble-md-icons:ToolbarShare",
                                    "text": "",
                                    "visible": true,
                                    "eventName": "clone"
                                },
                                {
                                    "name": "moreActions",
                                    "icon": "pebble-md-icons:ToolbarMore",
                                    "text": "",
                                    "eventName": "moreActions",
                                    "buttons": [{
                                        "name": "add",
                                        "icon": "pebble-sm-icons:Add",
                                        "text": "",
                                        "visible": true,
                                        "eventName": "add"
                                    },
                                    {
                                        "name": "delete",
                                        "icon": "pebble-md-icons:Delete",
                                        "text": "",
                                        "visible": true,
                                        "eventName": "delete"
                                    },
                                    {
                                        "name": "cut",
                                        "icon": "pebble-md-icons:Cut",
                                        "text": "",
                                        "visible": true,
                                        "eventName": "cut"
                                    }
                                    ]
                                }
                                ]
                            }]
                        },
                        "summaryToFix": {
                            "completionPercentage": 65,
                            "tofixes": [{
                                "data": {
                                    "name": "brandext",
                                    "type": "error",
                                    "label": "Images not associated",
                                    "eventName": "tofixtap"
                                }
                            },
                            {
                                "data": {
                                    "name": "priceissue",
                                    "type": "error",
                                    "label": "Required Attributes not provided",
                                    "eventName": "tofixtap"
                                }
                            },
                            {
                                "data": {
                                    "name": "msrpissue",
                                    "type": "error",
                                    "label": "Incorrect MSRP",
                                    "eventName": "tofixtap"
                                }
                            },
                            {
                                "data": {
                                    "name": "msrpissue",
                                    "type": "warning",
                                    "label": "Missing videos",
                                    "eventName": "tofixtap"
                                }
                            }
                            ]
                        }
                    }
                },
                "rock-entity-summary": {
                    "config": {
                        "widgets": [{
                            "name": "rock-entity-todo",
                            "nonClosable": true,
                            "nonMaximizable": true,
                            "nonDraggable": true,
                            "iconButtons": [{
                                "name": "settings",
                                "label": "Settings",
                                "icon": "icons:setting",
                                "click": "alert('settings');",
                                "disabled": false
                            },
                            {
                                "name": "help",
                                "label": "Help",
                                "icon": "icons:help",
                                "click": "alert('help');",
                                "disabled": false
                            }
                            ],
                            "config": {
                                "heading": "Things I can do",
                                "headerIcon": "",
                                "component": {
                                    "name": "rock-entity-todo",
                                    "path": "/src/elements/rock-entity-todo/rock-entity-todo.html"
                                }
                            }
                        },
                        {
                            "name": "rock-entity-tofix",
                            "nonClosable": true,
                            "nonMaximizable": true,
                            "nonDraggable": true,
                            "iconButtons": [{
                                "name": "settings",
                                "label": "Settings",
                                "icon": "icons:setting",
                                "click": "alert('settings');",
                                "disabled": false
                            },
                            {
                                "name": "help",
                                "label": "Help",
                                "icon": "icons:help",
                                "click": "alert('help');",
                                "disabled": false
                            }
                            ],
                            "config": {
                                "heading": "Things I need to fix",
                                "headerIcon": "",
                                "component": {
                                    "name": "rock-entity-tofix",
                                    "path": "/src/elements/rock-entity-tofix/rock-entity-tofix.html",
                                    "properties": {
                                        "view-mode": true
                                    }
                                }
                            }
                        }
                        ]
                    }
                },
                "rock-tabs": {
                    "config": {
                        "scrollable": true,
                        "fitContainer": false,
                        "tabItems": [{
                            "name": "summary",
                            "title": "Summary",
                            "enableDropdownMenu": false,
                            "component": {
                                "name": "rock-entity-summary",
                                "path": "/src/elements/rock-entity-summary/rock-entity-summary.html",
                                "properties": {}
                            }
                        },
                        {
                            "name": "attributes",
                            "title": "Attributes",
                            "enableDropdownMenu": true,
                            "selected": true,
                            "component": {
                                "name": "rock-attribute-split-screen",
                                "path": "/src/elements/rock-attribute-split-screen/rock-attribute-split-screen.html",
                                "properties": {
                                    "attributeGroups": [
                                        "coreAttributes",
                                        "buying",
                                        "selling"
                                    ],
                                    "context": {
                                        "attributeNames": [
                                            "color",
                                            "creationdate",
                                            "length",
                                            "width",
                                            "startdate",
                                            "enddate",
                                            "displayname",
                                            "description",
                                            "stuscd",
                                            "orin",
                                            "productid",
                                            "skuid",
                                            "categoryid",
                                            "longdescription",
                                            "onlineonly",
                                            "shortnm",
                                            "chnlcd",
                                            "trukitmin",
                                            "whseclasscd",
                                            "drctshprstrid",
                                            "disposalfeeid",
                                            "willcallrstrid",
                                            "questionalordqy",
                                            "lottypcd",
                                            "skutype",
                                            "skunb",
                                            "rtlskunb",
                                            "hidedsplin",
                                            "skuqy",
                                            "barcodecd",
                                            "whitegloveddlvryin",
                                            "styletx",
                                            "lotselntypcd",
                                            "noncontntlprepaidcd",
                                            "contntlprepaidcd",
                                            "unusualdmdqy",
                                            "mlblitmin",
                                            "prodlengthnb",
                                            "prodheightnb",
                                            "prodwtnb",
                                            "prodwidthnb",
                                            "cmrclcarrcd",
                                            "noncmrclcarrcd",
                                            "sabrixcommoditycd",
                                            "pgmtypcd",
                                            "spclin",
                                            "parantheticam",
                                            "willcallfsin",
                                            "intlshippablein",
                                            "mfrnm",
                                            "origcntrycd",
                                            "szunittx",
                                            "sephorain",
                                            "isrecyclablein",
                                            "modelnb",
                                            "frnin"
                                        ]
                                    }
                                }
                            },
                            "menuItems": [{
                                "name": "coreAttributes",
                                "icon": "icons:add-box",
                                "title": "Core Attributes",
                                "component": {
                                    "name": "rock-attribute-split-screen",
                                    "path": "/src/elements/rock-attribute-split-screen/rock-attribute-split-screen.html",
                                    "properties": {
                                        "locales": [{
                                            "locale": "en-US",
                                            "language": "English"
                                        }],
                                        "source": "internal",
                                        "list": "productMaster",
                                        "mode": "view",
                                        "no-of-columns": 2,
                                        "context": {
                                            "groupName": "Core Attributes",
                                            "attributeNames": [
                                                "creationdate",
                                                "startdate",
                                                "enddate",
                                                "displayname",
                                                "description",
                                                "stuscd",
                                                "orin",
                                                "productid",
                                                "skuid",
                                                "categoryid",
                                                "longdescription"
                                            ]
                                        }
                                    }
                                }
                            },
                            {
                                "name": "buying",
                                "title": "Buying Attributes",
                                "icon": "icons:add-box",
                                "component": {
                                    "name": "rock-attribute-split-screen",
                                    "path": "/src/elements/rock-attribute-split-screen/rock-attribute-split-screen.html",
                                    "properties": {
                                        "locales": [{
                                            "locale": "en-US",
                                            "language": "English"
                                        }],
                                        "source": "internal",
                                        "list": "productMaster",
                                        "mode": "view",
                                        "no-of-columns": 2,
                                        "context": {
                                            "groupName": "Buying Attributes",
                                            "attributeNames": [
                                                "onlineonly",
                                                "shortnm",
                                                "chnlcd",
                                                "trukitmin",
                                                "whseclasscd",
                                                "drctshprstrid",
                                                "disposalfeeid",
                                                "willcallrstrid",
                                                "questionalordqy",
                                                "lottypcd",
                                                "skutype",
                                                "skunb",
                                                "rtlskunb",
                                                "hidedsplin",
                                                "skuqy",
                                                "barcodecd"
                                            ]
                                        }
                                    }
                                }
                            },
                            {
                                "name": "selling",
                                "title": "Selling Attributes",
                                "icon": "icons:add-box",
                                "component": {
                                    "name": "rock-attribute-split-screen",
                                    "path": "/src/elements/rock-attribute-split-screen/rock-attribute-split-screen.html",
                                    "properties": {
                                        "locales": [{
                                            "locale": "en-US",
                                            "language": "English"
                                        }],
                                        "source": "internal",
                                        "list": "productMaster",
                                        "mode": "view",
                                        "no-of-columns": 3,
                                        "context": {
                                            "groupName": "Selling Attributes",
                                            "attributeNames": [
                                                "whitegloveddlvryin",
                                                "styletx",
                                                "lotselntypcd",
                                                "noncontntlprepaidcd",
                                                "contntlprepaidcd",
                                                "unusualdmdqy",
                                                "mlblitmin",
                                                "prodlengthnb",
                                                "prodheightnb",
                                                "prodwtnb",
                                                "prodwidthnb",
                                                "cmrclcarrcd",
                                                "noncmrclcarrcd",
                                                "sabrixcommoditycd",
                                                "pgmtypcd",
                                                "spclin",
                                                "parantheticam",
                                                "willcallfsin",
                                                "intlshippablein",
                                                "mfrnm",
                                                "origcntrycd",
                                                "szunittx",
                                                "sephorain",
                                                "isrecyclablein",
                                                "modelnb",
                                                "frnin"
                                            ]
                                        }
                                    }
                                }
                            },
                            {
                                "name": "merchPlanning",
                                "title": "Merch Planning",
                                "icon": "icons:add-box",
                                "component": {
                                    "name": "rock-attribute-split-screen",
                                    "path": "/src/elements/rock-attribute-split-screen/rock-attribute-split-screen.html",
                                    "properties": {
                                        "locales": [{
                                            "locale": "en-US",
                                            "language": "English"
                                        }],
                                        "source": "SAP",
                                        "list": "productMaster",
                                        "mode": "view",
                                        "no-of-columns": 3,
                                        "context": {
                                            "groupName": "Merch Planning",
                                            "attributeNames": [
                                                "color",
                                                "length",
                                                "width",
                                                "sleeve",
                                                "size",
                                                "waist",
                                                "cup",
                                                "chest",
                                                "necksize",
                                                "inseam",
                                                "patternname",
                                                "pdbcolorfamily",
                                                "letterornumber",
                                                "alphacharacter",
                                                "pattern",
                                                "woodfinish",
                                                "colorfamily",
                                                "minorcolorfamily",
                                                "pdbcolor",
                                                "numericvalue"
                                            ]
                                        }
                                    }
                                }
                            },
                            {
                                "name": "seoAttributes",
                                "title": "SEO Attributes",
                                "icon": "icons:add-box",
                                "component": {
                                    "name": "rock-attribute-split-screen",
                                    "path": "/src/elements/rock-attribute-split-screen/rock-attribute-split-screen.html",
                                    "properties": {
                                        "locales": [{
                                            "locale": "en-US",
                                            "language": "English"
                                        }],
                                        "source": "internal",
                                        "list": "productMaster",
                                        "mode": "view",
                                        "no-of-columns": 2,
                                        "context": {
                                            "groupName": "SEO Attributes",
                                            "attributeNames": [
                                                "seotagtx",
                                                "seodsplnm",
                                                "canonicalurl",
                                                "disableadsin",
                                                "disablegoogleadsensein",
                                                "ncldseotagin",
                                                "shortnm",
                                                "medialtrcd",
                                                "mediayrid",
                                                "hidein",
                                                "prodreviewtx",
                                                "feathdrtx",
                                                "featquotetx"
                                            ]
                                        }
                                    }
                                }
                            },
                            {
                                "name": "copy",
                                "title": "Copy and Description",
                                "icon": "icons:add-box",
                                "component": {
                                    "name": "rock-attribute-split-screen",
                                    "path": "/src/elements/rock-attribute-split-screen/rock-attribute-split-screen.html",
                                    "properties": {
                                        "locales": [{
                                            "locale": "en-US",
                                            "language": "English"
                                        }],
                                        "source": "internal",
                                        "list": "productMaster",
                                        "mode": "view",
                                        "no-of-columns": 3,
                                        "context": {
                                            "groupName": "Copy and Description",
                                            "attributeNames": [
                                                "longcpytx",
                                                "secondarycpytx",
                                                "insprtnlcpytx",
                                                "alsoinstrin",
                                                "promotionalimcntntid",
                                                "ratingreviewid",
                                                "swatchimct"
                                            ]
                                        }
                                    }
                                }
                            }
                            ]
                        },
                        {
                            "name": "relationships",
                            "title": "Relationships",
                            "enableDropdownMenu": true,
                            "component": {
                                "name": "rock-relationship-split-screen",
                                "path": "/src/elements/rock-relationship-split-screen/rock-relationship-split-screen.html",
                                "properties": {
                                    "mode": "view",
                                    "no-of-columns": 2,
                                    "context": {
                                        "relationshipTypeName": "Relationships"
                                    }
                                }
                            },
                            "menuItems": [{
                                "name": "isChildOf",
                                "title": "Variants",
                                "icon": "icons:cloud-upload",
                                "component": {
                                    "name": "rock-relationship-split-screen",
                                    "path": "/src/elements/rock-relationship-split-screen/rock-relationship-split-screen.html",
                                    "properties": {
                                        "locales": [{
                                            "locale": "en-US",
                                            "language": "English"
                                        }],
                                        "source": "internal",
                                        "list": "productMaster",
                                        "mode": "view",
                                        "no-of-columns": 1,
                                        "context": {
                                            "relationshipTypeName": "isChildOf"
                                        }
                                    }
                                }
                            },
                            {
                                "name": "productPresentationToLot",
                                "title": "Lots",
                                "icon": "icons:cloud-upload",
                                "component": {
                                    "name": "rock-relationship-split-screen",
                                    "path": "/src/elements/rock-relationship-split-screen/rock-relationship-split-screen.html",
                                    "properties": {
                                        "locales": [{
                                            "locale": "en-US",
                                            "language": "English"
                                        }],
                                        "source": "internal",
                                        "list": "productMaster",
                                        "mode": "view",
                                        "no-of-columns": 1,
                                        "context": {
                                            "relationshipTypeName": "productPresentationToLot"
                                        }
                                    }
                                }
                            }
                            ]
                        },
                        {
                            "name": "assets",
                            "title": "Assets",
                            "enableDropdownMenu": false,
                            "component": {
                                "name": "app-entity-discovery",
                                "path": "/src/elements/app-entity-discovery/app-entity-discovery.html",
                                "properties": {}
                            }
                        }
                        ]
                    }
                },
                "rock-attribute-manage": {
                    "config": {
                        "messageCodeMapping": {
                            "Req001": "Required",
                            "MinLen001": "MIN_LENGTH",
                            "MaxLen001": "MAX_LENGTH",
                            "AlVal001": "ALLOWED_VALUES",
                            "Prec001": "Precision",
                            "Range001": "RANGE_FROM_INCLUSIVE",
                            "Range002": "RANGE_TO_INCLUSIVE",
                            "Range003": "RANGE_FROM_EXCLUSIVE",
                            "Range004": "RANGE_TO_EXCLUSIVE",
                            "Range005": "RANGE_TO_INCLUSIVE_FROM_EXCLUSIVE",
                            "Range006": "RANGE_TO_INCLUSIVE_FROM_INCLUSIVE",
                            "Range007": "RANGE_TO_EXCLUSIVE_FROM_EXCLUSIVE",
                            "Range008": "RANGE_TO_EXCLUSIVE_FROM_INCLUSIVE",
                            "133311": "Length should be greater than Width",
                            "133312": "Width should be less than Length"
                        }
                    }
                },
                "rock-entity-variant": {
                    "config": {
                        "variantGridConfig": {
                            "viewMode": "Tabular",
                            "title": "Variant Data Table",
                            "mode": "Read",
                            "schemaType": "attribute",
                            "dataRequest": {
                                "relatedEntityAttributes": ["shortDescription", "rmsSkuId", "nrfColorCode", "nrfSizeCode"]
                            },
                            "tabular": {
                                "settings": {
                                    "isMultiSelect": true,
                                    "actions": [{
                                        "name": "delete",
                                        "icon": "pebble-icons:Delete",
                                        "eventName": "delete-item"
                                    },
                                    {
                                        "name": "edit"
                                    }
                                    ]
                                },
                                "columns": [{
                                    "header": "Short Description",
                                    "name": "shortDescription",
                                    "sortable": false,
                                    "filterable": false
                                },
                                {
                                    "header": "RMS SKU ID",
                                    "name": "rmsSkuId",
                                    "sortable": false,
                                    "filterable": false
                                },
                                {
                                    "header": "NRF Color Code",
                                    "name": "nrfColorCode",
                                    "sortable": false,
                                    "filterable": false
                                },
                                {
                                    "header": "NRF Size Code",
                                    "name": "nrfSizeCode",
                                    "sortable": false,
                                    "filterable": false
                                }
                                ]
                            },
                            "list": {
                                "settings": {
                                    "isMultiSelect": true,
                                    "actions": [{
                                        "name": "delete",
                                        "icon": "pebble-icons:Delete",
                                        "eventName": "delete-item"
                                    },
                                    {
                                        "name": "edit",
                                        "icon": "pebble-md-icons:Edit",
                                        "eventName": "edit-item"
                                    }
                                    ]
                                },
                                "listItems": {
                                    "image": "productImage",
                                    "title": "longName",
                                    "id": "id",
                                    "fields": [{
                                        "name": "productType",
                                        "label": "Product Type"
                                    },
                                    {
                                        "name": "description",
                                        "label": "Description",
                                        "noTrim": true
                                    },
                                    {
                                        "name": "isNew",
                                        "label": "isNew",
                                        "noTrim": true
                                    },
                                    {
                                        "name": "isApproved",
                                        "label": "isApproved",
                                        "noTrim": true
                                    }
                                    ]
                                }
                            },
                            "tile": {
                                "settings": {
                                    "isMultiSelect": true,
                                    "actions": [{
                                        "name": "delete",
                                        "icon": "pebble-icons:Delete",
                                        "eventName": "delete-item"
                                    },
                                    {
                                        "name": "edit",
                                        "icon": "pebble-md-icons:Edit",
                                        "eventName": "edit-item"
                                    }
                                    ]
                                },
                                "tileItems": {
                                    "image": "productImage",
                                    "title": "longName",
                                    "id": "id",
                                    "fields": [{
                                        "name": "productType",
                                        "label": "Product Type"
                                    },
                                    {
                                        "name": "description",
                                        "label": "Description"
                                    }
                                    ]
                                }
                            }
                        },
                        "variantDefinitionUI": {
                            "name": "ehd1",
                            "levels": [{
                                    "entityType": "sku",
                                    "index": 1,
                                    "optional": false,
                                    "dimensionAttributes": [{
                                            "sourceAttribute": "color",
                                            "targetAttribute": "color",
                                            "optional": false
                                        },
                                        {
                                            "sourceAttribute": "size",
                                            "targetAttribute": "size",
                                            "optional": true
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                },
                "rock-relationship-manage": {
                    "config": {
                        "productPresentationToLot": {
                            "viewMode": "Tabular",
                            "mode": "Read",
                            "title": "Product Presentation To Lot",
                            "schemaType": "colModel",
                            "statusEnabled": true,
                            "tabular": {
                                "settings": {
                                    "isMultiSelect": true,
                                    "actions": [{
                                        "name": "delete",
                                        "icon": "pebble-icons:Delete",
                                        "eventName": "delete-item"
                                    }]
                                },
                                "columns": [{
                                    "header": "Related Entity",
                                    "name": "Related Entity",
                                    "sortable": true,
                                    "filterable": false,
                                    "editType": "",
                                    "isRelatedEntityAttribute": false,
                                    "linkTemplate": "entity-manage?id={id}&type={entityType}"
                                },
                                {
                                    "header": "status",
                                    "name": "status",
                                    "sortable": true,
                                    "filterable": false,
                                    "editType": "",
                                    "isRelatedEntityAttribute": false
                                }, {
                                    "header": "Display Name",
                                    "name": "displayname",
                                    "sortable": true,
                                    "filterable": false,
                                    "editType": "",
                                    "isRelatedEntityAttribute": true
                                }
                                ]
                            }
                        },
                        "productPresentationToImage": {
                            "viewMode": "Tabular",
                            "mode": "Read",
                            "title": "Product Presentation To Image",
                            "schemaType": "colModel",
                            "statusEnabled": true,
                            "tabular": {
                                "settings": {
                                    "isMultiSelect": true,
                                    "actions": [{
                                        "name": "delete",
                                        "icon": "pebble-icons:Delete",
                                        "eventName": "delete-item"
                                    }]
                                },
                                "columns": [{
                                    "header": "Related Entity",
                                    "name": "Related Entity",
                                    "sortable": true,
                                    "filterable": false,
                                    "editType": "",
                                    "isRelatedEntityAttribute": false,
                                    "linkTemplate": "entity-manage?id={id}&type={entityType}"

                                },
                                {
                                    "header": "Descriptioin",
                                    "name": "discription",
                                    "sortable": true,
                                    "filterable": false,
                                    "editType": "",
                                    "isRelatedEntityAttribute": true
                                }, {
                                    "header": "Short NM",
                                    "name": "shortnm",
                                    "sortable": true,
                                    "filterable": false,
                                    "editType": "",
                                    "isRelatedEntityAttribute": true
                                }
                                ]
                            }
                        }
                    }
                },
                "rock-entity-todo": {
                    "config": {
                        "todos": [{
                            "icon": {
                                "name": "pebble-xl-icons:Brand"
                            },
                            "data": {
                                "name": "assignPrimaryImage",
                                "label": "Assign Primary Image",
                                "eventName": "todotap"
                            }
                        },
                        {
                            "icon": {
                                "name": "pebble-xl-icons:Channel"
                            },
                            "data": {
                                "name": "newChannel",
                                "label": "Introduce to new channel",
                                "eventName": "todotap"
                            }
                        },
                        {
                            "icon": {
                                "name": "pebble-xl-icons:Crosssell"
                            },
                            "data": {
                                "name": "addnewvpn",
                                "label": "Assign Supplier Number",
                                "eventName": "todotap"
                            }
                        }
                        ]
                    }
                },
                "rock-entity-tofix": {
                    "config": {
                        "completionPercentage": 65,
                        "tofixes": [{
                            "data": {
                                "name": "brandext",
                                "type": "error",
                                "label": "Images not associated",
                                "eventName": "tofixtap"
                            }
                        },
                        {
                            "data": {
                                "name": "priceissue",
                                "type": "error",
                                "label": "Required Attributes not provided",
                                "eventName": "tofixtap"
                            }
                        },
                        {
                            "data": {
                                "name": "msrpissue",
                                "type": "error",
                                "label": "Incorrect MSRP",
                                "eventName": "tofixtap"
                            }
                        },
                        {
                            "data": {
                                "name": "msrpissue",
                                "type": "warning",
                                "label": "Missing videos",
                                "eventName": "tofixtap"
                            }
                        }
                        ]
                    }
                },
                "rock-titlebar": {
                    "config": {
                        "image": "",
                        "titleAttribute": "displayname",
                        "subtitleAttribute": "description"
                    }
                }
            }
        }]
    },
    {
        "name": "app-dashboard",
        "ctxInfo": [{
            "tenant": "jcp",
            "ctx": {
                "list": "productMaster"
            },
            "security": {
                "user": "",
                "role": ""
            },
            "components": {
                "rock-saved-searches": {
                    "config": {
                        "favourites": [{
                            "id": 1,
                            "accesstype": "self",
                            "name": "Womens Shoes",
                            "icon": "pebble-icons:SavedSearch",
                            "dimensions": {
                                "catalog": "productMaster",
                                "Source": "internal",
                                "Locale": "en-US",
                                "TimeSlice": "Now"
                            },
                            "searchQuery": "",
                            "searchTags": [{
                                "name": "description",
                                "longName": "Description",
                                "displayType": "textBox",
                                "value": {
                                    "eq": "Womens"
                                }
                            }]
                        }],
                        "my-searches": [{
                            "id": 2,
                            "accesstype": "self",
                            "name": "Mens Shoes",
                            "icon": "pebble-icons:SavedSearch",
                            "shared": false,
                            "dimensions": {
                                "catalog": "productMaster",
                                "Source": "internal",
                                "Locale": "en-US",
                                "TimeSlice": "Now"
                            },
                            "searchQuery": "",
                            "searchTags": [{
                                "name": "description",
                                "longName": "Description",
                                "displayType": "textBox",
                                "value": {
                                    "eq": "Mens"
                                }
                            }]
                        }],
                        "shared-searches": [{
                            "id": 3,
                            "accesstype": "self",
                            "name": "Women's Sport Wear & Dresses",
                            "icon": "pebble-icons:SavedSearch",
                            "shared": true,
                            "dimensions": {
                                "catalog": "productMaster",
                                "Source": "internal",
                                "Locale": "en-US",
                                "TimeSlice": "Now"
                            },
                            "searchQuery": "dresses",
                            "searchTags": [{
                                "name": "description",
                                "longName": "Description",
                                "displayType": "textBox",
                                "value": {
                                    "eq": "dresses"
                                }
                            }]
                        }]
                    }
                },
                "rock-widget-panel": {
                    "config": {
                        "widgets": [{
                            "name": "rock-my-todos",
                            "nonClosable": true,
                            "nonMaximizable": false,
                            "nonDraggable": false,
                            "iconButtons": "",
                            "config": {
                                "heading": "My To Do's",
                                "headerIcon": "pebble-lg-icons:MyToDoIcon",
                                "component": {
                                    "name": "rock-my-todos",
                                    "path": "/src/elements/rock-my-todos/rock-my-todos.html"
                                }
                            }
                        },
                        {
                            "name": "rock-saved-searches",
                            "nonClosable": true,
                            "nonMaximizable": false,
                            "nonDraggable": false,
                            "iconButtons": "",
                            "config": {
                                "heading": "Saved Searches",
                                "headerIcon": "pebble-lg-icons:SavedSearchmain",
                                "component": {
                                    "name": "rock-saved-searches",
                                    "path": "/src/elements/rock-saved-searches/rock-saved-searches.html",
                                    "properties": {
                                        "view-mode": true
                                    }
                                }
                            }
                        }
                        ]
                    }
                },
                "my-todo-summary-list": {
                    "config": [{
                        "id": 1,
                        "name": "New SKUs to Submit",
                        "numberOfTasks": 1037,
                        "workflow": "New Product Setup",
                        "unAssigned": 1007,
                        "assignedToMe": 30,
                        "status": "red",
                        "products": [{
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        }
                        ]
                    },
                    {
                        "id": 2,
                        "name": "Provide Additional Information",
                        "numberOfTasks": 23,
                        "workflow": "New Product Setup",
                        "unAssigned": 23,
                        "assignedToMe": 0,
                        "status": "red",
                        "products": [{
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        }
                        ]
                    },
                    {
                        "id": 3,
                        "name": "Rejected SKUs",
                        "numberOfTasks": 26,
                        "workflow": "New Product Setup",
                        "unAssigned": 25,
                        "assignedToMe": 1,
                        "status": "red",
                        "products": [{
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        }
                        ]
                    },
                    {
                        "id": 4,
                        "name": "Review Assortment",
                        "numberOfTasks": 34,
                        "workflow": "New Product Setup",
                        "unAssigned": 4,
                        "assignedToMe": 30,
                        "status": "orange",
                        "products": [{
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        }
                        ]
                    },
                    {
                        "id": 5,
                        "name": "Assign Internal Information",
                        "numberOfTasks": 4,
                        "workflow": "New Product Setup",
                        "unAssigned": 4,
                        "assignedToMe": 0,
                        "status": "orange",
                        "products": [{
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        }
                        ]
                    },
                    {
                        "id": 6,
                        "name": "Enrich Copy",
                        "numberOfTasks": 6,
                        "workflow": "New Product Setup",
                        "unAssigned": 4,
                        "assignedToMe": 2,
                        "status": "green",
                        "products": [{
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        }
                        ]
                    },
                    {
                        "id": 7,
                        "name": "Enrich with Digital Assets",
                        "numberOfTasks": 74,
                        "workflow": "New Product Setup",
                        "unAssigned": 43,
                        "assignedToMe": 31,
                        "status": "green",
                        "products": [{
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        }
                        ]
                    }
                    ]
                },
                "my-todo-detail-view-list": {
                    "config": [{
                        "id": 1,
                        "name": "New SKUs to Submit",
                        "numberOfTasks": 1037,
                        "workflow": "New Product Setup",
                        "unAssigned": 1007,
                        "assignedToMe": 30,
                        "status": "red",
                        "products": [{
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        }
                        ]
                    },
                    {
                        "id": 2,
                        "name": "Provide Additional Information",
                        "numberOfTasks": 23,
                        "workflow": "New Product Setup",
                        "unAssigned": 23,
                        "assignedToMe": 0,
                        "status": "red",
                        "products": [{
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        }
                        ]
                    },
                    {
                        "id": 3,
                        "name": "Rejected SKUs",
                        "numberOfTasks": 26,
                        "workflow": "New Product Setup",
                        "unAssigned": 25,
                        "assignedToMe": 1,
                        "status": "red",
                        "products": [{
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        }
                        ]
                    },
                    {
                        "id": 4,
                        "name": "Review Assortment",
                        "numberOfTasks": 34,
                        "workflow": "New Product Setup",
                        "unAssigned": 4,
                        "assignedToMe": 30,
                        "status": "orange",
                        "products": [{
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        }
                        ]
                    },
                    {
                        "id": 5,
                        "name": "Assign Internal Information",
                        "numberOfTasks": 4,
                        "workflow": "New Product Setup",
                        "unAssigned": 4,
                        "assignedToMe": 0,
                        "status": "orange",
                        "products": [{
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        }
                        ]
                    },
                    {
                        "id": 6,
                        "name": "Enrich Copy",
                        "numberOfTasks": 6,
                        "workflow": "New Product Setup",
                        "unAssigned": 4,
                        "assignedToMe": 2,
                        "status": "green",
                        "products": [{
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        }
                        ]
                    },
                    {
                        "id": 7,
                        "name": "Enrich with Digital Assets",
                        "numberOfTasks": 74,
                        "workflow": "New Product Setup",
                        "unAssigned": 43,
                        "assignedToMe": 31,
                        "status": "green",
                        "products": [{
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        },
                        {
                            "name": "Complexion Rescue Tinted Hydrating Gel Cream Broad Spectrum SPF 30",
                            "id": 2283289,
                            "vendorName": "Aquaphor",
                            "categoryPath": "/Skin Care/Moisturizers",
                            "imageUrl": "../../../../bower_components/iron-image/demo/polymer.svg"
                        }
                        ]
                    }
                    ]
                },
                "rock-saved-searches-tags": {
                    "config": {
                        "favourites": [{
                            "name": "favourites",
                            "icon": "pebble-icons:Star",
                            "text": "",
                            "visible": true,
                            "eventName": "favourite-saved-search"
                        },
                        {
                            "name": "delete",
                            "icon": "pebble-icons:Delete",
                            "text": "",
                            "visible": true,
                            "eventName": "delete-saved-search"
                        }
                        ],
                        "my-searches": [{
                            "name": "favourites",
                            "icon": "star-border",
                            "text": "",
                            "visible": true,
                            "eventName": "favourite-saved-search"
                        },
                        {
                            "name": "delete",
                            "icon": "pebble-icons:Delete",
                            "text": "",
                            "visible": true,
                            "eventName": "delete-saved-search"
                        }
                        ],
                        "shared-searches": [{
                            "name": "favourites",
                            "icon": "pebble-icons:Star",
                            "text": "",
                            "visible": true,
                            "eventName": "favourite-saved-search"
                        },
                        {
                            "name": "delete",
                            "icon": "pebble-icons:Delete",
                            "text": "",
                            "visible": true,
                            "eventName": "delete-saved-search"
                        }
                        ]
                    }
                }
            }
        }]
    },
    {
        "name": "app-business-function",
        "ctxInfo": [{
            "tenant": "jcp",
            "ctx": {
                "list": "productMaster"
            },
            "security": {
                "user": "",
                "role": ""
            },
            "components": {
                "rock-wizard": {
                    "config": {
                        "stepperConfig": [{
                            "index": "1",
                            "label": "",
                            "status": "inprogress"
                        },
                        {
                            "index": "2",
                            "label": "",
                            "status": ""
                        },
                        {
                            "index": "3",
                            "label": "",
                            "status": ""
                        }
                        ],
                        "name": "create-entity",
                        "label": "Create",
                        "steps": [{
                            "name": "step-1-fill-initial-data",
                            "label": "Fill Data for New Entity",
                            "component": {
                                "name": "rock-entity-create",
                                "path": "/../../src/elements/rock-entity-create/rock-entity-create.html",
                                "properties": {
                                    "import-profile-name": "Entity Import - RSExcel 2.0",
                                    "attribute-names": [
                                        "skuid",
                                        "productid",
                                        "lottype",
                                        "skutype",
                                        "displayname",
                                        "description",
                                        "startdate",
                                        "enddate"
                                    ]
                                }
                            },
                            "nextEvent": "onSave",
                            "skipEvent": "onCancel"
                        }]
                    }
                },
                "rock-variants-create-grid": {
                    "config": {
                        "createVariantsGridConfig": {
                            "viewMode": "Tabular",
                            "title": "Variant Data Table",
                            "mode": "Read",
                            "schemaType": "simple",
                            "tabular": {
                                "settings": {
                                    "isMultiSelect": true,
                                    "actions": [{
                                        "name": "delete",
                                        "icon": "pebble-icons:Delete",
                                        "eventName": "delete-item"
                                    }]
                                },
                                "columns": [{
                                    "header": "Entity",
                                    "name": "Entity",
                                    "sortable": false,
                                    "filterable": false
                                },
                                {
                                    "header": "Existing",
                                    "name": "existing",
                                    "sortable": false,
                                    "filterable": false
                                },
                                {
                                    "header": "Colors",
                                    "name": "colors",
                                    "sortable": false,
                                    "filterable": false
                                },
                                {
                                    "header": "Materials",
                                    "name": "materials",
                                    "sortable": false,
                                    "filterable": false
                                },
                                {
                                    "header": "Primary Sizes",
                                    "name": "primarySizes",
                                    "sortable": false,
                                    "filterable": false
                                },
                                {
                                    "header": "Secondary Sizes",
                                    "name": "secondarySizes",
                                    "sortable": false,
                                    "filterable": false
                                }
                                ]
                            }
                        },
                        "variantDefinitionExternal": {
                            "levels": [{
                                "entityType": "choice",
                                "index": 1,
                                "dimensions": [{
                                    "sourceAttribute": "colors",
                                    "targetAttribute": "choiceColor",
                                    "optional": false
                                },
                                {
                                    "sourceAttribute": "materials",
                                    "targetAttribute": "choiceMaterial",
                                    "optional": false
                                }
                                ]
                            },
                            {
                                "entityType": "sku",
                                "index": 2,
                                "dimensions": [{
                                    "sourceAttribute": "primarySizes",
                                    "targetAttribute": "skuSize1",
                                    "optional": false
                                },
                                {
                                    "sourceAttribute": "secondarySizes",
                                    "targetAttribute": "skuSize2",
                                    "optional": false
                                }
                                ]
                            }
                            ]
                        },
                        "businessFunctionVariantsCreate": {
                            "stepperConfig": [{
                                "index": "1",
                                "title": "Option Selection",
                                "status": "inprogress"
                            },
                            {
                                "index": "2",
                                "title": "Create Variants",
                                "status": ""
                            }
                            ],
                            "name": "create-variants",
                            "label": "Create Variants",
                            "steps": [{
                                "name": "step-1-selection-option",
                                "label": "Select Options to create Skus",
                                "component": {
                                    "name": "rock-variants-option-select",
                                    "path": "/../../src/elements/rock-variants-option-select/rock-variants-option-select.html",
                                    "properties": {}
                                },
                                "nextEvent": "onSave",
                                "skipEvent": "onCancel"
                            },
                            {
                                "name": "step-2-create-variants",
                                "label": "Create variants for a given entity",
                                "component": {
                                    "name": "rock-variants-create-grid",
                                    "path": "/../../src/elements/rock-variants-create-grid/rock-variants-create-grid.html",
                                    "properties": {}
                                },
                                "nextEvent": "onComplete",
                                "skipEvent": "onCancel"
                            }
                            ]
                        }
                    }
                }
            }
        }]
    }
    ]
};

module.exports = {
    'allConfigs': allConfigs
};