const { pool } = require("../../data");

//내 명함 등록 쿼리
exports.create = async (
  userId,
  position,
  organization,
  address,
  photo,
  tell,
  email
) => {
  const query = `INSERT INTO cards (userId, position, organization, address, photo, tell, email) VALUES (?,?,?,?,?,?,?);`;
  return await pool(query, [
    userId,
    position,
    organization,
    address,
    photo,
    tell,
    email,
  ]);
};

//내 명함 조회 쿼리
exports.show = async ({ cardId, userId }) => {
  console.log(cardId, userId);
  const query = `SELECT * FROM cards WHERE cardId=? AND userId =?`;
  let result = await pool(query, [cardId, userId]);
  return result.length < 0 ? null : result[0];
};

//내 명함 전체 조회
exports.show_all = async (id) => {
  const query = `
    SELECT cards.*, user.phone, user.email, user.name FROM cards JOIN user ON cards.userId = user.id WHERE userId=?`;
  const result = await pool(query, [id]);
  return result.length < 0 ? null : result;
};

//다른 명함 조회 쿼리
exports.show_other = async (id) => {
  const query = `SELECT * FROM cards WHERE cardId =?`;
  let result = await pool(query, [id]);
  return result.length < 0 ? null : result[0];
};

//내 명함 업데이트 쿼리
exports.update = async (
  id,
  position,
  organization,
  address,
  photo,
  tell,
  email
) => {
  const query = `
    UPDATE cards 
    SET position=?, organization=?, address=?, photo=?, tell=?, email=?
    WHERE cardId = ?;
  `;

  return await pool(query, [
    position,
    organization,
    address,
    photo,
    tell,
    email,
    id,
  ]);
};

//내 명함 삭제 쿼리
exports.delete = async (id) => {
  const query = `
    DELETE FROM cards
    WHERE cardId = ?;
  `;

  return await pool(query, [id]);
};
