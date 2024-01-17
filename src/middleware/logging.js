module.exports = (req, res, next) => {
  let clientIp = req.id || "255.255.255.255";
  console.log(`${clientIp.replace("::ffff:", "")} : ${req.path}`);
  next();
};
