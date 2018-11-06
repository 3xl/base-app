'use strict';

const jwt = require('../jwt.js');

module.exports = {
  properties: {
    name: { type: String, required: true },
    description: { type: String },
    logo: { type: Object },
    opening: {
      monday: {
        from: { type: String, default: '08:00' },
        to: { type: String, default: '22:00' },
      },
      tuesday: {
        from: { type: String, default: '08:00' },
        to: { type: String, default: '22:00' },
      },
      wednesday: {
        from: { type: String, default: '08:00' },
        to: { type: String, default: '22:00' },
      },
      thursday: {
        from: { type: String, default: '08:00' },
        to: { type: String, default: '22:00' },
      },
      friday: {
        from: { type: String, default: '08:00' },
        to: { type: String, default: '22:00' },
      },
      saturday: {
        from: { type: String, default: '08:00' },
        to: { type: String, default: '22:00' },
      },
      sunday: {
        from: { type: String, default: '08:00' },
        to: { type: String, default: '22:00' },
      },
    },
    owners: [
      { type: String }
    ]
  },
  middlewares: [
    jwt.authorize
  ]
};
