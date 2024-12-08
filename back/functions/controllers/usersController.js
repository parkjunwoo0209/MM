// MM/functions/controllers/usersController.js

const { db } = require("../firebaseConfig");

// 사용자 등록하기
exports.register = async (req, res) => {
  try {
    const { email, passwd } = req.body;

    if (!email || !passwd) {
      return res.status(400).json({ error: "이메일과 비밀번호를 입력해주세요." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "올바른 이메일 형식이 아닙니다." });
    }

    // 이메일 중복 확인
    const snapshot = await db.collection("Users").where("email", "==", email).get();
    if (!snapshot.empty) {
      return res.status(409).json({ error: "이미 등록된 이메일입니다." });
    }

    await db.collection("Users").add({ email, passwd });
    res.status(201).json({ message: "회원가입이 완료되었습니다." });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "회원가입 중 오류가 발생했습니다." });
  }
};

// 사용자 로그인 처리
exports.login = async (req, res) => {
  try {
    const { email, passwd } = req.body;
    
    if (!email || !passwd) {
      return res.status(400).json({ error: "이메일과 비밀번호를 입력해주세요." });
    }

    // Users 컬렉션에서 해당 이메일과 비밀번호로 사용자 확인
    const usersRef = db.collection("Users");
    const snapshot = await usersRef
      .where("email", "==", email)
      .where("passwd", "==", passwd)
      .get();

    if (snapshot.empty) {
      return res.status(401).json({ error: "이메일 또는 비밀번호가 일치하지 않습니다." });
    }

    // 로그인 성공
    res.json({ 
      success: true, 
      message: "로그인 성공",
      user: {
        email: email
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "로그인 중 오류가 발생했습니다." });
  }
};

// 사용자 정보 조회하기
exports.getProfile = async (req, res) => {
  try {
    const { uid } = req.params;
    if (!uid) {
      return res.status(400).send("User ID is required");
    }
    const result = await usersService.getUserProfile(uid);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching user profile:", error.message);
    res.status(500).send(`Error fetching user profile: ${error.message}`);
  }
};