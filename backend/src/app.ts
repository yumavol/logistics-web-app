import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import routes from '@/routes';
import { openapiDocument } from '@/lib/openapi';
import { errorHandler } from '@/middlewares/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));

app.use('/api', routes);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

export default app;
