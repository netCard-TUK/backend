exports.index = (req, res) => {
  const query = req.query;
  res.send(query);
};
exports.store = (req, res) => {
  const body = req.body;
  res.send(body);
};
exports.show = (req, res) => {
  const id = req.params.id;
  res.send(`피드 조회`);
};
exports.update = (req, res) => {
  const id = req.params.id;
  res.send(`피드 수정`);
};
exports.destroy = (req, res) => {
  const id = req.params.id;
  res.send(`피드 삭제`);
};
