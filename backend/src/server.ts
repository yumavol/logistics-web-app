import 'dotenv/config';
import app from '@/app';

const port = process.env.BACKEND_PORT || 8000;
app.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}`);
});
