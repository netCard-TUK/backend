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
  const query = `INSERT INTO cards (user_Id, position, organization, address, photo, tell, email) VALUES (?,?,?,?,?,?,?);`;
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
exports.show = async (card_id) => {
  const query = `SELECT * FROM cards JOIN user ON cards.user_id = user.id WHERE card_id=?`;
  let result = await pool(query, card_id);

  return result.length == 0 ? null : result[0];
};

//내 명함 전체 조회
exports.show_all = async (id) => {
  const query = `
    SELECT cards.*, user.phone, user.name FROM cards JOIN user ON cards.user_id = user.id WHERE user_id=?`;
  const result = await pool(query, [id]);
  return result.length < 0 ? null : result;
};

// 모든 명함 최신순 페이징 조회
exports.findAll = async (page, size) => {
  const query = `
    SELECT cards.*, user_id, name FROM cards JOIN user ON cards.user_id = user.id ORDER BY created_at desc LIMIT ? OFFSET ?`;
  const result = await pool(query, [size, page * size]);
  return result.length < 0 ? null : result;
};

//특정 명함 전체 조회(이름 일치)
exports.show_all_as_name = async (name) => {
  const query = `
    SELECT cards.*, user.phone, user.name FROM cards JOIN user ON cards.user_id = user.id WHERE user.name LIKE '%${name}%'`;
  const result = await pool(query, [name]);
  return result.length < 0 ? null : result;
};

// //특정 명함 조회 쿼리
// exports.show_other = async (id) => {
//   const query = `SELECT * FROM cards WHERE card_id =?`;
//   let result = await pool(query, [id]);
//   return result.length < 0 ? null : result[0];
// };

//내 명함 업데이트 쿼리
exports.update = async (id, position, organization, address, tell, email) => {
  const query = `
    UPDATE cards 
    SET position=?, organization=?, address=?, tell=?, email=?
    WHERE card_id = ?;
  `;

  return await pool(query, [position, organization, address, tell, email, id]);
};

//내 명함 삭제 쿼리
exports.delete = async (id) => {
  const query = `
    DELETE FROM cards
    WHERE card_id = ?;
  `;

  return await pool(query, [id]);
};
