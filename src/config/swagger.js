const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-Commerce API',
      version: '1.0.0',
      description: 'A production-ready e-commerce backend API',
      contact: {
        name: 'Atif malik',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local server',
      },
    ],
    // This defines the "Authorize" button for JWT
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // This looks for files containing documentation comments
  apis: ['./src/modules/**/*.routes.js'], 
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;