const { pool } = require("../../data");

//내 명함 등록 쿼리
exports.create = async (
  user_id,
  position,
  organization,
  address,
  photo,
  tell,
  email
) => {
  const query = `INSERT INTO cards (user_id, position, organization, address, photo, tell, email) VALUES (?,?,?,?,?,?,?);`;
  return await pool(query, [
    user_id,
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
  const query = `SELECT * FROM cards WHERE card_id=? AND user_id =?`;
  let result = await pool(query, [cardId, userId]);
  return result.length < 0 ? null : result[0];
};

//내 명함 전체 조회
exports.show_all = async (id) => {
  const query = `
    SELECT cards.*, user.phone, user.email, user.name FROM cards JOIN user ON cards.user_id = user.id WHERE user_id=?`;
  const result = await pool(query, [id]);
  return result.length < 0 ? null : result;
};

//다른 명함 조회 쿼리
exports.show_other = async (id) => {
  const query = `SELECT * FROM cards WHERE card_id =?`;
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
    WHERE card_id = ?;
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
    WHERE card_id = ?;
  `;

  return await pool(query, [id]);
};
