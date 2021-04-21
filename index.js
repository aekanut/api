'use strict';
const express = require('express');
const cors = require('cors');
const config = require('./config');
const cartRoutes = require('./routes/cart-routes');

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api', cartRoutes);



app.listen(config.port, () => console.log('App is listening on url http://localhost:' + config.port));
