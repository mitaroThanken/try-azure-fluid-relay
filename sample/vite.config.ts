import { CorsOptions, defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import fs from 'fs';
import { SecureContextOptions } from 'tls';
import legacy from '@vitejs/plugin-legacy';

const HOST = 'sample';
const PORT = 5173;
const HMR_PORT = 5174;
const VHOST_FQDN = process.env.VHOST_FQDN !== undefined ? process.env.VHOST_FQDN : "test.test";
const HTTPS_OPTIONS: SecureContextOptions = {
  key: fs.readFileSync(`../certs/${VHOST_FQDN}/key.pem`),
  cert: fs.readFileSync(`../certs/${VHOST_FQDN}/cert.pem`)
};
const PROTOCOL = 'https://';
const CORS_OPTION: CorsOptions = {
  origin: `${PROTOCOL}${VHOST_FQDN}`
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: [
        '>0.2%',
        'not dead',
        'not op_mini all',
        'IE 11'
      ]
    })],
  server: {
    host: HOST,
    origin: `${PROTOCOL}${VHOST_FQDN}`,
    https: HTTPS_OPTIONS,
    hmr: {
      path: "/hmr",
      port: HMR_PORT,
      clientPort: 443
    },
    strictPort: true,
    cors: CORS_OPTION
  },
  preview: {
    host: HOST,
    port: PORT,
    https: HTTPS_OPTIONS,
    strictPort: true,
    cors: CORS_OPTION
  }
});
