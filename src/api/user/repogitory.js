const {pool} = require("../../data");

exports.register = async (email, password, name, phone) => {
    const query = `INSERT INTO user (email, password, name, phone)
                   VALUES (?, ?, ?, ?)`;
    return await pool(query, [email, password, name, phone]);
};

exports.login = async (email, password) => {
    const query = `SELECT *
                   FROM user
                   WHERE email = ?
                     AND password = ?`;
    let result = await pool(query, [email, password]);
    return result.length < 0 ? null : result[0];
};

exports.isExistByEmail = async (email) => {
    let result = await pool(
        `SELECT count(*) count
         FROM user
         WHERE email = ?`,
        [email]
    );

    return result[0].count > 0;
};

exports.delete = async (userId) => {
    return await pool(`UPDATE user
                       SET isActivated = false
                       WHERE id = ?`, [userId]);
}

exports.show_user = async (id) => {
    const query = `SELECT *
                   FROM user
                   WHERE id = ?`;
    let result = await pool(query, [id]);
    return result.length < 0 ? null : result[0];
};
