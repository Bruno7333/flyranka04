const express = require('express');
const next = require('next');
const fs = require('fs');
const path = require('path');
const swaggerUi = require('swagger-ui-express');

const signupHandler = require('./pages/api/auth/signup');
const loginHandler = require('./pages/api/auth/login');
const logoutHandler = require('./pages/api/auth/logout');
const profileHandler = require('./pages/api/protected/profile');
const dashboardHandler = require('./pages/api/protected/dashboard');
const publicInfoHandler = require('./pages/api/public/info');

const port = Number(process.env.PORT || 3000);
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const openApiSpec = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'openapi.json'), 'utf8')
);

app
  .prepare()
  .then(() => {
    const server = express();

    server.use(express.json());
    server.use(express.urlencoded({ extended: true }));
    server.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, {
      customSiteTitle: 'Flyrank A4 Auth API Docs',
    }));

    server.post('/auth/signup', (req, res) => signupHandler(req, res));
    server.post('/auth/login', (req, res) => loginHandler(req, res));
    server.post('/auth/logout', (req, res) => logoutHandler(req, res));
    server.get('/protected/profile', (req, res) => profileHandler(req, res));
    server.get('/protected/dashboard', (req, res) => dashboardHandler(req, res));
    server.get('/public/info', (req, res) => publicInfoHandler(req, res));

    server.all('*', (req, res) => handle(req, res));

    server.listen(port, (err) => {
      if (err) {
        throw err;
      }

      console.log(`Server running on http://localhost:${port}`);
      console.log('Server running and connected to Supabase');
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
