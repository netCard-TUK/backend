const { pool } = require("../../data");

// 등록
exports.register = async (userId, cardId) => {
    const query = `INSERT INTO wallets (user_id, card_id) VALUES (?,?)`;
    return await pool(query, [userId, cardId]);
};

// 삭제
exports.delete = async (userId, cardId) => {
    const query = `DELETE FROM wallets WHERE user_id = ? AND card_id = ?`;
    return await pool(query, [userId, cardId]);
};

// 유저 아이디와 명함 아이디로 명함 지갑 찾기
exports.findByUserIdCardId = async (userId, cardId) => {
    const query = `SELECT * FROM wallets WHERE user_id = ? AND card_id = ?`;
    let result = await pool(query, [userId, cardId]);
    return result.length < 0 ? null : result[0];

}

// 유저 아이디로 명함 지갑에 있는 명함들 모두 조회
exports.findAllByUserId = async (userId, page, size) => {
    const query = `
        SELECT cards.card_id as cardId, user.name as name, cards.position as position, cards.organization as organization, cards.address as address, cards.photo as photo, cards.tell as tell, cards.email as email, wallets.updated_at as updatedAt
        FROM wallets JOIN cards JOIN user on wallets.card_id = cards.card_id and wallets.user_id = user.id 
        where wallets.user_id = ?
        limit ? offset ?
    `;
    return await pool(query, [userId, size, page * size]);
};

