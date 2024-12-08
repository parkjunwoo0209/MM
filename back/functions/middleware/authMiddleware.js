const { db } = require("../firebaseConfig");

const isLoggedIn = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(401).json({ error: "로그인이 필요한 서비스입니다." });
    }

    // Users 컬렉션에서 해당 이메일이 존재하는지 확인
    const usersRef = db.collection("Users");
    const snapshot = await usersRef.where("email", "==", email).get();

    if (snapshot.empty) {
      return res.status(401).json({ error: "로그인이 필요한 서비스입니다." });
    }

    // 사용자 정보를 request 객체에 저장
    const userData = snapshot.docs[0].data();
    req.user = userData;
    next();
  } catch (error) {
    console.error("Auth check error:", error);
    return res.status(500).json({ error: "인증 확인 중 오류가 발생했습니다." });
  }
};

module.exports = { isLoggedIn }; 