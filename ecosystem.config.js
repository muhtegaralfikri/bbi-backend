// PM2 Ecosystem Configuration for 2GB RAM Server
module.exports = {
  apps: [
    {
      name: 'bbi-backend',
      script: './dist/main.js',
      instances: 'max', // Use all available CPU cores
      exec_mode: 'cluster', // Cluster mode for better performance

      env: {
        NODE_ENV: 'development',
      },

      env_production: {
        NODE_ENV: 'production',
      },

      // Memory limit: 400MB per instance (2GB / 5 = 400MB)
      max_memory_restart: '400M',

      // Logging
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,

      // Auto-restart on failure
      autorestart: true,
      watch: false, // Disable watch in production
      max_restarts: 10,
      min_uptime: '10s',

      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 3000,
    },
  ],
};
