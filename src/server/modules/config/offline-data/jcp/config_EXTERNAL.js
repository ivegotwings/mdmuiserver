var allConfigs = {
    "configs": [{
        "name": "main-app",
        "contexts": [{
            "tenant": "jcp",
            "ctx": {
                "list": "productMaster"
            },
            "security": {
                "user": "",
                "role": ""
            },
            "components": {
                 "app-repository": {
                    "config": {
                        "dashboard": {
                            "title": "Dashboard",
                            "data_route": "dashboard",
                            "icon": "pebble-icons:Dashboard",
                            "nonClosable": true,
                            "nonMinimizable": true,
                            "component": {
                                "name": "app-dashboard",
                                "path": "../../src/elements/app-dashboard/app-dashboard.html",
                                "properties": {
                                    "mode": "edit"
                                }
                            }
                        },
                        "entity-discovery": {
                            "title": "Entity Search & Discovery",
                            "data_route": "entity-discovery",
                            "icon": "pebble-icons:Search",
                            "nonClosable": true,
                            "nonMinimizable": true,
                            "component": {
                                "name": "app-entity-discovery",
                                "path": "../../src/elements/app-entity-discovery/app-entity-discovery.html",
                                "properties": {}
                            }
                        },
                        "entity-manage": {
                            "title": "Entity Manage",
                            "data_route": "entity-manage",
                            "icon": "pebble-icons:Entities",
                            "component": {
                                "name": "app-entity-manage",
                                "path": "../../src/elements/app-entity-manage/app-entity-manage.html",
                                "properties": {}
                            }
                        },
                        "entity-create": {
                            "title": "Create Entity",
                            "data_route": "entity-create",
                            "icon": "pebble-icons:Entities",
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
                            "title": "Manage Model",
                            "data_route": "manage-model",
                            "icon": "pebble-icons:DataModelDb",
                            "nonClosable": true,
                            "nonMinimizable": true,
                            "component": {
                                "name": "",
                                "path": ""
                            }
                        },
                        "manage-integration": {
                            "title": "Manage Integration",
                            "data_route": "manage-integration",
                            "icon": "pebble-icons:IntegrationsDb",
                            "nonClosable": true,
                            "nonMinimizable": true,
                            "component": {
                                "name": "",
                                "path": ""
                            }
                        },
                        "app-store": {
                            "title": "App Store",
                            "data_route": "app-store",
                            "icon": "pebble-icons:AppsDb",
                            "nonClosable": true,
                            "nonMinimizable": true,
                            "component": {
                                "name": "",
                                "path": ""
                            }
                        }
                    }
                },
                "pebble-actions": {
                    "config": {
                        "title": "Create",
                        "actions": [{
                            "name": "createSKU",
                            "icon": "pebble-xl-icons:Product",
                            "text": "SKU",
                            "visible": true,
                            "dataRoute": "entity-create",
                            "contextData": {
                                "itemContext": {
                                    "type": "sku"
                                },
                                "valueContext": {
                                    "source": "internal",
                                    "locale": "en-US"
                                },
                                "context": {
                                    "channel": "webCatalog",
                                    "classification": "_ALL"
                                }
                            }
                        },
                        {
                            "name": "createKit",
                            "icon": "pebble-xl-icons:Kit",
                            "text": "PDP",
                            "visible": true,
                            "dataRoute": "entity-create",
                            "contextData": {
                                "itemContext": {
                                    "type": "pdp"
                                },
                                "valueContext": {
                                    "source": "internal",
                                    "locale": "en-US"
                                },
                                "context": {
                                    "channel": "productMaster",
                                    "classification": "_ALL"
                                }
                            }
                        },
                        {
                            "name": "createSupplier",
                            "icon": "pebble-xl-icons:Customer",
                            "text": "Create Suplier",
                            "visible": true,
                            "dataRoute": "entity-create",
                            "contextData": {
                                "itemContext": {
                                    "type": "supplier"
                                },
                                "valueContext": {
                                    "source": "internal",
                                    "locale": "en-US"
                                },
                                "context": {
                                    "channel": "productMaster",
                                    "classification": "_ALL"
                                }
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
                        "icon": "pebble-lg-icons:Userdashboard",
                        "isLandingPage": true
                    },
                    {
                        "name": "entity-discovery",
                        "title": "Entity Search & Refine",
                        "data_route": "entity-discovery",
                        "icon": "pebble-lg-icons:SearchDb"
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
                        "icon": "pebble-lg-icons:InegrationDb"
                    },
                    {
                        "name": "divider"
                    },
                    {
                        "name": "appStore",
                        "title": "App Store",
                        "data_route": "app-store",
                        "icon": "pebble-lg-icons:AppDb"
                    }
                    ]
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
        "contexts": [{
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
                    "config": [{
                        "id": "channel",
                        "title": "Channel",
                        "icon": "pebble-lg-icons:Master",
                        "visible": true,
                        "dataRequestType": "entity",
                        "dataRequest": {
                            "params": {
                                "query": {
                                    "filters": {
                                        "typesCriterion": [
                                            "channel"
                                        ]
                                    }
                                }
                            }
                        },
                        "dataMappings": {
                            "id": "name",
                            "title": "name",
                            "subtitle": "",
                            "image": "",
                            "icon": "",
                            "type": ["channel"]
                        },
                        "selectedItem": {
                        },
                        "default": ""
                    },
                    {
                        "id": "source",
                        "title": "Source",
                        "icon": "pebble-lg-icons:Source",
                        "visible": true,
                        "dataRequestType": "entity-model",
                        "dataRequest": {
                            "params": {
                                "query": {
                                    "filters": {
                                        "typesCriterion": [
                                            "source"
                                        ]
                                    }
                                }
                            }
                        },
                        "dataMappings": {
                            "id": "name",
                            "title": "name",
                            "subtitle": "",
                            "image": "",
                            "icon": "",
                            "type": ["source"]
                        },
                        "selectedItem": {
                            "id": "internal",
                            "type": "source"
                        },
                        "default": ""
                    },
                    {
                        "id": "locale",
                        "title": "Locale",
                        "icon": "pebble-lg-icons:Language",
                        "visible": true,
                        "dataRequestType": "entity-model",
                        "dataRequest": {
                            "params": {
                                "query": {
                                    "filters": {
                                        "typesCriterion": [
                                            "locale"
                                        ]
                                    }
                                }
                            }
                        },
                        "dataMappings": {
                            "id": "name",
                            "title": "name",
                            "subtitle": "",
                            "image": "",
                            "icon": "",
                            "type": ["locale"]
                        },
                        "selectedItem": {
                            "id": "en-US",
                            "type": "locale"
                        },
                        "default": ""
                    }
                    ]
                },
                "rock-saved-searches": {
                    "config": {
                        "workflowSavedSearch": [{
                            "id": 1,
                            "accesstype": "self",
                            "name": "New SKUs to Submit",
                            "workflowSearchCriterion": {
                                "dataRequest": {
                                    "params": {
                                        "query": {
                                            "contexts": [
                                                {
                                                    "workflow": "newProductSetup"
                                                }
                                            ],
                                            "filters": {
                                                "attributesCriterion": [
                                                    {
                                                        "activities/activityName": {
                                                            "eq": "New SKUs to Submit"
                                                        }
                                                    }
                                                ],
                                                "typesCriterion": []
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        {
                            "id": 2,
                            "accesstype": "self",
                            "name": "Provide Additional Info",
                            "workflowSearchCriterion": {
                                "dataRequest": {
                                    "params": {
                                        "query": {
                                            "contexts": [
                                                {
                                                    "workflow": "newProductSetup"
                                                }
                                            ],
                                            "filters": {
                                                "attributesCriterion": [
                                                    {
                                                        "activities/activityName": {
                                                            "eq": "Provide Additional Info"
                                                        }
                                                    }
                                                ],
                                                "typesCriterion": []
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        {
                            "id": 3,
                            "accesstype": "self",
                            "name": "Rejected SKUs",
                            "workflowSearchCriterion": {
                                "dataRequest": {
                                    "params": {
                                        "query": {
                                            "contexts": [
                                                {
                                                    "workflow": "newProductSetup"
                                                }
                                            ],
                                            "filters": {
                                                "attributesCriterion": [
                                                    {
                                                        "activities/activityName": {
                                                            "eq": "Rejected SKUs"
                                                        }
                                                    }
                                                ],
                                                "typesCriterion": []
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        {
                            "id": 4,
                            "accesstype": "self",
                            "name": "Review Assortment",
                            "workflowSearchCriterion": {
                                "dataRequest": {
                                    "params": {
                                        "query": {
                                            "contexts": [
                                                {
                                                    "workflow": "newProductSetup"
                                                }
                                            ],
                                            "filters": {
                                                "attributesCriterion": [
                                                    {
                                                        "activities/activityName": {
                                                            "eq": "Review Assortment"
                                                        }
                                                    }
                                                ],
                                                "typesCriterion": []
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        {
                            "id": 5,
                            "accesstype": "self",
                            "name": "Assign Internal Information",
                            "workflowSearchCriterion": {
                                "dataRequest": {
                                    "params": {
                                        "query": {
                                            "contexts": [
                                                {
                                                    "workflow": "newProductSetup"
                                                }
                                            ],
                                            "filters": {
                                                "attributesCriterion": [
                                                    {
                                                        "activities/activityName": {
                                                            "eq": "Assign Internal Information"
                                                        }
                                                    }
                                                ],
                                                "typesCriterion": []
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        {
                            "id": 6,
                            "accesstype": "self",
                            "name": "Enrich Copy",
                            "workflowSearchCriterion": {
                                "dataRequest": {
                                    "params": {
                                        "query": {
                                            "contexts": [
                                                {
                                                    "workflow": "newProductSetup"
                                                }
                                            ],
                                            "filters": {
                                                "attributesCriterion": [
                                                    {
                                                        "activities/activityName": {
                                                            "eq": "Enrich Copy"
                                                        }
                                                    }
                                                ],
                                                "typesCriterion": []
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        {
                            "id": 7,
                            "accesstype": "self",
                            "name": "Enrich with Digital Assets",
                            "workflowSearchCriterion": {
                                "dataRequest": {
                                    "params": {
                                        "query": {
                                            "contexts": [
                                                {
                                                    "workflow": "newProductSetup"
                                                }
                                            ],
                                            "filters": {
                                                "attributesCriterion": [
                                                    {
                                                        "activities/activityName": {
                                                            "eq": "Enrich with Digital Assets"
                                                        }
                                                    }
                                                ],
                                                "typesCriterion": []
                                            }
                                        }
                                    }
                                }
                            }
                        }],
                        "favourites": [{
                            "id": 8,
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
                            }],
                            "workflowSearchCriterion": {
                                "dataRequest": {
                                    "params": {
                                        "query": {
                                            "contexts": [
                                                {
                                                    "workflow": "newProductSetup"
                                                }
                                            ],
                                            "filters": {
                                                "attributesCriterion": [
                                                    {
                                                        "activities/activityName": {
                                                            "eq": "Review Assortment"
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    }
                                }
                            }
                        }],
                        "my-searches": [{
                            "id": 9,
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
                            "id": 10,
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
                        "title": "Create",
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
                        "readOnly": true,
                        "schemaType": "attribute",
                        "titleTemplate":"for the channel {channel} ",
                        "dataRequest": {
                            "typesCriterion": ["sku", "productPresentation", "lot"],
                            "attributes": ["displayname", "description", "stuscd", "startdate", "enddate", "webDiscount"]
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
                                "linkTemplate": "entity-manage?id={id}&type={type}"
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
                                "header": "Web Discount",
                                "name": "webDiscount",
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
                                        "config-context": {
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
                                            "config-context": {
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
        "contexts": [{
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
                    "config": [{
                        "id": "channel",
                        "title": "Channel",
                        "icon": "pebble-lg-icons:Master",
                        "visible": true,
                        "dataRequestType": "entity",
                        "dataRequest": {
                            "params": {
                                "query": {
                                    "filters": {
                                        "typesCriterion": [
                                            "channel"
                                        ]
                                    }
                                }
                            }
                        },
                        "dataMappings": {
                            "id": "name",
                            "title": "name",
                            "subtitle": "",
                            "image": "",
                            "icon": "",
                            "type": ["channel"]
                        },
                        "selectedItem": {
                        },
                        "default": ""
                    },
                    {
                        "id": "source",
                        "title": "Source",
                        "icon": "pebble-lg-icons:Source",
                        "visible": true,
                        "dataRequestType": "entity-model",
                        "dataRequest": {
                            "params": {
                                "query": {
                                    "filters": {
                                        "typesCriterion": [
                                            "source"
                                        ]
                                    }
                                }
                            }
                        },
                        "dataMappings": {
                            "id": "name",
                            "title": "name",
                            "subtitle": "",
                            "image": "",
                            "icon": "",
                            "type": ["source"]
                        },
                        "selectedItem": {
                            "id": "internal",
                            "type": "source"
                        },
                        "default": ""
                    },
                    {
                        "id": "locale",
                        "title": "Locale",
                        "icon": "pebble-lg-icons:Language",
                        "visible": true,
                        "dataRequestType": "entity-model",
                        "dataRequest": {
                            "params": {
                                "query": {
                                    "filters": {
                                        "typesCriterion": [
                                            "locale"
                                        ]
                                    }
                                }
                            }
                        },
                        "dataMappings": {
                            "id": "name",
                            "title": "name",
                            "subtitle": "",
                            "image": "",
                            "icon": "",
                            "type": ["locale"]
                        },
                        "selectedItem": {
                            "id": "en-US",
                            "type": "locale"
                        },
                        "default": ""
                    }
                    ]
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
                            "attributeName": "webDiscount",
                            "label": "Web Discount",
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
                                    "config-context": {
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
                                            "frnin",
                                            "webDiscount"
                                        ]
                                    }
                                }
                            },
                            "menuItems": [{
                                "name": "coreAttributes",
                                "title": "Core Attributes",
                                "component": {
                                    "name": "rock-attribute-split-screen",
                                    "path": "/src/elements/rock-attribute-split-screen/rock-attribute-split-screen.html",
                                    "properties": {
                                        "mode": "view",
                                        "no-of-columns": 2,
                                        "config-context": {
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
                                                "longdescription",
                                                "webDiscount"
                                            ]
                                        }
                                    }
                                }
                            },
                            {
                                "name": "buying",
                                "title": "Buying Attributes",
                                "component": {
                                    "name": "rock-attribute-split-screen",
                                    "path": "/src/elements/rock-attribute-split-screen/rock-attribute-split-screen.html",
                                    "properties": {
                                        "mode": "view",
                                        "no-of-columns": 2,
                                        "config-context": {
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
                                "component": {
                                    "name": "rock-attribute-split-screen",
                                    "path": "/src/elements/rock-attribute-split-screen/rock-attribute-split-screen.html",
                                    "properties": {
                                        "mode": "view",
                                        "no-of-columns": 3,
                                        "config-context": {
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
                                "component": {
                                    "name": "rock-attribute-split-screen",
                                    "path": "/src/elements/rock-attribute-split-screen/rock-attribute-split-screen.html",
                                    "properties": {
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
                                "component": {
                                    "name": "rock-attribute-split-screen",
                                    "path": "/src/elements/rock-attribute-split-screen/rock-attribute-split-screen.html",
                                    "properties": {
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
                                "component": {
                                    "name": "rock-attribute-split-screen",
                                    "path": "/src/elements/rock-attribute-split-screen/rock-attribute-split-screen.html",
                                    "properties": {
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
                                    "config-context": {
                                        "relationshipTypeName": "Relationships"
                                    }
                                }
                            },
                            "menuItems": [{
                                "name": "isChildOf",
                                "title": "Variants",
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
                                        "config-context": {
                                            "relationshipTypeName": "isChildOf"
                                        }
                                    }
                                }
                            },
                            {
                                "name": "productPresentationToLot",
                                "title": "Lots",
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
                                        "config-context": {
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
                        },
                        {
                            "name": "entity-family",
                            "title": "Entity Family",
                            "enableDropdownMenu": false,
                            "component": {
                                "name": "rock-entity-variant",
                                "path": "/src/elements/rock-entity-variant/rock-entity-variant.html",
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
                                "attributes": ["color","description", "skuId", "startDate", "stuscd"]
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
                                    "header": "Description",
                                    "name": "description",
                                    "sortable": false,
                                    "filterable": false
                                },
                                {
                                    "header": "Color",
                                    "name": "color",
                                    "sortable": false,
                                    "filterable": false
                                },
                                {
                                    "header": "Start_Date",
                                    "name": "startDate",
                                    "sortable": false,
                                    "filterable": false
                                },
                                {
                                    "header": "STUS_CD",
                                    "name": "stuscd",
                                    "sortable": false,
                                    "filterable": false
                                },
                                    {
                                    "header": "Sku_Id",
                                    "name": "skuId",
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
                        }, "businessFunctionVariantsCreate": {
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
                                            "isMultiSelect": false,
                                            "actions": [{
                                                "name": "delete",
                                                "icon": "pebble-icons:Delete",
                                                "eventName": "delete-item"
                                            }]
                                        },
                                        "columns": [
                                            {
                                                "header": "Existing",
                                                "name": "existing",
                                                "sortable": false,
                                                "filterable": false
                                            }
                                        ]
                                    }
                                }
                            }
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
                                    "linkTemplate": "entity-manage?id={id}&type={type}"
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
                        "isChildOf": {
                            "viewMode": "Tabular",
                            "mode": "Read",
                            "title": "Is Child Of",
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
                                    "linkTemplate": "entity-manage?id={id}&type={type}"
                                },
                                {
                                    "header": "Short Name",
                                    "name": "shortnm",
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
                        "skuToImage": {
                            "viewMode": "Tabular",
                            "mode": "Read",
                            "title": "Sku To Image",
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
                                    "linkTemplate": "entity-manage?id={id}&type={type}"
                                },
                                {
                                    "header": "Short Name",
                                    "name": "shortnm",
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
                                    "linkTemplate": "entity-manage?id={id}&type={type}"

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
        "contexts": [{
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
                        "numberOfTasks": "TBD",
                        "workflow": "New Product Setup",
                        "unAssigned": "TBD",
                        "assignedToMe": "TBD",
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
                        "numberOfTasks": "TBD",
                        "workflow": "New Product Setup",
                        "unAssigned": "TBD",
                        "assignedToMe": "TBD",
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
                        "numberOfTasks": "TBD",
                        "workflow": "New Product Setup",
                        "unAssigned": "TBD",
                        "assignedToMe": "TBD",
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
                        "numberOfTasks": "TBD",
                        "workflow": "New Product Setup",
                        "unAssigned": "TBD",
                        "assignedToMe": "TBD",
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
                        "numberOfTasks": "TBD",
                        "workflow": "New Product Setup",
                        "unAssigned": "TBD",
                        "assignedToMe": "TBD",
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
                        "numberOfTasks": "TBD",
                        "workflow": "New Product Setup",
                        "unAssigned": "TBD",
                        "assignedToMe": "TBD",
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
                        "numberOfTasks": "TBD",
                        "workflow": "New Product Setup",
                        "unAssigned": "TBD",
                        "assignedToMe": "TBD",
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
        "contexts": [{
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
    },
    {
        "name": "user-store",
        "contexts": [
            {
                "tenant": "jcp",
                "ctx": {
                    "list": ""
                },
                "security": {
                    "user": "",
                    "role": ""
                },
                "components": {
                    "user-config": {
                        "config": {
                            "users": [
                                {
                                    "userName": "jcp",
                                    "password": "jcp",
                                    "roles": "vendor"
                                },
                                {
                                    "userName": "admin1",
                                    "password": "admin1",
                                    "roles": "admin"
                                },
                                {
                                    "userName": "vendor1",
                                    "password": "vendor1",
                                    "roles": "vendor"
                                },
                                {
                                    "userName": "buyer1",
                                    "password": "buyer1",
                                    "roles": "buyer"
                                },
                                {
                                    "userName": "assetEnrichment1",
                                    "password": "assetEnrichment1",
                                    "roles": "assetEnrichment"
                                },
                                {
                                    "userName": "business1",
                                    "password": "business1",
                                    "roles": "business"
                                },
                                {
                                    "userName": "copywriter1",
                                    "password": "copywriter1",
                                    "roles": "copywriter"
                                },
                                {
                                    "userName": "siteOps1",
                                    "password": "siteOps1",
                                    "roles": "siteOps"
                                },
                                {
                                    "userName": "taxonomyTeam1",
                                    "password": "taxonomyTeam1",
                                    "roles": "taxonomyTeam"
                                },
                                {
                                    "userName": "siteMerchandiser1",
                                    "password": "siteMerchandiser1",
                                    "roles": "siteMerchandiser"
                                }
                            ]
                        }
                    }
                }
            }
        ]
    }
    ]
};

module.exports = {
    'allConfigs': allConfigs
};