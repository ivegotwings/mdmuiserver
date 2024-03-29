import '@polymer/polymer/polymer-legacy.js';
import { Polymer as Polymer$0 } from '@polymer/polymer/lib/legacy/polymer-fn.js';
Polymer$0({
  _template: html`

`,

  is: 'fake-data-source',

  properties: {
      dataSource: {
          notify: true,
          value: function() {
          return this._dataSource.bind(this);
          }
      },

      size: {
          notify: true,
          value: 0
      },

      data: {
          type: Array,
          value: function() {
              return [
                  {
                      "id": 1,
                      "shortName": "web Price",
                      "longName": "Web Price",
                      "productType": "Electronics",
                      "description": "product web price",
                      "isNew": false,
                      "isApproved": true,
                      "productImage": "/bower_components/iron-image/demo/polymer.svg"
                  },
                  {
                      "id": 2,
                      "shortName": "catalog",
                      "longName": "Catalog",
                      "productType": "Toys",
                      "description": "catalog information",
                      "isNew": true,
                      "isApproved": false,
                      "productImage": "/bower_components/iron-image/demo/polymer.svg"
                  },
                  {
                      "id": 3,
                      "shortName": "cost1",
                      "longName": "Cost2",
                      "productType": "Value",
                      "description": "cost of the product1",
                      "isNew": false,
                      "isApproved": true,
                      "productImage": "/bower_components/iron-image/demo/polymer.svg"
                  },
                  {
                      "id": 4,
                      "shortName": "cost1",
                      "longName": "Cost2",
                      "productType": "Value",
                      "description": "cost of the product2",
                      "isNew": false,
                      "isApproved": true,
                      "productImage": "/bower_components/iron-image/demo/polymer.svg"
                  },
                  {
                      "id": 5,
                      "shortName": "cost1",
                      "longName": "Cost2",
                      "productType": "Value",
                      "description": "cost of the product3",
                      "isNew": false,
                      "isApproved": true,
                      "productImage": "/bower_components/iron-image/demo/polymer.svg"
                  },
                  {
                      "id": 6,
                      "shortName": "web Price",
                      "longName": "Web Price",
                      "productType": "Electronics",
                      "description": "product web price",
                      "isNew": false,
                      "isApproved": true,
                      "productImage": "/bower_components/iron-image/demo/polymer.svg"
                  },
                  {
                      "id": 7,
                      "shortName": "catalog",
                      "longName": "Catalog",
                      "productType": "Toys",
                      "description": "catalog information",
                      "isNew": true,
                      "isApproved": false,
                      "productImage": "/bower_components/iron-image/demo/polymer.svg"
                  },
                  {
                      "id": 8,
                      "shortName": "cost1",
                      "longName": "Cost2",
                      "productType": "Value",
                      "description": "cost of the product1",
                      "isNew": false,
                      "isApproved": true,
                      "productImage": "/bower_components/iron-image/demo/polymer.svg"
                  },
                  {
                      "id": 9,
                      "shortName": "cost1",
                      "longName": "Cost2",
                      "productType": "Value",
                      "description": "cost of the product2",
                      "isNew": false,
                      "isApproved": true,
                      "productImage": "/bower_components/iron-image/demo/polymer.svg"
                  },
                  {
                      "id": 10,
                      "shortName": "cost1",
                      "longName": "Cost2",
                      "productType": "Value",
                      "description": "cost of the product3",
                      "isNew": false,
                      "isApproved": true,
                      "productImage": "/bower_components/iron-image/demo/polymer.svg"
                  },
                  {
                      "id": 11,
                      "shortName": "web Price",
                      "longName": "Web Price",
                      "productType": "Electronics",
                      "description": "product web price",
                      "isNew": false,
                      "isApproved": true,
                      "productImage": "/bower_components/iron-image/demo/polymer.svg"
                  },
                  {
                      "id": 12,
                      "shortName": "catalog",
                      "longName": "Catalog",
                      "productType": "Toys",
                      "description": "catalog information",
                      "isNew": true,
                      "isApproved": false,
                      "productImage": "/bower_components/iron-image/demo/polymer.svg"
                  },
                  {
                      "id": 13,
                      "shortName": "cost1",
                      "longName": "Cost2",
                      "productType": "Value",
                      "description": "cost of the product1",
                      "isNew": false,
                      "isApproved": true,
                      "productImage": "/bower_components/iron-image/demo/polymer.svg"
                  },
                  {
                      "id": 14,
                      "shortName": "cost1",
                      "longName": "Cost2",
                      "productType": "Value",
                      "description": "cost of the product2",
                      "isNew": false,
                      "isApproved": true,
                      "productImage": "/bower_components/iron-image/demo/polymer.svg"
                  },
                  {
                      "id": 15,
                      "shortName": "cost1",
                      "longName": "Cost2",
                      "productType": "Value",
                      "description": "cost of the product3",
                      "isNew": false,
                      "isApproved": true,
                      "productImage": "/bower_components/iron-image/demo/polymer.svg"
                  },
                  {
                      "id": 16,
                      "shortName": "web Price",
                      "longName": "Web Price",
                      "productType": "Electronics",
                      "description": "product web price",
                      "isNew": false,
                      "isApproved": true,
                      "productImage": "/bower_components/iron-image/demo/polymer.svg"
                  },
                  {
                      "id": 17,
                      "shortName": "catalog",
                      "longName": "Catalog",
                      "productType": "Toys",
                      "description": "catalog information",
                      "isNew": true,
                      "isApproved": false,
                      "productImage": "/bower_components/iron-image/demo/polymer.svg"
                  },
                  {
                      "id": 18,
                      "shortName": "cost1",
                      "longName": "Cost2",
                      "productType": "Value",
                      "description": "cost of the product1",
                      "isNew": false,
                      "isApproved": true,
                      "productImage": "/bower_components/iron-image/demo/polymer.svg"
                  },
                  {
                      "id": 19,
                      "shortName": "cost1",
                      "longName": "Cost2",
                      "productType": "Value",
                      "description": "cost of the product2",
                      "isNew": false,
                      "isApproved": true,
                      "productImage": "/bower_components/iron-image/demo/polymer.svg"
                  },
                  {
                      "id": 20,
                      "shortName": "cost1",
                      "longName": "Cost2",
                      "productType": "Value",
                      "description": "cost of the product3",
                      "isNew": false,
                      "isApproved": true,
                      "productImage": "/bower_components/iron-image/demo/polymer.svg"
                  },
                  {
                      "id": 21,
                      "shortName": "web Price",
                      "longName": "Web Price",
                      "productType": "Electronics",
                      "description": "product web price",
                      "isNew": false,
                      "isApproved": true,
                      "productImage": "/bower_components/iron-image/demo/polymer.svg"
                  },
                  {
                      "id": 22,
                      "shortName": "catalog",
                      "longName": "Catalog",
                      "productType": "Toys",
                      "description": "catalog information",
                      "isNew": true,
                      "isApproved": false,
                      "productImage": "/bower_components/iron-image/demo/polymer.svg"
                  },
                  {
                      "id": 23,
                      "shortName": "cost1",
                      "longName": "Cost2",
                      "productType": "Value",
                      "description": "cost of the product1",
                      "isNew": false,
                      "isApproved": true,
                      "productImage": "/bower_components/iron-image/demo/polymer.svg"
                  },
                  {
                      "id": 24,
                      "shortName": "cost1",
                      "longName": "Cost2",
                      "productType": "Value",
                      "description": "cost of the product2",
                      "isNew": false,
                      "isApproved": true,
                      "productImage": "/bower_components/iron-image/demo/polymer.svg"
                  },
                  {
                      "id": 25,
                      "shortName": "cost1",
                      "longName": "Cost2",
                      "productType": "Value",
                      "description": "cost of the product3",
                      "isNew": false,
                      "isApproved": true,
                      "productImage": "/bower_components/iron-image/demo/polymer.svg"
                  },
                  {
                      "id": 26,
                      "shortName": "web Price",
                      "longName": "Web Price",
                      "productType": "Electronics",
                      "description": "product web price",
                      "isNew": false,
                      "isApproved": true,
                      "productImage": "/bower_components/iron-image/demo/polymer.svg"
                  },
                  {
                      "id": 27,
                      "shortName": "catalog",
                      "longName": "Catalog",
                      "productType": "Toys",
                      "description": "catalog information",
                      "isNew": true,
                      "isApproved": false,
                      "productImage": "/bower_components/iron-image/demo/polymer.svg"
                  },
                  {
                      "id": 28,
                      "shortName": "cost1",
                      "longName": "Cost2",
                      "productType": "Value",
                      "description": "cost of the product1",
                      "isNew": false,
                      "isApproved": true,
                      "productImage": "/bower_components/iron-image/demo/polymer.svg"
                  },
                  {
                      "id": 29,
                      "shortName": "cost1",
                      "longName": "Cost2",
                      "productType": "Value",
                      "description": "cost of the product2",
                      "isNew": false,
                      "isApproved": true,
                      "productImage": "/bower_components/iron-image/demo/polymer.svg"
                  },
                  {
                      "id": 30,
                      "shortName": "cost1",
                      "longName": "Cost2",
                      "productType": "Value",
                      "description": "cost of the product3",
                      "isNew": false,
                      "isApproved": true,
                      "productImage": "/bower_components/iron-image/demo/polymer.svg"
                  },
                  {
                      "id": 31,
                      "shortName": "web Price",
                      "longName": "Web Price",
                      "productType": "Electronics",
                      "description": "product web price",
                      "isNew": false,
                      "isApproved": true,
                      "productImage": "/bower_components/iron-image/demo/polymer.svg"
                  },
                  {
                      "id": 32,
                      "shortName": "catalog",
                      "longName": "Catalog",
                      "productType": "Toys",
                      "description": "catalog information",
                      "isNew": true,
                      "isApproved": false,
                      "productImage": "/bower_components/iron-image/demo/polymer.svg"
                  },
                  {
                      "id": 33,
                      "shortName": "cost1",
                      "longName": "Cost2",
                      "productType": "Value",
                      "description": "cost of the product1",
                      "isNew": false,
                      "isApproved": true,
                      "productImage": "/bower_components/iron-image/demo/polymer.svg"
                  },
                  {
                      "id": 34,
                      "shortName": "cost1",
                      "longName": "Cost2",
                      "productType": "Value",
                      "description": "cost of the product2",
                      "isNew": false,
                      "isApproved": true,
                      "productImage": "/bower_components/iron-image/demo/polymer.svg"
                  },
                  {
                      "id": 35,
                      "shortName": "cost1",
                      "longName": "Cost2",
                      "productType": "Value",
                      "description": "cost of the product3",
                      "isNew": false,
                      "isApproved": true,
                      "productImage": "/bower_components/iron-image/demo/polymer.svg"
                  },
                  {
                      "id": 36,
                      "shortName": "web Price",
                      "longName": "Web Price",
                      "productType": "Electronics",
                      "description": "product web price",
                      "isNew": false,
                      "isApproved": true,
                      "productImage": "/bower_components/iron-image/demo/polymer.svg"
                  },
                  {
                      "id": 37,
                      "shortName": "catalog",
                      "longName": "Catalog",
                      "productType": "Toys",
                      "description": "catalog information",
                      "isNew": true,
                      "isApproved": false,
                      "productImage": "/bower_components/iron-image/demo/polymer.svg"
                  },
                  {
                      "id": 38,
                      "shortName": "cost1",
                      "longName": "Cost2",
                      "productType": "Value",
                      "description": "cost of the product1",
                      "isNew": false,
                      "isApproved": true,
                      "productImage": "/bower_components/iron-image/demo/polymer.svg"
                  },
                  {
                      "id": 39,
                      "shortName": "cost1",
                      "longName": "Cost2",
                      "productType": "Value",
                      "description": "cost of the product2",
                      "isNew": false,
                      "isApproved": true,
                      "productImage": "/bower_components/iron-image/demo/polymer.svg"
                  },
                  {
                      "id": 40,
                      "shortName": "cost1",
                      "longName": "Cost2",
                      "productType": "Value",
                      "description": "cost of the product3",
                      "isNew": false,
                      "isApproved": true,
                      "productImage": "/bower_components/iron-image/demo/polymer.svg"
                  },
                  {
                      "id": 41,
                      "shortName": "web Price",
                      "longName": "Web Price",
                      "productType": "Electronics",
                      "description": "product web price",
                      "isNew": false,
                      "isApproved": true,
                      "productImage": "/bower_components/iron-image/demo/polymer.svg"
                  },
                  {
                      "id": 42,
                      "shortName": "catalog",
                      "longName": "Catalog",
                      "productType": "Toys",
                      "description": "catalog information",
                      "isNew": true,
                      "isApproved": false,
                      "productImage": "/bower_components/iron-image/demo/polymer.svg"
                  },
                  {
                      "id": 43,
                      "shortName": "cost1",
                      "longName": "Cost2",
                      "productType": "Value",
                      "description": "cost of the product1",
                      "isNew": false,
                      "isApproved": true,
                      "productImage": "/bower_components/iron-image/demo/polymer.svg"
                  },
                  {
                      "id": 44,
                      "shortName": "cost1",
                      "longName": "Cost2",
                      "productType": "Value",
                      "description": "cost of the product2",
                      "isNew": false,
                      "isApproved": true,
                      "productImage": "/bower_components/iron-image/demo/polymer.svg"
                  },
                  {
                      "id": 45,
                      "shortName": "cost1",
                      "longName": "Cost2",
                      "productType": "Value",
                      "description": "cost of the product3",
                      "isNew": false,
                      "isApproved": true,
                      "productImage": "/bower_components/iron-image/demo/polymer.svg"
                  },
                  {
                      "id": 46,
                      "shortName": "web Price",
                      "longName": "Web Price",
                      "productType": "Electronics",
                      "description": "product web price",
                      "isNew": false,
                      "isApproved": true,
                      "productImage": "/bower_components/iron-image/demo/polymer.svg"
                  },
                  {
                      "id": 47,
                      "shortName": "catalog",
                      "longName": "Catalog",
                      "productType": "Toys",
                      "description": "catalog information",
                      "isNew": true,
                      "isApproved": false,
                      "productImage": "/bower_components/iron-image/demo/polymer.svg"
                  },
                  {
                      "id": 48,
                      "shortName": "cost1",
                      "longName": "Cost2",
                      "productType": "Value",
                      "description": "cost of the product1",
                      "isNew": false,
                      "isApproved": true,
                      "productImage": "/bower_components/iron-image/demo/polymer.svg"
                  },
                  {
                      "id": 49,
                      "shortName": "cost1",
                      "longName": "Cost2",
                      "productType": "Value",
                      "description": "cost of the product2",
                      "isNew": false,
                      "isApproved": true,
                      "productImage": "/bower_components/iron-image/demo/polymer.svg"
                  },
                  {
                      "id": 50,
                      "shortName": "cost1",
                      "longName": "Cost2",
                      "productType": "Value",
                      "description": "cost of the product3",
                      "isNew": false,
                      "isApproved": true,
                      "productImage": "/bower_components/iron-image/demo/polymer.svg"
                  }
              ];
          }
      }
  },

  _dataSource: function(opts, cb) {
      if (this.size / opts.pageSize >= opts.page) {
          this.size += this.size == 0 ? opts.pageSize * 2 : opts.pageSize;
      }
      cb(this.data.slice(0, opts.pageSize));
  }
});
