const jwt = require("./jwt");
const userRepository = require("./repogitory");
const crypto = require("crypto");

exports.register = async (req, res) => {

    // 영어, 숫자 최소 1자리
    const emailRegex = /^[a-zA-Z0-9]+$/;
    // 영어, 숫자 최소 1자리
    const passwordRegex = /^[a-zA-Z0-9]+$/;
    // 한글, 영어, 숫자 최소 1자리
    const nameRegex = /^[가-힣a-zA-Z0-9]+$/;
    // 숫자 최소 1자리
    const phoneRegex = /^[0-9]+$/;

    const {email, password, name, phone} = req.body;

    if (
        emailRegex.test(email) === false ||
        passwordRegex.test(password) === false ||
        nameRegex.test(name) === false ||
        phoneRegex.test(phone) === false
    ) {
        return res.send({
            isSuccess: false,
            message: "email, password, name, phone 은 숫자와 영어만 입력 가능합니다.",
        });
    }

    let isExist = await userRepository.isExistByEmail(email);

    if (isExist) {
        return res.send({
            isSuccess: false,
            message: "중복된 이메일이 존재합니다.",
        });
    }

    // 비밀번호 암호화
    const result = await crypto.pbkdf2Sync(
        password,
        process.env.SALT_KET,
        50,
        100,
        "sha512"
    );

    const {affectedRows, insertId} = await userRepository.register(
        email,
        result.toString("base64"),
        name,
        phone
    );

    const data = await jwt.jwtSign({id: insertId});

    res.send({
        isSuccess: true,
        userId : insertId,
        access_token: data,
    });
};

exports.login = async (req, res) => {
    let {email, password} = req.body;

    // 영어, 숫자 최소 1자리
    const emailRegex = /^[a-zA-Z0-9]+$/;
    // 영어, 숫자 최소 1자리
    const passwordRegex = /^[a-zA-Z0-9]+$/;

    if (
        emailRegex.test(email) === false ||
        passwordRegex.test(password) === false
    ) {
        return res.send({
            isSuccess: false,
            message: "email, password 는 숫자와 영어만 입력 가능합니다.",
        });
    }

    // 비밀번호 암호화
    const result = await crypto.pbkdf2Sync(
        password,
        process.env.SALT_KET,
        50,
        100,
        "sha512"
    );

    const user = await userRepository.login(email, result.toString("base64"));

    if (!user){
        return res.send({
            isSuccess: false,
            message: "일치하는 회원이 없습니다.",
        });
    }

    const token = await jwt.jwtSign({id: user.id});

    res.send({
        isSuccess: true,
        userId : user.id,
        access_token: token,
    });
}
