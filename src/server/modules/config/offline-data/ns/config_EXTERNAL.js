
var allConfigs = {
    "configs": [
        {
            "name": "main-app",
            "ctxInfo": [
                {
                    "tenant": "ns",
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
                                "actions": [
                                    {
                                        "name": "createStyle",
                                        "icon": "pebble-xl-icons:Product",
                                        "text": "Style",
                                        "visible": true,
                                        "dataRoute": "entity-create",
                                        "dataContext": {
                                            "source": "internal",
                                            "locale": "en-US",
                                            "list": "productMaster",
                                            "classification": "_ALL",
                                            "entityType": "style"
                                        }
                                    },
                                    {
                                        "name": "createSupplier",
                                        "icon": "pebble-xl-icons:Customer",
                                        "text": "Supplier",
                                        "visible": true,
                                        "dataRoute": "entity-create",
                                        "dataContext": {
                                            "source": "internal",
                                            "locale": "en-US",
                                            "list": "productMaster",
                                            "classification": "_ALL",
                                            "entityType": "supplier"
                                        }
                                    },
                                    {
                                        "name": "createUPC",
                                        "icon": "pebble-xl-icons:Kit",
                                        "text": "UPC",
                                        "visible": true,
                                        "dataRoute": "entity-create",
                                        "dataContext": {
                                            "source": "internal",
                                            "locale": "en-US",
                                            "list": "productMaster",
                                            "classification": "_ALL",
                                            "entityType": "upc"
                                        }
                                    }
                                ]
                            }
                        },
                        "rock-navmenu": {
                            "config": [
                                {
                                    "name": "dashboard",
                                    "title": "Dashboard",
                                    "data_route": "dashboard",
                                    "icon": "pebble-icons:Dashboard",
                                    "isLandingPage": true
                                },
                                {
                                    "name": "entity-discovery",
                                    "title": "Entity Search & Discovery",
                                    "data_route": "entity-discovery",
                                    "icon": "pebble-icons:SearchDb"
                                },
                                {
                                    "name": "entity-manage",
                                    "title": "Entity Manage",
                                    "data_route": "entity-manage",
                                    "queryParams": {
                                        "id": "e1",
                                        "type": "nart"
                                    },
                                    "icon": "pebble-icons:Entities"
                                },
                                {
                                    "name": "divider"
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
                                    "href": "/entity-manage?id=e1&type=nart",
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
                                                "entityType": "product"
                                            }
                                        }
                                    }
                                },
                                "grid-demo": {
                                    "name": "gridDemo",
                                    "title": "Grid Demo",
                                    "data_route": "grid-demo",
                                    "icon": "pebble-icons:ViewList",
                                    "href": "/griddemo",
                                    "nonClosable": true,
                                    "nonMinimizable": true,
                                    "component": {
                                        "name": "demo-grid-element",
                                        "path": "../../src/elements/rock-grid/demo/demo-grid-element.html",
                                        "properties": {
                                            "mode": "edit"
                                        }
                                    }
                                }
                            }
                        },
                        "tenant-config": {
                            "config": {
                                "logoUrl": "../src/images/Nordstrom-logo.svg",
                                "tenantName": "Nordstrom",
                                "primaryColor": "#000000",
                                "primaryLightColor": "#0bb2e8",
                                "secondaryColor": "#364653"
                            }
                        }
                    }
                }
            ]
        },
        {
            "name": "app-entity-discovery",
            "ctxInfo": [
                {
                    "tenant": "ns",
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
                                    },
                                    {
                                        "id": 3,
                                        "title": "U.S.A",
                                        "subtitle": "U.S.A",
                                        "value": "usa",
                                        "image": ""
                                    },
                                    {
                                        "id": 4,
                                        "title": "Canada",
                                        "subtitle": "Canada",
                                        "value": "canada",
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
                                    }
                                    ],
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
                                        "title": "German - Germany",
                                        "subtitle": "Germany",
                                        "value": "de-DE",
                                        "image": ""
                                    },
                                    {
                                        "id": 3,
                                        "title": "French - France",
                                        "subtitle": "French",
                                        "value": "fr-FR",
                                        "image": ""
                                    },
                                    {
                                        "id": 4,
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
                                "favourites": [
                                    {
                                        "id": 1,
                                        "accesstype": "self",
                                        "name": "Women's Sport Wear & Dresses",
                                        "icon": "pebble-icons:SavedSearch",
                                        "dimensions": {
                                            "catalog": "productMaster",
                                            "Source": "internal",
                                            "Locale": "en-US",
                                            "TimeSlice": "Now"
                                        },
                                        "searchQuery": "Lorem Ipsum",
                                        "searchTags": [
                                            {
                                                "name": "shortDescription",
                                                "longName": "Short Description",
                                                "displayType": "textBox",
                                                "value": {
                                                    "eq": "Lorem"
                                                }
                                            }
                                        ]
                                    }
                                ],
                                "my-searches": [
                                    {
                                        "id": 1,
                                        "accesstype": "self",
                                        "name": "Women's Sport Wear & Dresses",
                                        "icon": "pebble-icons:SavedSearch",
                                        "shared": false,
                                        "dimensions": {
                                            "catalog": "productMaster",
                                            "Source": "internal",
                                            "Locale": "en-US",
                                            "TimeSlice": "Now"
                                        },
                                        "searchQuery": "Lorem Ipsum",
                                        "searchTags": [
                                            {
                                                "name": "shortDescription",
                                                "longName": "Short Description",
                                                "displayType": "textBox",
                                                "value": {
                                                    "eq": "Lorem"
                                                }
                                            }
                                        ]
                                    }
                                ],
                                "shared-searches": [
                                    {
                                        "id": 1,
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
                                        "searchQuery": "Lorem Ipsum",
                                        "searchTags": [
                                            {
                                                "name": "shortDescription",
                                                "longName": "Short Description",
                                                "displayType": "textBox",
                                                "value": {
                                                    "eq": "Lorem"
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        },
                        "pebble-actions": {
                            "config": {
                                "title": "",
                                "actions": [
                                    {
                                        "name": "extendToBrand",
                                        "icon": "pebble-xl-icons:Brand",
                                        "text": "Extend to Brand",
                                        "visible": true,
                                        "eventName": "action-extendtobrand"
                                    },
                                    {
                                        "name": "addToChannel",
                                        "icon": "pebble-xl-icons:Channel",
                                        "text": "Introduce to New Channel",
                                        "visible": true,
                                        "eventName": "action-addnewchannel"
                                    }
                                ]
                            }
                        },
                        "rock-search-filter": {
                            "config": [
                                {
                                    "name": "shortDescription",
                                    "longName": "Short Description",
                                    "displayType": "textBox"
                                },
                                {
                                    "name": "longDescription",
                                    "longName": "Long Description",
                                    "value": "",
                                    "displayType": "textArea"
                                },

                                {
                                    "name": "createDate",
                                    "longName": "Creation Date",
                                    "value": "",
                                    "displayType": "dateTime"
                                },
                                {
                                    "name": "setupCost",
                                    "longName": "Setup Cost",
                                    "displayType": "numeric"
                                },
                                {
                                    "name": "gender",
                                    "longName": "Gender",
                                    "displayType": "dropDown"
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
                                    "typesCriterion": ["style", "choice", "sku", "supplier"],
                                    "attributes": ["shortDescription", "longDescription", "rmsStyleId", "setupCost", "gender"]
                                },
                                "tabular": {
                                    "settings": {
                                        "isMultiSelect": true
                                    },
                                    "columns": [
                                        {
                                            "header": "Short Description",
                                            "name": "shortDescription",
                                            "sortable": false,
                                            "filterable": false,
                                            "linkTemplate": "entity-manage?id={id}&type={entityType}"
                                        },
                                        {
                                            "header": "Long Description",
                                            "name": "longDescription",
                                            "sortable": false,
                                            "filterable": false
                                        },
                                        {
                                            "header": "RMS Style ID",
                                            "name": "rmsStyleId",
                                            "sortable": false,
                                            "filterable": false
                                        },
                                        {
                                            "header": "Setup Cost",
                                            "name": "setupCost",
                                            "sortable": true,
                                            "filterable": false
                                        }
                                    ]
                                },
                                "list": {
                                    "settings": {
                                        "isMultiSelect": true,
                                        "actions": [
                                            {
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
                                        "title": "shortDescription",
                                        "id": "id",
                                        "fields": [
                                            {
                                                "name": "longDescription",
                                                "label": "Long Description"
                                            },
                                            {
                                                "name": "setupCost",
                                                "label": "Setup Cost",
                                                "noTrim": true
                                            },
                                            {
                                                "name": "createDate",
                                                "label": "Create Date",
                                                "noTrim": false
                                            }
                                        ]
                                    }
                                },
                                "tile": {
                                    "settings": {
                                        "isMultiSelect": true,
                                        "actions": [
                                            {
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
                                        "title": "shortDescription",
                                        "id": "id",
                                        "fields": [
                                            {
                                                "name": "setupCost",
                                                "label": "Setup Cost",
                                                "noTrim": true
                                            },
                                            {
                                                "name": "createDate",
                                                "label": "Create Date",
                                                "noTrim": false
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
                                    "tabItems": [
                                        {
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
                                                            "shortDescription",
                                                            "longDescription",
                                                            "createDate",
                                                            "setupCost",
                                                            "gender",
                                                            "customerMaxOrderQty",
                                                            "opReplenishmentIndicator",
                                                            "opItemPlanningIndicator",
                                                            "replenishmentIndicator",
                                                            "forecastIndicator",
                                                            "opForecastIndicator",
                                                            "reserveStockIndicator",
                                                            "ripIndicator",
                                                            "apIndicator",
                                                            "testAttribute"
                                                        ]
                                                    }
                                                }
                                            },
                                            "menuItems": [
                                                {
                                                    "name": "core-attributes",
                                                    "icon": "icons:add-box",
                                                    "title": "Core Attributes",
                                                    "component": {
                                                        "name": "rock-attribute-manage",
                                                        "path": "/src/elements/rock-attribute-manage/rock-attribute-manage.html",
                                                        "properties": {
                                                            "locales": [
                                                                {
                                                                    "locale": "en-US",
                                                                    "language": "English"
                                                                }
                                                            ],
                                                            "source": "SAP",
                                                            "list": "productMaster",
                                                            "mode": "view",
                                                            "no-of-columns": 1,
                                                            "context": {
                                                                "groupName": "Core Attributes",
                                                                "attributeNames": [
                                                                    "shortDescription",
                                                                    "longDescription",
                                                                    "createDate",
                                                                    "setupCost"
                                                                ]
                                                            }
                                                        }
                                                    }
                                                }
                                            ]
                                        }]
                                },
                                "pebble-toolbar": {
                                    "buttonItems": [
                                        {
                                            "buttons": [
                                                {
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
                                                    "buttons": [
                                                        {
                                                            "name": "add",
                                                            "icon": "pebble-sm-icons:Add",
                                                            "text": "",
                                                            "visible": true,
                                                            "eventName": "add"
                                                        },
                                                        {
                                                            "name": "delete",
                                                            "icon": "pebble-md-cions:Delete",
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
                                        }
                                    ]
                                },
                                "rock-entity-tofix": {
                                    "completionPercentage": 65,
                                    "tofixes": [
                                        {
                                            "data": {
                                                "name": "brandext",
                                                "type": "error",
                                                "label": "Brand Extension not available",
                                                "eventName": "tofixtap"
                                            }
                                        },
                                        {
                                            "data": {
                                                "name": "priceissue",
                                                "type": "error",
                                                "label": "Canada price not available",
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
                                        },
                                        {
                                            "data": {
                                                "name": "msrpissue",
                                                "type": "information",
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
                                "favourites": [
                                    {
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
                                "my-searches": [
                                    {
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
                                "shared-searches": [
                                    {
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
                }
            ]
        },
        {
            "name": "app-entity-manage",
            "ctxInfo": [
                {
                    "tenant": "ns",
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
                                    },
                                    {
                                        "id": 3,
                                        "title": "U.S.A",
                                        "subtitle": "U.S.A",
                                        "value": "usa",
                                        "image": ""
                                    },
                                    {
                                        "id": 4,
                                        "title": "Canada",
                                        "subtitle": "Canada",
                                        "value": "canada",
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
                                    }
                                    ],
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
                                        "title": "German - Germany",
                                        "subtitle": "Germany",
                                        "value": "de-DE",
                                        "image": ""
                                    },
                                    {
                                        "id": 3,
                                        "title": "French - France",
                                        "subtitle": "French",
                                        "value": "fr-FR",
                                        "image": ""
                                    },
                                    {
                                        "id": 4,
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
                                "locales": [
                                    {
                                        "id": 1,
                                        "title": "en-US",
                                        "subtitle": "en-US",
                                        "image": "/src/images/lookup-item.jpg"
                                    },
                                    {
                                        "id": 2,
                                        "title": "de-DE",
                                        "subtitle": "de-DE",
                                        "image": "/src/images/lookup-item.jpg"
                                    }
                                ],
                                "sources": [
                                    {
                                        "id": 1,
                                        "title": "PIM",
                                        "subtitle": "PIM",
                                        "image": "/src/images/lookup-item.jpg"
                                    },
                                    {
                                        "id": 2,
                                        "title": "SAP",
                                        "subtitle": "SAP",
                                        "image": "/src/images/lookup-item.jpg"
                                    },
                                    {
                                        "id": 3,
                                        "title": "PLM",
                                        "subtitle": "PLM",
                                        "image": "/src/images/lookup-item.jpg"
                                    }
                                ],
                                "contexts": [
                                    {
                                        "id": 1,
                                        "title": "productMaster",
                                        "subtitle": "productMaster",
                                        "image": "/src/images/lookup-item.jpg"
                                    },
                                    {
                                        "id": 2,
                                        "title": "Germany Website",
                                        "subtitle": "Germany Website",
                                        "image": "/src/images/lookup-item.jpg"
                                    },
                                    {
                                        "id": 3,
                                        "title": "UK Website",
                                        "subtitle": "UK Website",
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
                                        "columns": [
                                            {
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
                                "headerConfig": [
                                    {
                                        "attributeName": "shortDescription",
                                        "label": "Short Description",
                                        "noTrim": false
                                    },
                                    {
                                        "attributeName": "longDescription",
                                        "label": "Long Description",
                                        "noTrim": false
                                    },
                                    {
                                        "attributeName": "createDate",
                                        "label": "Create Date",
                                        "noTrim": false
                                    },
                                    {
                                        "attributeName": "setupCost",
                                        "label": "Setup Cost",
                                        "noTrim": false
                                    }
                                ],
                                "toolbarConfig": {
                                    "buttonItems": [
                                        {
                                            "buttons": [
                                                {
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
                                                    "buttons": [
                                                        {
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
                                        }
                                    ]
                                },
                                "summaryToFix": {
                                    "completionPercentage": 65,
                                    "tofixes": [
                                        {
                                            "data": {
                                                "name": "brandext",
                                                "type": "error",
                                                "label": "Brand Extension not available",
                                                "eventName": "tofixtap"
                                            }
                                        },
                                        {
                                            "data": {
                                                "name": "priceissue",
                                                "type": "error",
                                                "label": "Canada price not available",
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
                                        },
                                        {
                                            "data": {
                                                "name": "msrpissue",
                                                "type": "information",
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
                                "widgets": [
                                    {
                                        "name": "rock-entity-todo",
                                        "nonClosable": true,
                                        "nonMaximizable": true,
                                        "nonDraggable": true,
                                        "iconButtons": [
                                            {
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
                                        "iconButtons": [
                                            {
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
                                "tabItems": [
                                    {
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
                                                    "webAttributes",
                                                    "logisticsSupplyChain",
                                                    "merchandising"
                                                ],
                                                "context": {
                                                    "attributeNames": [
                                                        "shortDescription",
                                                        "longDescription",
                                                        "createDate",
                                                        "setupCost",
                                                        "gender",
                                                        "customerMaxOrderQty",
                                                        "opReplenishmentIndicator",
                                                        "opItemPlanningIndicator",
                                                        "replenishmentIndicator",
                                                        "forecastIndicator",
                                                        "opForecastIndicator",
                                                        "reserveStockIndicator",
                                                        "ripIndicator",
                                                        "apIndicator",
                                                        "testAttribute"
                                                    ]
                                                }
                                            }
                                        },
                                        "menuItems": [
                                            {
                                                "name": "core-attributes",
                                                "icon": "icons:add-box",
                                                "title": "Core Attributes",
                                                "component": {
                                                    "name": "rock-attribute-split-screen",
                                                    "path": "/src/elements/rock-attribute-split-screen/rock-attribute-split-screen.html",
                                                    "properties": {
                                                        "locales": [
                                                            {
                                                                "locale": "en-US",
                                                                "language": "English"
                                                            }
                                                        ],
                                                        "source": "internal",
                                                        "list": "productMaster",
                                                        "mode": "view",
                                                        "no-of-columns": 2,
                                                        "context": {
                                                            "groupName": "Core Attributes",
                                                            "attributeNames": [
                                                                "shortDescription",
                                                                "longDescription",
                                                                "createDate",
                                                                "setupCost",
                                                                "gender",
                                                                "classDescription",
                                                                "subclassDescription",
                                                                "msrp"
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
                                                        "locales": [
                                                            {
                                                                "locale": "en-US",
                                                                "language": "English"
                                                            }
                                                        ],
                                                        "source": "internal",
                                                        "list": "productMaster",
                                                        "mode": "view",
                                                        "no-of-columns": 2,
                                                        "context": {
                                                            "groupName": "Buying Attributes",
                                                            "attributeNames": [
                                                                "customerMaxOrderQty",
                                                                "opReplenishmentIndicator",
                                                                "opItemPlanningIndicator",
                                                                "replenishmentIndicator",
                                                                "forecastIndicator",
                                                                "opForecastIndicator",
                                                                "reserveStockIndicator",
                                                                "ripIndicator",
                                                                "apIndicator",
                                                                "testAttribute"
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
                                                        "locales": [
                                                            {
                                                                "locale": "en-US",
                                                                "language": "English"
                                                            }
                                                        ],
                                                        "source": "internal",
                                                        "list": "productMaster",
                                                        "mode": "view",
                                                        "no-of-columns": 3,
                                                        "context": {
                                                            "groupName": "Selling Attributes",
                                                            "attributeNames": [
                                                                "averageRepurchaseDays",
                                                                "careInformation",
                                                                "customerDeliveryRule",
                                                                "customizationRequired",
                                                                "customizationType",
                                                                "depositRange",
                                                                "dryingInstructions",
                                                                "doNotSellReason",
                                                                "eligibleSellingChannels",
                                                                "fairMarketValue",
                                                                "isMerchandise",
                                                                "isSample",
                                                                "itemTktOverPct",
                                                                "itemTktPrintPoChg",
                                                                "keySellingBenefits",
                                                                "licensedProductType",
                                                                "productAlert",
                                                                "productOriginType",
                                                                "promotionalProduct",
                                                                "initialRedemptionPointsValue",
                                                                "remindAutoFulfill",
                                                                "specialTreatmentType",
                                                                "taxCategory",
                                                                "taxExempt",
                                                                "washingInstructions",
                                                                "msrp",
                                                                "exclusivity",
                                                                "isGiftWrapEligible",
                                                                "warningsDisclaimers",
                                                                "characterName",
                                                                "teamName",
                                                                "uniqueProductDistinctions",
                                                                "sellingPackCount",
                                                                "model",
                                                                "commonAliases",
                                                                "sellingMarket",
                                                                "productLabel",
                                                                "typeOfNonInvtMerchandise"
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
                                                        "locales": [
                                                            {
                                                                "locale": "en-US",
                                                                "language": "English"
                                                            }
                                                        ],
                                                        "source": "SAP",
                                                        "list": "productMaster",
                                                        "mode": "view",
                                                        "no-of-columns": 3,
                                                        "context": {
                                                            "groupName": "Merch Planning",
                                                            "attributeNames": [
                                                                "bottomsFitPlanning",
                                                                "corpPricePlanning",
                                                                "corpStylePlanning",
                                                                "customerPlanning",
                                                                "customerAssortmentPlanning",
                                                                "deliveryPlanning",
                                                                "deptColorPlanning",
                                                                "deptFitPlanning",
                                                                "deptPreferencePlanning",
                                                                "deptPricePlanning",
                                                                "deptStylePlanning",
                                                                "eventPlanning",
                                                                "fabricationPlanning",
                                                                "fitPlanning",
                                                                "functionPlanning",
                                                                "genderPlanning",
                                                                "genderSizePlanning",
                                                                "itemCategoryPlanning",
                                                                "mixOfBusinessPlanning",
                                                                "occasionPlanning",
                                                                "productCategoryPlanning",
                                                                "productPricePlanning",
                                                                "productSourcePlanning",
                                                                "shadePlanning",
                                                                "silhouettePlanning",
                                                                "skinTypePlanning",
                                                                "supplierRolePlanning",
                                                                "tonePlanning"
                                                            ]
                                                        }
                                                    }
                                                }
                                            },
                                            {
                                                "name": "priceAndRegulatory",
                                                "title": "Price and Regulatory",
                                                "icon": "icons:add-box",
                                                "component": {
                                                    "name": "rock-attribute-split-screen",
                                                    "path": "/src/elements/rock-attribute-split-screen/rock-attribute-split-screen.html",
                                                    "properties": {
                                                        "locales": [
                                                            {
                                                                "locale": "en-US",
                                                                "language": "English"
                                                            }
                                                        ],
                                                        "source": "internal",
                                                        "list": "productMaster",
                                                        "mode": "view",
                                                        "no-of-columns": 2,
                                                        "context": {
                                                            "groupName": "Price and Regulatory",
                                                            "attributeNames": [
                                                                "bindingRuling",
                                                                "currency",
                                                                "customsDescription",
                                                                "hts1",
                                                                "excludeFromDiscount",
                                                                "fishAndWildlife",
                                                                "foodAndDrug",
                                                                "hts2",
                                                                "hts3",
                                                                "hts4",
                                                                "sentToBroker",
                                                                "setupCost",
                                                                "setupRetail",
                                                                "umap"
                                                            ]
                                                        }
                                                    }
                                                }
                                            },
                                            {
                                                "name": "selling",
                                                "title": "Selling",
                                                "icon": "icons:add-box",
                                                "component": {
                                                    "name": "rock-attribute-split-screen",
                                                    "path": "/src/elements/rock-attribute-split-screen/rock-attribute-split-screen.html",
                                                    "properties": {
                                                        "locales": [
                                                            {
                                                                "locale": "en-US",
                                                                "language": "English"
                                                            }
                                                        ],
                                                        "source": "internal",
                                                        "list": "productMaster",
                                                        "mode": "view",
                                                        "no-of-columns": 3,
                                                        "context": {
                                                            "groupName": "Selling",
                                                            "attributeNames": [
                                                                "averageRepurchaseDays",
                                                                "careInformation",
                                                                "customerDeliveryRule",
                                                                "customizationRequired",
                                                                "customizationType",
                                                                "depositRange",
                                                                "dryingInstructions",
                                                                "doNotSellReason",
                                                                "eligibleSellingChannels",
                                                                "fairMarketValue",
                                                                "isMerchandise",
                                                                "isSample",
                                                                "itemTktOverPct",
                                                                "itemTktPrintPoChg",
                                                                "keySellingBenefits",
                                                                "licensedProductType",
                                                                "productAlert",
                                                                "productOriginType",
                                                                "promotionalProduct",
                                                                "initialRedemptionPointsValue",
                                                                "remindAutoFulfill",
                                                                "specialTreatmentType",
                                                                "taxCategory",
                                                                "taxExempt",
                                                                "washingInstructions",
                                                                "msrp",
                                                                "exclusivity",
                                                                "isGiftWrapEligible",
                                                                "warningsDisclaimers",
                                                                "characterName",
                                                                "teamName",
                                                                "uniqueProductDistinctions",
                                                                "sellingPackCount",
                                                                "model",
                                                                "commonAliases",
                                                                "sellingMarket",
                                                                "productLabel",
                                                                "typeOfNonInvtMerchandise"
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
                                        "menuItems": [
                                            {
                                                "name": "supplierVpn",
                                                "title": "Supplier VPN",
                                                "icon": "icons:cloud-upload",
                                                "component": {
                                                    "name": "rock-relationship-split-screen",
                                                    "path": "/src/elements/rock-relationship-split-screen/rock-relationship-split-screen.html",
                                                    "properties": {
                                                        "locales": [
                                                            {
                                                                "locale": "en-US",
                                                                "language": "English"
                                                            }
                                                        ],
                                                        "source": "SAP",
                                                        "list": "productMaster",
                                                        "mode": "view",
                                                        "no-of-columns": 1,
                                                        "context": {
                                                            "relationshipTypeName": "supplierVpn"
                                                        }
                                                    }
                                                }
                                            },
                                            {
                                                "name": "supplierUpc",
                                                "title": "Supplier UPC",
                                                "icon": "icons:cloud-upload",
                                                "component": {
                                                    "name": "rock-relationship-split-screen",
                                                    "path": "/src/elements/rock-relationship-split-screen/rock-relationship-split-screen.html",
                                                    "properties": {
                                                        "locales": [
                                                            {
                                                                "locale": "en-US",
                                                                "language": "English"
                                                            }
                                                        ],
                                                        "source": "SAP",
                                                        "list": "productMaster",
                                                        "mode": "view",
                                                        "no-of-columns": 1,
                                                        "context": {
                                                            "relationshipTypeName": "supplierUpc"
                                                        }
                                                    }
                                                }
                                            },
                                            {
                                                "name": "isChildOf",
                                                "title": "Is Child Of",
                                                "icon": "icons:cloud-upload",
                                                "component": {
                                                    "name": "rock-relationship-split-screen",
                                                    "path": "/src/elements/rock-relationship-split-screen/rock-relationship-split-screen.html",
                                                    "properties": {
                                                        "locales": [
                                                            {
                                                                "locale": "en-US",
                                                                "language": "English"
                                                            }
                                                        ],
                                                        "source": "SAP",
                                                        "list": "productMaster",
                                                        "mode": "view",
                                                        "no-of-columns": 1,
                                                        "context": {
                                                            "relationshipTypeName": "isChildOf"
                                                        }
                                                    }
                                                }
                                            }
                                        ]
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
                                    },
                                    {
                                        "name": "governance",
                                        "title": "Governance",
                                        "enableDropdownMenu": true,
                                        "menuItems": [
                                            {
                                                "name": "menuItem1",
                                                "title": "Business Condition1",
                                                "icon": "icons:mail"
                                            },
                                            {
                                                "name": "menuItem2",
                                                "title": "Business Condition2",
                                                "icon": "icons:mail"
                                            },
                                            {
                                                "name": "menuItem3",
                                                "title": "Business Condition3",
                                                "icon": "icons:mail"
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
                                        "name": "extensions",
                                        "title": "Extensions",
                                        "enableDropdownMenu": false,
                                        "component": {
                                            "name": "rock-extension-manage",
                                            "path": "/src/elements/rock-extension-manage/rock-extension-manage.html",
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
                                    "Range008": "RANGE_TO_EXCLUSIVE_FROM_INCLUSIVE"
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
                                        "attributes": ["shortDescription", "rmsSkuId", "nrfColorCode", "nrfSizeCode"]
                                    },
                                    "tabular": {
                                        "settings": {
                                            "isMultiSelect": true,
                                            "actions": [
                                                {
                                                    "name": "delete",
                                                    "icon": "pebble-icons:Delete",
                                                    "eventName": "delete-item"
                                                },
                                                {
                                                    "name": "edit"
                                                }
                                            ]
                                        },
                                        "columns": [
                                            {
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
                                            "actions": [
                                                {
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
                                            "fields": [
                                                {
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
                                            "actions": [
                                                {
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
                                            "fields": [
                                                {
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
                                    "levels": [
                                        {
                                            "entityType": "choice",
                                            "index": 1,
                                            "optional": false,
                                            "dimensionAttributes": [
                                                {
                                                    "sourceAttribute": "evColors",
                                                    "targetAttribute": "evColor",
                                                    "optional": false
                                                }
                                            ]
                                        },
                                        {
                                            "entityType": "sku",
                                            "index": 2,
                                            "optional": false,
                                            "dimensionAttributes": [
                                                {
                                                    "sourceAttribute": "evSizes",
                                                    "targetAttribute": "evSize",
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
                                                "columns": [
                                                    {
                                                        "header": "Status",
                                                        "name": "status",
                                                        "sortable": false,
                                                        "filterable": false
                                                    }
                                                ]
                                            }
                                        },
                                        "variantDefinitionUI": {
                                            "name": "ehd1",
                                            "levels": [
                                                {
                                                    "entityType": "choice",
                                                    "index": 1,
                                                    "optional": false,
                                                    "dimensionAttributes": [
                                                        {
                                                            "sourceAttribute": "evColors",
                                                            "targetAttribute": "evColor",
                                                            "optional": false
                                                        }
                                                    ]
                                                },
                                                {
                                                    "entityType": "sku",
                                                    "index": 2,
                                                    "optional": false,
                                                    "dimensionAttributes": [
                                                        {
                                                            "sourceAttribute": "evSizes",
                                                            "targetAttribute": "evSize",
                                                            "optional": false
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    }
                                }
                            }
                        },
                        "rock-relationship-manage": {
                            "config": {
                                "supplierVpn": {
                                    "viewMode": "Tabular",
                                    "mode": "Read",
                                    "title": "Supplier VPN",
                                    "schemaType": "colModel",
                                    "statusEnabled": true,
                                    "tabular": {
                                        "settings": {
                                            "isMultiSelect": true,
                                            "actions": [
                                                {
                                                    "name": "delete",
                                                    "icon": "pebble-icons:Delete",
                                                    "eventName": "delete-item"
                                                }
                                            ]
                                        },
                                        "columns": [
                                            {
                                                "header": "Related Entity",
                                                "name": "Related Entity",
                                                "sortable": true,
                                                "filterable": false,
                                                "editType": "",
                                                "isRelatedEntityAttribute": false
                                            },
                                            {
                                                "header": "Short Description",
                                                "name": "shortDescription",
                                                "sortable": true,
                                                "filterable": false,
                                                "editType": "textbox",
                                                "isRelatedEntityAttribute": true
                                            },
                                            {
                                                "header": "VPN",
                                                "name": "vpn",
                                                "sortable": true,
                                                "filterable": false,
                                                "editType": "textbox",
                                                "isRelatedEntityAttribute": false
                                            },
                                            {
                                                "header": "Primary",
                                                "name": "primary",
                                                "sortable": true,
                                                "filterable": false,
                                                "editType": "boolean",
                                                "isRelatedEntityAttribute": false
                                            }
                                        ]
                                    }
                                },
                                "supplierUpc": {
                                    "viewMode": "Tabular",
                                    "mode": "Read",
                                    "title": "Supplier UPC",
                                    "schemaType": "colModel",
                                    "statusEnabled": true,
                                    "tabular": {
                                        "settings": {
                                            "isMultiSelect": true,
                                            "actions": [
                                                {
                                                    "name": "delete",
                                                    "icon": "pebble-icons:Delete",
                                                    "eventName": "delete-item"
                                                }
                                            ]
                                        },
                                        "columns": [
                                            {
                                                "header": "Related Entity",
                                                "name": "Related Entity",
                                                "sortable": true,
                                                "filterable": false,
                                                "editType": "",
                                                "isRelatedEntityAttribute": false
                                            },
                                            {
                                                "header": "Short Description",
                                                "name": "shortDescription",
                                                "sortable": true,
                                                "filterable": false,
                                                "editType": "textbox",
                                                "isRelatedEntityAttribute": true
                                            },
                                            {
                                                "header": "UPC",
                                                "name": "upc",
                                                "sortable": true,
                                                "filterable": false,
                                                "editType": "textbox",
                                                "isRelatedEntityAttribute": false
                                            },
                                            {
                                                "header": "Primary",
                                                "name": "primary",
                                                "sortable": true,
                                                "filterable": false,
                                                "editType": "boolean",
                                                "isRelatedEntityAttribute": true
                                            }
                                        ]
                                    }
                                },
                                "isChildOf": {
                                    "viewMode": "Tabular",
                                    "mode": "Read",
                                    "title": "Variants",
                                    "schemaType": "colModel",
                                    "statusEnabled": true,
                                    "tabular": {
                                        "settings": {
                                            "isMultiSelect": true,
                                            "actions": [
                                                {
                                                    "name": "delete",
                                                    "icon": "pebble-icons:Delete",
                                                    "eventName": "delete-item"
                                                }
                                            ]
                                        },
                                        "columns": [
                                            {
                                                "header": "Related Entity",
                                                "name": "Related Entity",
                                                "sortable": true,
                                                "filterable": false,
                                                "editType": "",
                                                "isRelatedEntityAttribute": false
                                            },
                                            {
                                                "header": "Short Description",
                                                "name": "shortDescription",
                                                "sortable": true,
                                                "filterable": false,
                                                "editType": "textbox",
                                                "isRelatedEntityAttribute": true
                                            }
                                        ]
                                    }
                                }
                            }
                        },
                        "rock-entity-todo": {
                            "config": {
                                "todos": [
                                    {
                                        "icon": {
                                            "name": "pebble-xl-icons:Brand"
                                        },
                                        "data": {
                                            "name": "extToCountry",
                                            "label": "Extend to country",
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
                                            "label": "Add new supplier vpn",
                                            "eventName": "todotap"
                                        }
                                    },
                                    {
                                        "icon": {
                                            "name": "pebble-xl-icons:Variants"
                                        },
                                        "data": {
                                            "name": "variants",
                                            "label": "Manage variants",
                                            "eventName": "todotap"
                                        }
                                    },
                                    {
                                        "icon": {
                                            "name": "pebble-xl-icons:Colors"
                                        },
                                        "data": {
                                            "name": "colors",
                                            "label": "Bulk edit colors",
                                            "eventName": "todotap"
                                        }
                                    }
                                ]
                            }
                        },
                        "rock-entity-tofix": {
                            "config": {
                                "completionPercentage": 65,
                                "tofixes": [
                                    {
                                        "data": {
                                            "name": "brandext",
                                            "type": "error",
                                            "label": "Brand Extension not available",
                                            "eventName": "tofixtap"
                                        }
                                    },
                                    {
                                        "data": {
                                            "name": "priceissue",
                                            "type": "error",
                                            "label": "Canada price not available",
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
                                    },
                                    {
                                        "data": {
                                            "name": "msrpissue",
                                            "type": "information",
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
                                "titleAttribute": "shortDescription",
                                "subtitleAttribute": "longDescription"
                            }
                        }
                    }
                }
            ]
        },
        {
            "name": "app-dashboard",
            "ctxInfo": [
                {
                    "tenant": "ns",
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
                                "favourites": [
                                    {
                                        "id": 1,
                                        "name": "Women's Sport Wear & Dresses",
                                        "icon": "pebble-icons:SavedSearch",
                                        "accesstype": "self",
                                        "dimensions": {
                                            "catalog": "MasterCatalog",
                                            "Source": "pim",
                                            "Locale": "locales/locale/en-US",
                                            "TimeSlice": "Now"
                                        },
                                        "searchQuery": "Lorem Ipsum",
                                        "searchFilters": [
                                            {
                                                "name": "cpimProductName",
                                                "longName": "Product Name",
                                                "displayType": "textBox"
                                            }
                                        ],
                                        "searchTags": [
                                            {
                                                "name": "cpimProductName",
                                                "longName": "Product Name",
                                                "displayType": "textBox",
                                                "value": {
                                                    "eq": "Lorem"
                                                }
                                            }
                                        ]
                                    }
                                ],
                                "my-searches": [],
                                "shared-searches": []
                            }
                        },
                        "rock-widget-panel": {
                            "config": {
                                "widgets": [
                                    {
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
                            "config": [
                                {
                                    "id": 1,
                                    "name": "Create SPGR PV",
                                    "numberOfTasks": 1037,
                                    "workflow": "PV Workflow",
                                    "unAssigned": 1007,
                                    "assignedToMe": 30,
                                    "status": "red",
                                    "products": [
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
                                    "name": "Start GBU Data Maintenance",
                                    "numberOfTasks": 23,
                                    "workflow": "PV Workflow",
                                    "unAssigned": 23,
                                    "assignedToMe": 0,
                                    "status": "red",
                                    "products": [
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
                                    "name": "Assign GBU Media Assets",
                                    "numberOfTasks": 26,
                                    "workflow": "PV Workflow",
                                    "unAssigned": 25,
                                    "assignedToMe": 1,
                                    "status": "red",
                                    "products": [
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
                                    "id": 4,
                                    "name": "Start MLU Data Maintenance",
                                    "numberOfTasks": 34,
                                    "workflow": "NART Workflow AT",
                                    "unAssigned": 4,
                                    "assignedToMe": 30,
                                    "status": "orange",
                                    "products": [
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
                                    "id": 5,
                                    "name": "Assign Local Media Assets",
                                    "numberOfTasks": 4,
                                    "workflow": "NART Workflow AT",
                                    "unAssigned": 4,
                                    "assignedToMe": 0,
                                    "status": "orange",
                                    "products": [
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
                                    "name": "Start MLU Data Maintenance",
                                    "numberOfTasks": 6,
                                    "workflow": "NART Workflow CH",
                                    "unAssigned": 4,
                                    "assignedToMe": 2,
                                    "status": "green",
                                    "products": [
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
                                    "name": "Assign Local Media Assets",
                                    "numberOfTasks": 74,
                                    "workflow": "NART Workflow CH",
                                    "unAssigned": 43,
                                    "assignedToMe": 31,
                                    "status": "green",
                                    "products": [
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
                                    "id": 8,
                                    "name": "Missing PackShot (Images)",
                                    "numberOfTasks": 68,
                                    "workflow": "Introduction SKU to spain",
                                    "unAssigned": 42,
                                    "assignedToMe": 26,
                                    "status": "green",
                                    "products": [
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
                                    "id": 9,
                                    "name": "Activate SKU",
                                    "numberOfTasks": 6,
                                    "workflow": "Introduction SKU to spain",
                                    "unAssigned": 4,
                                    "assignedToMe": 2,
                                    "status": "green",
                                    "products": [
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
                            "config": [
                                {
                                    "id": 1,
                                    "name": "Create SPGR PV",
                                    "numberOfTasks": 1037,
                                    "workflow": "PV Workflow",
                                    "unAssigned": 1007,
                                    "assignedToMe": 30,
                                    "status": "red",
                                    "products": [
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
                                    "name": "Start GBU Data Maintenance",
                                    "numberOfTasks": 23,
                                    "workflow": "PV Workflow",
                                    "unAssigned": 23,
                                    "assignedToMe": 0,
                                    "status": "red",
                                    "products": [
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
                                    "name": "Assign GBU Media Assets",
                                    "numberOfTasks": 26,
                                    "workflow": "PV Workflow",
                                    "unAssigned": 25,
                                    "assignedToMe": 1,
                                    "status": "red",
                                    "products": [
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
                                    "id": 4,
                                    "name": "Start MLU Data Maintenance",
                                    "numberOfTasks": 34,
                                    "workflow": "NART Workflow AT",
                                    "unAssigned": 4,
                                    "assignedToMe": 30,
                                    "status": "orange",
                                    "products": [
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
                                    "id": 5,
                                    "name": "Assign Local Media Assets",
                                    "numberOfTasks": 4,
                                    "workflow": "NART Workflow AT",
                                    "unAssigned": 4,
                                    "assignedToMe": 0,
                                    "status": "orange",
                                    "products": [
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
                                    "name": "Start MLU Data Maintenance",
                                    "numberOfTasks": 6,
                                    "workflow": "NART Workflow CH",
                                    "unAssigned": 4,
                                    "assignedToMe": 2,
                                    "status": "green",
                                    "products": [
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
                                    "name": "Assign Local Media Assets",
                                    "numberOfTasks": 74,
                                    "workflow": "NART Workflow CH",
                                    "unAssigned": 43,
                                    "assignedToMe": 31,
                                    "status": "green",
                                    "products": [
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
                                    "id": 8,
                                    "name": "Missing PackShot (Images)",
                                    "numberOfTasks": 68,
                                    "workflow": "Introduction SKU to spain",
                                    "unAssigned": 42,
                                    "assignedToMe": 26,
                                    "status": "green",
                                    "products": [
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
                                    "id": 9,
                                    "name": "Activate SKU",
                                    "numberOfTasks": 6,
                                    "workflow": "Introduction SKU to spain",
                                    "unAssigned": 4,
                                    "assignedToMe": 2,
                                    "status": "green",
                                    "products": [
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
                                "favourites": [
                                    {
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
                                "my-searches": [
                                    {
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
                                "shared-searches": [
                                    {
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
                }
            ]
        },
        {
            "name": "app-business-function",
            "ctxInfo": [
                {
                    "tenant": "ns",
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
                                "stepperConfig": [
                                    {
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
                                "steps": [
                                    {
                                        "name": "step-1-fill-initial-data",
                                        "label": "Fill Data for New Entity",
                                        "component": {
                                            "name": "rock-entity-create",
                                            "path": "/../../src/elements/rock-entity-create/rock-entity-create.html",
                                            "properties": {
                                                "import-profile-name": "Entity Import - RSExcel 2.0",
                                                "attribute-names": [
                                                    "createDate",
                                                    "shortDescription",
                                                    "longDescription",
                                                    "setupCost",
                                                    "gender"
                                                ]
                                            }
                                        },
                                        "nextEvent": "onSave",
                                        "skipEvent": "onCancel"
                                    }
                                ]
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
                                            "actions": [
                                                {
                                                    "name": "delete",
                                                    "icon": "pebble-icons:Delete",
                                                    "eventName": "delete-item"
                                                }
                                            ]
                                        },
                                        "columns": [
                                            {
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
                                    "levels": [
                                        {
                                            "entityType": "choice",
                                            "index": 1,
                                            "dimensions": [
                                                {
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
                                            "dimensions": [
                                                {
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
                                    "stepperConfig": [
                                        {
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
                                    "steps": [
                                        {
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
                }
            ]
        },
        {
            "name": "user-store",
            "ctxInfo": [{
                "tenant": "ns",
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
                                    "userName": "ns",
                                    "password": "ns",
                                    "roles": "vendor"
                                }
                            ]
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