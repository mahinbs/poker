const net = require('net');
const { spawn } = require('child_process');

/**
 * Check if a port is available
 */
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true);
      });
      server.close();
    });
    
    server.on('error', () => {
      resolve(false);
    });
  });
}

/**
 * Find the first available port starting from startPort
 */
async function findAvailablePort(startPort = 8080, maxPort = 8099) {
  for (let port = startPort; port <= maxPort; port++) {
    const available = await isPortAvailable(port);
    if (available) {
      return port;
    }
  }
  throw new Error(`No available port found between ${startPort} and ${maxPort}`);
}

/**
 * Start React app on available port
 */
async function startApp() {
  try {
    const port = await findAvailablePort(8080, 8099);
    console.log(`🚀 Starting frontend on port ${port}...`);
    console.log(`📱 Open http://localhost:${port} in your browser\n`);
    
    // Set PORT environment variable and start react-scripts
    process.env.PORT = port.toString();
    
    const reactScripts = spawn('npx', ['react-scripts', 'start'], {
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        PORT: port.toString()
      }
    });
    
    reactScripts.on('error', (error) => {
      console.error('❌ Failed to start React app:', error);
      process.exit(1);
    });
    
    reactScripts.on('exit', (code) => {
      process.exit(code);
    });
    
  } catch (error) {
    console.error('❌ Error finding available port:', error.message);
    process.exit(1);
  }
}

startApp();

