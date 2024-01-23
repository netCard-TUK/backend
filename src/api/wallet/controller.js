const walletRepository = require("./repository");
const userRepository = require("../user/repogitory");
const cardRepository = require("../cards/repogitory");

exports.toggle = async (req, res) => {
    let {userId, cardId} = req.body;

    // 숫자 정규식
    const regExp = /^[0-9]+$/;

    // 숫자 정규식
    let isIntUserId = regExp.test(userId);
    let isIntCardId = regExp.test(cardId);

    // userId가 숫자형이 아닐 경우
    if (
        !userId || !cardId ||
        !isIntUserId || !isIntCardId
    ) {
        return res.send({
            isSuccess: false,
            message: "userId, cardId는 숫자형으로 입력해주세요",
        });
    }

    userId = Number(userId);
    cardId = Number(cardId);

    const tokenUserId = req.user.id;

    // 토큰 유저 아이디와 요청 유저 아이디가 다를 경우
    if (tokenUserId !== userId) {
        return res.send({
            isSuccess: false,
            message: "토큰 유저 아이디와 요청 유저 아이디가 다릅니다.",
        });
    }

    // 유저 아이디로 유저 찾기
    const user = await userRepository.show_user(userId);
    if (!user) {
        return res.send({
            isSuccess: false,
            message: "존재하지 않는 유저입니다.",
        });
    }

    // 명함 아이디로 명함 찾기
    const card = await cardRepository.show(cardId);
    if (!card) {
        return res.send({
            isSuccess: false,
            message: "존재하지 않는 명함입니다.",
        });
    }

    // 유저 아이디와 명함 아이디로 명함 지갑 찾기
    const wallet = await walletRepository.findByUserIdCardId(userId, cardId);
    if (wallet) {
        // 만약 명함 지갑에 있다면 명함지갑에서 삭제
        const {affectedRows} = await walletRepository.delete(userId, cardId);
        return res.send({
            isSuccess: true,
            message: "삭제",
        })
    } else {
        // 없다면 명함 지갑에 추가
        const {affectedRows} = await walletRepository.register(userId, cardId);
        return res.send({
            isSuccess: true,
            message: "등록",
        })
    }
};

exports.findAllByUserId = async (req, res) => {
    let userId = req.params.userId;
    let page = req.query.page;
    let size = req.query.size;

    // 숫자 정규식
    const regExp = /^[0-9]+$/;

    // page, size가 숫자형이 아닐 경우
    if (
        !page || !size ||
        !regExp.test(page) || !regExp.test(size)
    ) {
        return res.send({
            isSuccess: false,
            message: "page, size는 숫자형으로 입력해주세요",
        });
    }
    page = Number(page);
    size = Number(size);

    // page 또는 size가 0 이하일 경우
    if (page < 0 || size < 0) {
        return res.send({
            isSuccess: false,
            message: "page 또는 size는 0 이하로 입력할 수 없습니다.",
        });
    }

    // 숫자 정규식
    let isIntUserId = regExp.test(userId);

    // userId가 숫자형이 아닐 경우
    if (!isIntUserId) {
        return res.send({
            isSuccess: false,
            message: "userId는 숫자형으로 입력해주세요",
        });
    }

    userId = Number(userId);

    // token 유저 아이디와 요청 유저 아이디가 다를 경우
    if (req.user.id !== userId) {
        return res.send({
            isSuccess: false,
            message: "토큰 유저 아이디와 요청 유저 아이디가 다릅니다.",
        });
    }

    // 유저 아이디로 유저 찾기
    const user = await userRepository.show_user(userId);
    if (!user) {
        return res.send({
            isSuccess: false,
            message: "존재하지 않는 유저입니다.",
        });
    }

    // 유저 아이디로 명함 지갑 찾기
    let wallets = await walletRepository.findAllByUserId(userId, page, size);

    return res.send({
        isSuccess: true,
        cards: wallets,
    })
}