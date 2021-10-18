var config = {
  debug: true,
  mysql: {
    host: "localhost",
    user: "root",
    password: "",
    database: "level_upgrade",
  },
  port: 5010,
  server: "localhost",
  smtp: {
    host: "smtp-mail.outlook.com",
    port: 587,
    secure: false,
    auth: {
      user: "auth@auth.com",
      pass: "Xian",
    },
    tls: {
      rejectUnauthorized: false,
    },
  },
};

module.exports = config;
