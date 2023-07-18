// Load Environment variables
dotenv.config();

export const {
  NODE_ENV,
  PORT,
  JENKINS_USER,
  JENKINS_USER_APIKEY,
  EMAIL_ID,
  EMAIL_PASSWORD,
} = process.env;

if (
  NODE_ENV === undefined ||
  PORT === undefined ||
  JENKINS_USER === undefined ||
  JENKINS_USER_APIKEY === undefined ||
  EMAIL_ID === undefined ||
  EMAIL_PASSWORD === undefined
) {
  console.error('Error: Missing environment variables');
  process.exit(1);
}
