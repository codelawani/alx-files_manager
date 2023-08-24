import router from './routes';

const express = require('express');

const PORT = process.env.PORT || 5000;
const app = express();

app.use('/', router);

app.listen(PORT, () => {
  console.log('Server listening on PORT:', PORT);
});
export default app;
